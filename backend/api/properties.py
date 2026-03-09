"""
backend/api/properties.py
=========================
Rotas para Explorador de Imóveis (detalhamento individual).
"""

from fastapi import APIRouter, HTTPException, Query

import analytics as an
from backend.services.analytics_adapter import df_to_dict, scalar_to_json

router = APIRouter()


@router.get("/{imovel_id}")
def get_property_details(imovel_id: int):
    """Histórico de preço, valor estimado e YoY do imóvel."""
    df = an.evolucao_imovel(imovel_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")
    
    # Extrair metadados base a partir do dataframe de evolução
    first_row = df.iloc[0]
    metadata = {
        "id_imovel": imovel_id,
        "nome_regiao": first_row.get("nome_regiao"),
        "metragem": scalar_to_json(first_row.get("metragem")),
        "quartos": scalar_to_json(first_row.get("quartos")),
        "banheiros": scalar_to_json(first_row.get("banheiros")),
        "ano_entrega": scalar_to_json(first_row.get("ano_entrega")),
        "valor_inicial": scalar_to_json(first_row.get("valor_inicial")),
    }
    
    return {
        "metadata": metadata,
        "history": df_to_dict(df[["ano", "valor_estimado", "variacao_yoy_pct"]]),
        "cagr_pct": scalar_to_json(an.cagr_imovel(imovel_id)),
        "total_appreciation_pct": scalar_to_json(an.valorizacao_percentual(imovel_id))
    }


@router.get("/top/appreciated")
def get_top_appreciated(
    limit: int = Query(10, le=100),
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Top N imóveis que mais valorizaram (CAGR)."""
    df = an.top_valorizados(limit, ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


@router.get("/top/depreciated")
def get_top_depreciated(
    limit: int = Query(10, le=100),
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Top N imóveis que mais desvalorizaram (menor CAGR)."""
    df = an.top_desvalorizados(limit, ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}
