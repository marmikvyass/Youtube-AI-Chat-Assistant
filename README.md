🎥 YouTube AI Chat Assistant

An AI-powered application that lets you chat with any YouTube video.
Paste a video link, and the app extracts the transcript, builds a RAG pipeline, and answers questions using LLMs.

✨ Features

1. Chat with any YouTube video

2. Ask questions about video content

3. Generate summaries

4. Extract key points

5. Explain concepts simply

6. Generate structured notes

7. Multi-language transcript support (auto-translated to English)

8. RAG-based accurate answers

9. Fast responses using Groq LLM

10. Clean responsive UI

🧠 How It Works

Step-1 User pastes a YouTube video URL

Step-2 Transcript is extracted from the video

Step-3 Transcript is chunked into smaller parts

Step-4 Text is translated to English (if needed)

Step-5 Embeddings generated using Cohere

Step-6 Stored in FAISS vector database

Step-7 User asks a question

Step-8 Relevant chunks retrieved using similarity search

Step-9 Context sent to LLM

Step-10 AI returns grounded answer

🛠 Tech Stack

Frontend

React

Tailwind CSS

Backend

Node.js

Express

AI Service

FastAPI

LangChain

Groq

Cohere Embeddings

FAISS

YouTube Transcript API

📁 Project Structure

Youtube-AI-Chat-Assistant
│
├── client      # React frontend
├── server      # Node backend
├── AI          # FastAPI AI service
└── README.md

⚙️ Environment Variables

Create .env inside AI folder

GROQ_API_KEY=your_key

COHERE_API_KEY=your_key

▶️ Run Locally

1. Frontend

cd client

npm install

npm run dev

2. Node Backend

cd server

npm install

npm run dev

3. AI Service

cd AI

pip install -r requirements.txt

uvicorn app:app --reload

💡 Example Use Cases
Summarize long YouTube videos

Learn from tutorials faster

Extract notes from lectures

Ask questions about technical videos

Understand concepts quickly

🚀 Future Improvements
Timestamped answers

Chat history

Export notes

Video chapter detection

Multi-video comparison

Chrome extension

👨‍💻 Author
Marmik Vyas

Generative AI + MERN + RAG Project
