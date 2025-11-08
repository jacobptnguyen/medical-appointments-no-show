import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(title="Medical Appointments No-Show Prediction API")

# Enable CORS for frontend
allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and scaler
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "model.pkl"
SCALER_PATH = BASE_DIR / "models" / "scaler.pkl"
LABEL_ENCODER_PATH = BASE_DIR / "models" / "label_encoder.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
    with open(LABEL_ENCODER_PATH, "rb") as f:
        label_encoder = pickle.load(f)
except FileNotFoundError as e:
    print(f"Warning: Model file not found: {e}")
    model = None
    scaler = None
    label_encoder = None

# Define input schema
class PredictionRequest(BaseModel):
    Gender: int  # 0 = Female, 1 = Male
    Age: int
    Neighbourhood: int  # Label encoded
    Scholarship: int  # 0 or 1
    Hipertension: int  # 0 or 1
    Diabetes: int  # 0 or 1
    Alcoholism: int  # 0 or 1
    Handcap: int  # 0 or 1 (or more)
    SMS_received: int  # 0 or 1
    WaitDays: int  # Days between scheduled and appointment

class PredictionResponse(BaseModel):
    prediction: int  # 0 = Show, 1 = No-Show
    probability: float  # Probability of No-Show

@app.get("/")
def read_root():
    return {"message": "Medical Appointments No-Show Prediction API"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "label_encoder_loaded": label_encoder is not None
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Convert input to DataFrame with correct column order
    feature_order = [
        'Gender', 'Age', 'Neighbourhood', 'Scholarship', 'Hipertension',
        'Diabetes', 'Alcoholism', 'Handcap', 'SMS_received', 'WaitDays'
    ]
    
    input_data = pd.DataFrame([[
        request.Gender,
        request.Age,
        request.Neighbourhood,
        request.Scholarship,
        request.Hipertension,
        request.Diabetes,
        request.Alcoholism,
        request.Handcap,
        request.SMS_received,
        request.WaitDays
    ]], columns=feature_order)
    
    # Scale the input
    input_scaled = scaler.transform(input_data)
    
    # Make prediction
    prediction = model.predict(input_scaled)[0]
    probability = model.predict_proba(input_scaled)[0][1]  # Probability of No-Show
    
    return PredictionResponse(
        prediction=int(prediction),
        probability=float(probability)
    )

@app.get("/neighbourhoods")
def get_neighbourhoods():
    """Get list of available neighbourhoods (for frontend dropdown)"""
    if label_encoder is None:
        raise HTTPException(status_code=503, detail="Label encoder not loaded")
    
    # Return neighbourhoods as list of {id, name} pairs
    neighbourhoods = [
        {"id": i, "name": name} 
        for i, name in enumerate(label_encoder.classes_)
    ]
    return {"neighbourhoods": neighbourhoods}

