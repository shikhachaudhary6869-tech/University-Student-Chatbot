from fastapi import FastAPI
from pydantic import BaseModel
from pathlib import Path
import joblib

app = FastAPI(title="Student Intent Classifier API")

model_path = Path(__file__).with_name("student_intent_model.joblib")
model = joblib.load(model_path)

class QuestionRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "Student ML API is running"}

@app.post("/predict")
def predict(request: QuestionRequest):
    question = request.question.strip()

    if not question:
        return {"error": "Question cannot be empty"}

    category = model.predict([question])[0]

    return {
        "question": question,
        "category": category
    }
