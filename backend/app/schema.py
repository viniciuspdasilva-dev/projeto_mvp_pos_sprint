from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ApiSchema(BaseModel):
    age: int = Field(..., ge=1, le=120, examples=[30], description="Idade do paciente")
    anaemia: int = Field(..., ge=0, le=1, examples=[1], description="Possui anemia? 0=Não, 1=Sim")
    creatinine_phosphokinase: int = Field(..., ge=0, examples=[245], description="Nível de creatinina fosfoquinase")
    diabetes: int = Field(..., ge=0, le=1, examples=[0], description="Possui diabetes? 0=Não, 1=Sim")
    ejection_fraction: int = Field(..., ge=1, le=100, examples=[38], description="Fração de ejeção")
    high_blood_pressure: int = Field(..., ge=0, le=1, examples=[1], description="Hipertensão? 0=Não, 1=Sim")
    platelets: float = Field(..., gt=0, examples=[263358.03], description="Contagem de plaquetas")
    serum_creatinine: float = Field(..., gt=0, examples=[1.1], description="Creatinina sérica")
    serum_sodium: int = Field(..., ge=0, examples=[136], description="Sódio sérico")
    sex: int = Field(..., ge=0, le=1, examples=[0], description="Sexo biológico: 0=Feminino, 1=Masculino")
    smoking: int = Field(..., ge=0, le=1, examples=[0], description="Fumante? 0=Não, 1=Sim")
    time: int = Field(..., ge=0, examples=[120], description="Tempo de acompanhamento em dias")


class PredictionResponse(BaseModel):
    prediction: int = Field(..., examples=[1], description="Classe prevista")
    label: str = Field(..., examples=["alto risco"], description="Risco alto ou baixo")
    probability: Optional[float] = Field(None, examples=[0.81], description="Probabilidade estimada para a classe positiva")


class PredictionOut(BaseModel):
    id: int
    age: int
    anaemia: int
    creatinine_phosphokinase: int
    diabetes: int
    ejection_fraction: int
    high_blood_pressure: int
    platelets: float
    serum_creatinine: float
    serum_sodium: int
    sex: int
    smoking: int
    time: int

    prediction: int
    probability: Optional[float]
    created_at: datetime

    label: str

    class Config:
        from_attributes = True

class TimelinePredictionResponse(BaseModel):
    date: str
    positive: int
    negative: int