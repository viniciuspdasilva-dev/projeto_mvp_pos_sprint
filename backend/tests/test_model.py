import sys

import joblib
import pandas as pd
from pathlib import Path
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.metrics import recall_score, precision_score, f1_score
from app.main import app

DATA_URL = "https://raw.githubusercontent.com/viniciuspdasilva-dev/projeto_mvp_pos_sprint/refs/heads/main/heart_failure_clinical_records_dataset.csv"

CURRENT_FILE = Path(__file__).resolve()
TESTS_DIR = CURRENT_FILE.parent
PROJECT_ROOT = TESTS_DIR.parent
sys.path.append(str(PROJECT_ROOT))

MODEL_PATH = PROJECT_ROOT / "app" / "model" / "modelo_mvp_vf.pkl"


def test_model_loads_successfully():
    model = joblib.load(MODEL_PATH)
    assert model is not None


def test_model_accuracy_threshold():
    assert MODEL_PATH.exists(), f"Modelo não encontrado em: {MODEL_PATH}"

    df = pd.read_csv(DATA_URL)

    X = df.drop("DEATH_EVENT", axis=1)
    y = df["DEATH_EVENT"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=10, stratify=y
    )

    model = joblib.load(MODEL_PATH)
    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    assert accuracy >= 0.75, f"Acurácia abaixo do esperado: {accuracy:.4f}"


def test_model_recall_threshold():
    df = pd.read_csv(DATA_URL)

    X = df.drop("DEATH_EVENT", axis=1)
    y = df["DEATH_EVENT"]

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.20, random_state=10, stratify=y
    )

    model = joblib.load(MODEL_PATH)
    y_pred = model.predict(X_test)

    recall = recall_score(y_test, y_pred)

    assert recall >= 0.70, f"Recall abaixo do esperado: {recall:.4f}"

def test_model_precision_threshold():
    df = pd.read_csv(DATA_URL)

    X = df.drop("DEATH_EVENT", axis=1)
    y = df["DEATH_EVENT"]

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.20, random_state=10, stratify=y
    )

    model = joblib.load(MODEL_PATH)
    y_pred = model.predict(X_test)

    precision = precision_score(y_test, y_pred)

    assert precision >= 0.70, f"Precision abaixo do esperado: {precision:.4f}"

def test_model_f1_threshold():
    df = pd.read_csv(DATA_URL)

    X = df.drop("DEATH_EVENT", axis=1)
    y = df["DEATH_EVENT"]

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.20, random_state=10, stratify=y
    )

    model = joblib.load(MODEL_PATH)
    y_pred = model.predict(X_test)

    f1 = f1_score(y_test, y_pred)

    assert f1 >= 0.70, f"F1-score abaixo do esperado: {f1:.4f}"

def test_prediction_length_matches_input():
    df = pd.read_csv(DATA_URL)

    X = df.drop("DEATH_EVENT", axis=1)
    sample = X.head(10)

    model = joblib.load(MODEL_PATH)
    y_pred = model.predict(sample)

    assert len(y_pred) == 10

def test_predictions_are_binary():
    df = pd.read_csv(DATA_URL)

    X = df.drop("DEATH_EVENT", axis=1)
    sample = X.head(20)

    model = joblib.load(MODEL_PATH)
    y_pred = model.predict(sample)

    valid_classes = {0, 1}
    assert set(y_pred).issubset(valid_classes), f"Classes inesperadas encontradas: {set(y_pred)}"

def test_single_prediction_works():
    df = pd.read_csv(DATA_URL)

    X = df.drop("DEATH_EVENT", axis=1)
    sample = X.iloc[[0]]

    model = joblib.load(MODEL_PATH)
    y_pred = model.predict(sample)

    assert len(y_pred) == 1
    assert y_pred[0] in [0, 1]

def test_predict_proba_returns_valid_range():
    df = pd.read_csv(DATA_URL)

    X = df.drop("DEATH_EVENT", axis=1)
    sample = X.head(5)

    model = joblib.load(MODEL_PATH)

    assert hasattr(model, "predict_proba"), "Modelo não suporta predict_proba"

    probs = model.predict_proba(sample)

    assert probs.shape[0] == 5
    for row in probs:
        assert 0.0 <= row[0] <= 1.0
        assert 0.0 <= row[1] <= 1.0
        assert round(row[0] + row[1], 6) == 1.0

from fastapi.testclient import TestClient

client = TestClient(app)

def test_predict_endpoint_returns_200():
    payload = {
        "age": 60,
        "anaemia": 1,
        "creatinine_phosphokinase": 245,
        "diabetes": 0,
        "ejection_fraction": 38,
        "high_blood_pressure": 1,
        "platelets": 263358.03,
        "serum_creatinine": 1.1,
        "serum_sodium": 136,
        "sex": 1,
        "smoking": 0,
        "time": 120
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 200

def test_predict_endpoint_rejects_invalid_payload():
    payload = {
        "age": -10,
        "anaemia": 3,
        "creatinine_phosphokinase": 245,
        "diabetes": 0,
        "ejection_fraction": 38,
        "high_blood_pressure": 1,
        "platelets": 263358.03,
        "serum_creatinine": 1.1,
        "serum_sodium": 136,
        "sex": 1,
        "smoking": 0,
        "time": 120
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 422