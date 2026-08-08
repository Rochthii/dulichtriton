from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import json

# Add root project dir to python path so we can import tourism_ai_core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tourism_ai_core.orchestrator.ai_orchestrator import AIOrchestrator

app = FastAPI(title="Tri Tôn Tourism AI - RAG API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev. Update for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = AIOrchestrator()

class ChatRequest(BaseModel):
    query: str
    session_id: str = "default_session"

@app.post("/api/v1/chat/query")
async def chat_query(request: ChatRequest):
    try:
        result = await orchestrator.process_user_request(
            session_id=request.session_id,
            user_query=request.query
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}
