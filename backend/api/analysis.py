"""
backend/api/analysis.py
========================
Endpoints para exploração multivariada e descoberta de padrões (Phase 4).
"""

from fastapi import APIRouter, Query
from typing import Optional

import analytics as an
from backend.services.analytics_adapter import df_to_dict

router = APIRouter()

@router.get("/multivariate")
def get_multivariate_exploration(
    ano: int = Query(2021)
):
    """Retorna o dataset para o ano selecionado (range 5 anos para CAGR)."""
    df = an.get_multivariate_data(ano - 5, ano)
    return {"data": df_to_dict(df)}

@router.get("/correlation-matrix")
def get_correlation_matrix(
    ano: int = Query(2021)
):
    """Retorna a matriz de correlação para o ano selecionado."""
    df = an.get_correlation_matrix(ano - 5, ano)
    
    # A matriz tem nomes de variáveis no índice e colunas.
    # Vamos converter para um formato de "heatmap" compatível com Plotly:
    # { z: [[...], [...]], x: [...], y: [...] }
    
    matrix = df.values.tolist()
    labels = df.columns.tolist()
    
    return {
        "z": matrix,
        "x": labels,
        "y": labels
    }

@router.get("/factors-impact")
def get_factors_impact(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Exploração direta de impacto de fatores urbanos na valorização."""
    # Reutilizando funções existentes mas agregadas para a nova dashboard
    crime = an.impacto_criminalidade(ano_inicio, ano_fim)
    infra = an.impacto_infraestrutura(ano_inicio, ano_fim)
    
    return {
        "criminality": df_to_dict(crime),
        "infrastructure": df_to_dict(infra)
    }

@router.get("/regional-comparison")
def get_regional_comparison(
    ano: int = Query(2021)
):
    """Retorna dados agregados por região para um ano específico."""
    df = an.get_regional_comparison_data(ano - 5, ano)
    return {"data": df_to_dict(df)}

@router.get("/growth-indices")
def get_growth_indices(
    regioes: Optional[str] = Query(None)  # CSV de nomes de regiões
):
    """Retorna a evolução temporal (Base 100) das métricas urbanas."""
    reg_list = regioes.split(",") if regioes else None
    df = an.get_temporal_growth_indices(reg_list)
    return {"data": df_to_dict(df)}
