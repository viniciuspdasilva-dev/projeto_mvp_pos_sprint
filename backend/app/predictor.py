import joblib
from pathlib import Path

import pandas as pd

MODEL_PATH = Path(__file__).parent / "model" / "modelo_mvp_vf.pkl"
model = joblib.load(MODEL_PATH)

FEATURES = [
    "age",
    "anaemia",
    "creatinine_phosphokinase",
    "diabetes",
    "ejection_fraction",
    "high_blood_pressure",
    "platelets",
    "serum_creatinine",
    "serum_sodium",
    "sex",
    "smoking",
    "time",
]

def predict(data: dict):
    missing = [feature for feature in FEATURES if feature not in data]
    if missing:
        raise ValueError(f"Campos obrigatórios ausentes: {', '.join(missing)}")

    # Constrói uma única linha com as features esperadas
    df = pd.DataFrame([[data[feature] for feature in FEATURES]], columns=FEATURES)

    prediction = int(model.predict(df)[0])

    probability = None
    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(df)[0][1])

    return {
        "prediction": prediction,
        "probability": probability,
        "label": "alto risco" if prediction == 1 else "baixo risco",
    }