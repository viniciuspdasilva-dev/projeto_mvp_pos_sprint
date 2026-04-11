from datetime import datetime

from sqlalchemy import Column, Integer, Float, DateTime

from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer, nullable=False)
    anaemia = Column(Integer, nullable=False)
    creatinine_phosphokinase = Column(Integer, nullable=False)
    diabetes = Column(Integer, nullable=False)
    ejection_fraction = Column(Integer, nullable=False)
    high_blood_pressure = Column(Integer, nullable=False)
    platelets = Column(Float, nullable=False)
    serum_creatinine = Column(Float, nullable=False)
    serum_sodium = Column(Integer, nullable=False)
    sex = Column(Integer, nullable=False)
    smoking = Column(Integer, nullable=False)
    time = Column(Integer, nullable=False)
    prediction = Column(Integer, nullable=False)
    probability = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.now())