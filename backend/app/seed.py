import random
from datetime import datetime, timedelta

import numpy as np
from sqlalchemy.orm import Session

from app.models import Prediction
from app.predictor import predict


def generate_random_date(n=10):
    np.random.seed(42)
    base_date = datetime.utcnow()
    data_list = []

    for _ in range(n):
        data = {
            "age": int(np.random.randint(40, 95)),
            "anaemia": int(np.random.randint(0, 2)),
            "creatinine_phosphokinase": int(np.random.randint(23, 800)),
            "diabetes": int(np.random.randint(0, 2)),
            "ejection_fraction": int(np.random.randint(15, 60)),
            "high_blood_pressure": int(np.random.randint(0, 2)),
            "platelets": float(np.random.randint(100000, 500000)),
            "serum_creatinine": float(np.round(np.random.uniform(0.5, 5.0), 2)),
            "serum_sodium": int(np.random.randint(120, 150)),
            "sex": int(np.random.randint(0, 2)),
            "smoking": int(np.random.randint(0, 2)),
            "time": int(np.random.randint(1, 300)),
            "created_at": base_date - timedelta(days=np.random.randint(0, 30))
        }
        data_list.append(data)
    return data_list


def gerar_data_aleatoria(data_inicio, data_fim):
    """Gera uma data aleatória entre duas datas (formato string YYYY-MM-DD)"""

    # Converter strings para objetos datetime
    fmt = '%Y-%m-%d'
    dt_inicio = datetime.strptime(data_inicio, fmt)
    dt_fim = datetime.strptime(data_fim, fmt)

    # Calcular a diferença em dias
    diferenca = dt_fim - dt_inicio
    dias_totais = diferenca.days

    # Gerar número de dias aleatórios para adicionar
    dias_aleatorios = random.randint(0, dias_totais)

    # Criar a nova data
    data_aleatoria = dt_inicio + timedelta(days=dias_aleatorios)

    return data_aleatoria.strftime(fmt)

def seed(db: Session, n=30):
    existing = db.query(Prediction).count()
    if existing > 0:
        return
    for data in generate_random_date(n):
        result = predict(data)
        record = Prediction(
            **data,
            prediction=result["prediction"],
            probability=result["probability"]
        )

        db.add(record)
    db.commit()