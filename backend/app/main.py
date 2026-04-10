from typing import List

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models import Prediction
from app.predictor import predict
from app.schema import ApiSchema, PredictionResponse, PredictionOut
from app.seed import seed

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Heart Failure Predictor API",
   description= """
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
        probability=result["probability"]
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
        ]
    }

@app.get(
    "/predictions",
tags=["Dashboard"],
    summary="Lista todas as predições",
    description="Retorna todas as predições armazenadas no banco de dados.",
    response_model=List[PredictionOut]
)
def list_predictions(db: Session = Depends(get_db)):
    registers = db.query(Prediction).order_by(Prediction.created_at.desc()).all()

    resultado = []
    for r in registers:
        item = {
            **r.__dict__,
            "probability": round(r.probability * 100, 2),
            "label": "alto risco" if r.prediction == 1 else "baixo risco"
        }
        resultado.append(item)
    return resultado