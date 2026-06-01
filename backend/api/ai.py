from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.services.ai_agent import analyze_property_with_ai

router = APIRouter()

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
