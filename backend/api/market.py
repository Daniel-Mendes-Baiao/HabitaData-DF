"""
backend/api/market.py
=====================
Rotas para Inteligência de Mercado.
"""

from fastapi import APIRouter, Query

import analytics as an
from backend.services.analytics_adapter import df_to_dict

router = APIRouter()


@router.get("/evolution")
def get_market_evolution(regiao_id: int | None = None):
    """Evolução do mercado ao longo do tempo (n_imoveis, valor_medio, mediana)."""
    df = an.evolucao_mercado(id_regiao=regiao_id)
    return {"data": df_to_dict(df)}


@router.get("/growth")
def get_market_growth(regiao_id: int | None = None):
    """Crescimento anual do mercado (% YoY)."""
    df = an.crescimento_anual_mercado(id_regiao=regiao_id)
    return {"data": df_to_dict(df)}


@router.get("/price_distribution")
def get_price_distribution(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Distribuição de valorização (CAGR) de todos os imóveis."""
    df = an.distribuicao_valorizacao(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}
