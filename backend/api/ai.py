"""
backend/api/ai.py
=================
Endpoints de IA: análise de imóvel (legado) e chat global contextual (novo).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from backend.services.ai_agent import analyze_property_with_ai, chat_with_context

router = APIRouter()


# ---------------------------------------------------------------------------
# Endpoint legado — análise de imóvel específico
# ---------------------------------------------------------------------------

class AIAnalysisRequest(BaseModel):
    property_data: Dict[str, Any]
    user_question: Optional[str] = None


@router.post("/analyze")
def ai_analyze_property(request: AIAnalysisRequest):
    """Realiza análise de um imóvel ou responde chat usando IA Agno."""
    try:
        result = analyze_property_with_ai(request.property_data, request.user_question)
        return {"analysis": result}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro ao processar análise com IA: {e}")


# ---------------------------------------------------------------------------
# Endpoint novo — chat global contextual
# ---------------------------------------------------------------------------

class ChatHistoryItem(BaseModel):
    role: str   # "user" | "ai"
    text: str


class ChatRequest(BaseModel):
    message: str
    page_context: Dict[str, Any] = {}
    history: List[ChatHistoryItem] = []


@router.post("/chat")
def ai_global_chat(request: ChatRequest):
    """
    Chat global do HabitaData AI.
    Recebe a mensagem do usuário, o contexto da tela atual e o histórico da conversa.
    Retorna uma resposta contextual enriquecida com dados reais da plataforma.
    """
    try:
        history_dicts = [item.model_dump() for item in request.history]
        result = chat_with_context(
            message=request.message,
            page_context=request.page_context,
            history=history_dicts,
        )
        return {"reply": result}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro no chat global: {e}")

