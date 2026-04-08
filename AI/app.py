from chatbot import ask_AI
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Query(BaseModel):
    video_id : str
    question : str
    
@app.post('/ask')
def ask(q: Query):
    answer = ask_AI(q.video_id, q.question)
    return {
        "answer" : answer
    }