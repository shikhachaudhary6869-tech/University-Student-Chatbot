# AI-Powered University Student Support System

## About the Project
This project is an AI-powered chatbot that helps university students get information about academics, examinations, placements, scholarships, library services, and university facilities.

## Features
- AI-powered answers using Gemini API
- Machine Learning-based question classification
- University data stored in JSON files
- Chat history and suggested questions
- Interactive dashboard interface

## Technologies Used
- HTML, CSS, JavaScript
- Node.js and Express.js
- Google Gemini API
- Python and FastAPI
- Scikit-learn
- TF-IDF and Logistic Regression

## Project Structure
- `app.js` - Chatbot backend logic
- `index.js` - Starts the server
- `index.html` - Frontend page
- `style.css` - Dashboard styling
- `script.js` - Frontend interactions
- `data/` - University information
- `ml_model/` - ML model and training code

## How to Run
1. Install dependencies using `npm install`.
2. Add your Gemini API key to a local `.env` file.
3. Start the ML API:

   `python -m uvicorn ml_api:app --app-dir ./ml_model --host 127.0.0.1 --port 8001`

4. In another terminal, start the backend:

   `node index.js`

5. Open the frontend using your configured local setup.

## Security
Never upload API keys or `.env` files to GitHub.
