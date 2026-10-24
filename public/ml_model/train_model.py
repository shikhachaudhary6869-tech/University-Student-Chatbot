
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib
import os

data = {
    "question": [
        "Explain DBMS",
        "What is operating system",
        "Explain data structures",
        "Help me understand Java",
        "Explain computer networks",
        "How should I study for exams",
        "When are my examinations",
        "How can I check exam results",
        "What are the exam rules",
        "How do I prepare for semester exams",
        "How can I prepare for placements",
        "Help me create a resume",
        "Give me interview preparation tips",
        "How do I prepare for aptitude tests",
        "What skills are needed for jobs",
        "How can I apply for a scholarship",
        "Tell me about student financial aid",
        "What scholarships are available",
        "How can I get scholarship information",
        "How do I get financial assistance",
        "Where can I borrow library books",
        "How can I find books in the library",
        "What library services are available",
        "How do I return a library book",
        "Can I access library resources",
        "How do I borrow a library book",
         "How can I issue books from the library",
          "Can students borrow books from the library",
         "What is the process for borrowing books",
         "How do I get a book issued from the library",
        "Which departments are in the college",
        "Tell me about university facilities",
        "Where can I get college information",
        "What student support services exist",
        "Tell me about the university"
    ],
    "intent": [
    "academic", "academic", "academic", "academic", "academic",
    "examination", "examination", "examination", "examination", "examination",
    "placement", "placement", "placement", "placement", "placement",
    "scholarship", "scholarship", "scholarship", "scholarship", "scholarship",
    "library", "library", "library", "library", "library",
    "library", "library", "library", "library", "library",
    "university_info", "university_info", "university_info",
    "university_info", "university_info"
]
    
}

df = pd.DataFrame(data)

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2)
    )),
    ("classifier", LogisticRegression(max_iter=1000))
])

model.fit(df["question"], df["intent"])

model_path = os.path.join(
    os.path.dirname(__file__),
    "student_intent_model.joblib"
)

joblib.dump(model, model_path)

print("Student question classification model trained!")
print("Training examples:", len(df))
print("Categories:", sorted(df["intent"].unique()))
print("Model saved to:", model_path)
