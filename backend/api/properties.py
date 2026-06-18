"""
backend/api/properties.py
=========================
Rotas para o Explorador de Ativos Imobiliários.

ATENÇÃO: As rotas estáticas (/top/appreciated, /top/depreciated)
DEVEM vir antes da rota dinâmica (/{imovel_id}). O FastAPI tenta
converter o segmento de path para `int` na ordem de registro — se
/{imovel_id} viesse primeiro, a string "top" causaria um 422.
"""

from fastapi import APIRouter, HTTPException, Query

import analytics as an
from backend.services.analytics_adapter import df_to_dict, scalar_to_json

router = APIRouter()


# ---------------------------------------------------------------------------
# Rotas estáticas — devem vir ANTES de /{imovel_id}
# ---------------------------------------------------------------------------

@router.get("/top/appreciated")
def get_top_appreciated(
    limit: int = Query(10, ge=1, le=100),
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025),
):
    """Retorna os N imóveis com maior CAGR (mais valorizados) no período."""
    df = an.top_valorizados(limit, ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


@router.get("/top/depreciated")
def get_top_depreciated(
    limit: int = Query(10, ge=1, le=100),
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025),
):
    """Retorna os N imóveis com menor CAGR (desvalorizados ou baixo rendimento) no período."""
    df = an.top_desvalorizados(limit, ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


# ---------------------------------------------------------------------------
# Rota de listagem geral
# ---------------------------------------------------------------------------

@router.get("/")
def list_properties():
    """Retorna todos os imóveis com seus metadados básicos e último valor estimado."""
    df = an.listar_imoveis()
    return {"data": df_to_dict(df)}


# ---------------------------------------------------------------------------
# Rota dinâmica — deve vir DEPOIS das rotas estáticas
# ---------------------------------------------------------------------------

@router.get("/{imovel_id}")
def get_property_details(imovel_id: int):
    """
    Retorna o detalhamento completo de um imóvel:
    - Metadados (região, metragem, quartos, banheiros, ano de entrega, valor inicial)
    - Histórico anual de valores estimados com variação YoY
    - CAGR e valorização percentual total
    """
    df = an.evolucao_imovel(imovel_id)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Imóvel #{imovel_id} não encontrado.")

    first = df.iloc[0]
    metadata = {
        "id_imovel":   imovel_id,
        "nome_regiao": first.get("nome_regiao"),
        "metragem":    scalar_to_json(first.get("metragem")),
        "quartos":     scalar_to_json(first.get("quartos")),
        "banheiros":   scalar_to_json(first.get("banheiros")),
        "ano_entrega": scalar_to_json(first.get("ano_entrega")),
        "valor_inicial": scalar_to_json(first.get("valor_inicial")),
    }

    return {
        "metadata": metadata,
        "history":  df_to_dict(df[["ano", "valor_estimado", "variacao_yoy_pct"]]),
        "cagr_pct": scalar_to_json(an.cagr_imovel(imovel_id)),
        "total_appreciation_pct": scalar_to_json(an.valorizacao_percentual(imovel_id)),
    }
