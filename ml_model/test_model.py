import joblib
from pathlib import Path

model_path = Path(__file__).with_name("student_intent_model.joblib")
model = joblib.load(model_path)

questions = [
    "How can I prepare for placements?",
    "When are my semester exams?",
    "How do I borrow a library book?",
    "Explain Java programming",
    "How can I apply for a scholarship?",
    "Tell me about my college"
]

for question in questions:
    category = model.predict([question])[0]
    print(f"Question: {question}")
    print(f"Predicted category: {category}")
    print()
