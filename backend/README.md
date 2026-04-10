# 📊 Heart Failure Predictor API

API desenvolvida com FastAPI para predição de risco em pacientes com insuficiência cardíaca,
utilizando um modelo de Machine Learning treinado com Scikit-Learn.

---

## 🚀 Funcionalidades

- Predição de risco cardíaco
- Armazenamento de histórico
- Endpoint para estatísticas
- Documentação com Swagger
- Testes automatizados com PyTest

---

## 🧠 Modelo de Machine Learning

- Problema: Classificação binária (DEATH_EVENT)
- Algoritmos avaliados: KNN, Decision Tree, Naive Bayes, SVM
- Modelo final: SVM + MinMaxScaler
- Métrica: Accuracy ≥ 0.75

---

## 🛠️ Stack

Backend:
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic

Machine Learning:
- Scikit-Learn
- Pandas
- NumPy

Testes:
- PyTest
- HTTPX

Banco:
- SQLite

---

## 📁 Estrutura

```
backend/
├── app/
│   ├── main.py
│   ├── predictor.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── model/
│       └── heart_failure_pipeline.pkl
├── tests/
│   ├── test_model.py
│   └── test_api.py
├── requirements.txt
└── README.md
```

---

## ⚙️ Setup

### Criar ambiente
````bash
python -m venv venv
````

### Ativar

Windows:

````bash
venv\Scripts\activate
````

Linux/Mac:
````bash
source venv/bin/activate
````

### Instalar dependências
````bash
pip install -r requirements.txt
````

---

## ▶️ Rodar API

````bash
uvicorn app.main:app --reload
````

Swagger:
http://127.0.0.1:8000/swagger

---

## 🧪 Testes

````bash
python -m pytest -s -vv
````

---

## 📌 Endpoints
````aiignore
GET /
POST /predict
GET /predictions
GET /stats
````


---

## 🔐 Segurança

- Validação com Pydantic
- Modelo não aprende em tempo real
- Dados minimizados

---

## 📈 Melhorias futuras

- Dashboard avançado
- Autenticação
- Deploy em nuvem
- Retreinamento automático
