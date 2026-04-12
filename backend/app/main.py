from datetime import datetime, timedelta
from typing import List

from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models import Prediction
from app.predictor import predict
from app.schema import ApiSchema, PredictionResponse, PredictionOut, TimelinePredictionResponse
from app.seed import seed

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Heart Failure Predictor API",
    description="""
    API para predição de risco em pacientes com insuficiência cardíaca.

    Funcionalidades:
    - realizar predição com modelo de machine learning;
    - salvar histórico de inferências;
    - consultar estatísticas para gráficos.
    """,
    version="1.0.0"
)


@app.on_event("startup")
def startup_app():
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/infra/seed", tags=["Infra"])
def seed_db():
    db = SessionLocal()
    try:
        seed(db)
        return {"message": "Database seeded"}
    finally:
        db.close()

@app.get("/infra/reset/all", tags=["Infra"])
def reset_db():
    db = SessionLocal()
    try:
        Base.metadata.drop_all(bind=engine)
        return {"message": "Database reset"}
    finally:
        db.close()

@app.get("/", tags=["Health"], summary="Health check")
def health():
    return {"message": "API online"}


@app.post(
    "/predict",
    tags=["Predictions"],
    summary="Realiza uma nova predição",
    description="Recebe os dados clínicos do paciente, executa o modelo de machine learning e retorna a classe prevista.",
    response_model=PredictionResponse
)
def make_prediction(payload: ApiSchema, db: Session = Depends(get_db)):
    data = payload.model_dump()
    result = predict(data)
    new_prediction = Prediction(
        **data,
        prediction=result["prediction"],
        probability=result["probability"],
        created_at=datetime.now()
    )

    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)
    return result


@app.get(
    "/stats",
    tags=["Dashboard"],
    summary="Retorna estatísticas agregadas",
    description="Retorna dados consolidados para alimentar gráficos no front-end."
)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Prediction).count()

    by_class = (
        db.query(Prediction.prediction, func.count(Prediction.id))
        .group_by(Prediction.prediction)
        .all()
    )

    avg_age_by_class = (
        db.query(Prediction.prediction, func.avg(Prediction.age))
        .group_by(Prediction.prediction)
        .all()
    )

    diabetes_by_class = (
        db.query(Prediction.prediction, func.sum(Prediction.diabetes))
        .group_by(Prediction.prediction)
        .all()
    )

    avg_probability = db.query(func.avg(Prediction.probability)).scalar()

    return {
        "total_predictions": total,
        "predictions_by_class": [
            {"prediction": pred, "count": count} for pred, count in by_class
        ],
        "average_age_by_class": [
            {"prediction": pred, "avg_age": float(avg_age)} for pred, avg_age in avg_age_by_class
        ],
        "diabetes_by_class": [
            {"prediction": pred, "diabetes_count": int(count or 0)} for pred, count in diabetes_by_class
        ],
        "average_probability": round(float(avg_probability), 2) if avg_probability is not None else 0
    }


@app.get(
    "/predictions",
    tags=["Dashboard"],
    summary="Lista todas as predições",
    description="Retorna todas as predições armazenadas no banco de dados.",
    response_model=List[PredictionOut]
)
def list_predictions(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    registers = (db
                 .query(Prediction)
                 .order_by(Prediction.created_at.desc())
                 .offset(skip)
                 .limit(limit)
                 .all()
                 )

    resultado = []
    for r in registers:
        item = {
            **r.__dict__,
            "probability": round(r.probability * 100, 2),
            "label": "alto risco" if r.prediction == 1 else "baixo risco"
        }
        resultado.append(item)
    return resultado


@app.get(
    "/stats/timeline",
    tags=["Relatorios"],
    summary="Retorna uma serie temporal de predições",
    description="Retorna uma lista temporaria, contendo o dia e a quantidade positiva e negativa",
    response_model=List[TimelinePredictionResponse]
)
def list_timeline(
        days: int = Query(7),
        db: Session = Depends(get_db)
):
    if days > 30:
        raise HTTPException(status_code=422, detail="Periodo pesquisado não pode ser superior a 30 dias")

    started_day = datetime.now() - timedelta(days=days)
    rows = (
        db.query(
            func.date(Prediction.created_at).label("date"),
            Prediction.prediction.label("prediction"),
            func.count(Prediction.id).label("total")
        )
        .filter(Prediction.created_at >= started_day)
        .group_by(func.date(Prediction.created_at), Prediction.prediction)
        .order_by(func.date(Prediction.created_at))
        .all()
    )

    timeline = {}

    for date, prediction, total in rows:
        date_str = str(date)

        if date_str not in timeline:
            timeline[date_str] = {
                "date": date_str,
                "positive": 0,
                "negative": 0
            }

        if prediction == 1:
            timeline[date_str]["positive"] += total
        else:
            timeline[date_str]["negative"] += total

    return list(timeline.values())
