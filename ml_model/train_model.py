import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib
from pathlib import Path

questions = [
    "Explain DBMS", "What is operating system",
    "Explain data structures", "Help me understand Java",
    "Explain computer networks", "How should I study for exams",
    "When are my examinations", "How can I check exam results",
    "What are the exam rules", "How to prepare for semester exams",
    "How can I prepare for placements", "Help me create a resume",
    "Interview preparation tips", "How to prepare for aptitude tests",
    "What skills are needed for jobs", "How can I apply for a scholarship",
    "Tell me about student financial aid", "What scholarships are available",
    "How to get scholarship information", "How to get financial assistance",
    "Where can I borrow library books", "How to find books in the library",
    "What library services are available", "How do I return a library book",
    "Can I access library resources", "Which departments are in the college",
    "Tell me about university facilities", "Where can I get college information",
    "What student support services exist", "Tell me about the university"
]

labels = [
    "academic", "academic", "academic", "academic", "academic",
    "examination", "examination", "examination", "examination", "examination",
    "placement", "placement", "placement", "placement", "placement",
    "scholarship", "scholarship", "scholarship", "scholarship", "scholarship",
    "library", "library", "library", "library", "library",
    "university_info", "university_info", "university_info",
    "university_info", "university_info"
]

model = Pipeline([
    ("tfidf", TfidfVectorizer(lowercase=True, ngram_range=(1, 2))),
    ("classifier", LogisticRegression(max_iter=1000))
])

model.fit(questions, labels)

model_path = Path(__file__).with_name("student_intent_model.joblib")
joblib.dump(model, model_path)

print("ML model trained successfully!")
print("Training examples:", len(questions))
print("Categories:", sorted(set(labels)))
print("Model saved to:", model_path)
