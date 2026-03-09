"""
backend/api/regions.py
======================
Rotas para Inteligência Regional.
"""

from fastapi import APIRouter, Query

import analytics as an
from backend.services.analytics_adapter import df_to_dict

router = APIRouter()


@router.get("/ranking")
def get_region_ranking(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Ranking de regiões por CAGR médio."""
    df = an.ranking_regioes(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


@router.get("/average_price")
def get_region_average_price(ano: int = Query(2025)):
    """Preço médio por região no ano especificado."""
    df = an.preco_medio_por_regiao(ano)
    return {"data": df_to_dict(df)}


@router.get("/appreciation")
def get_region_appreciation(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Valorização média (CAGR, mediana e std) por região."""
    df = an.valorizacao_media_por_regiao(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}
