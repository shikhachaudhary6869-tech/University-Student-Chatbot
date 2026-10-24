import joblib
from pathlib import Path

model_path = Path(__file__).with_name("student_intent_model.joblib")
model = joblib.load(model_path)

tests = [
    ("How can I prepare for placements?", "placement"),
    ("When are my semester exams?", "examination"),
    ("How do I borrow a library book?", "library"),
    ("Explain Java programming", "academic"),
    ("How can I apply for a scholarship?", "scholarship"),
    ("Tell me about my college", "university_info"),
]

correct = 0
failed_tests = []

for question, expected in tests:
    predicted = model.predict([question])[0]
    result = "PASS" if predicted == expected else "FAIL"

    if predicted == expected:
        correct += 1
    else:
        failed_tests.append((question, expected, predicted))

    print("Question:", question)
    print("Expected:", expected)
    print("Predicted:", predicted)
    print("Result:", result)
    print()

print("Total tests:", len(tests))
print("Correct predictions:", correct)
print("Accuracy:", round(correct / len(tests) * 100, 2), "%")
print("\nFailed Tests:", len(failed_tests))

for question, expected, predicted in failed_tests:
    print("Question:", question)
    print("Expected:", expected)
    print("Predicted:", predicted)
    print()
