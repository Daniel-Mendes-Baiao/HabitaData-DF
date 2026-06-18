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


@router.get("/summary")
def get_dashboard_summary():
    """
    Resumo executivo para o Dashboard Central.
    Retorna em uma única chamada os 4 indicadores principais:
      - cagr_medio_pct   : CAGR médio de mercado (2010–2024)
      - custo_m2_medio   : Custo médio do m² em 2024 (R$)
      - indice_seguranca : Índice de segurança médio das regiões (0–100)
      - total_imoveis    : Total de imóveis na base de dados
    """
    from analytics.db import query as db_query
    import math

    # CAGR médio de todas as regiões (2010–2024)
    df_appreciation = an.valorizacao_media_por_regiao(2010, 2024)
    cagr_values = [
        v for v in df_appreciation["cagr_medio_pct"].tolist()
        if v is not None and not math.isnan(v)
    ]
    cagr_medio = sum(cagr_values) / len(cagr_values) if cagr_values else None

    # Custo médio do m² em 2024 (direto da tabela custo_m2_regional)
    df_m2 = db_query(
        "SELECT AVG(custo_m2) AS custo_m2_medio FROM custo_m2_regional WHERE ano = 2024"
    )
    custo_m2 = float(df_m2.iloc[0]["custo_m2_medio"]) if not df_m2.empty else None

    # Índice de segurança: inverso do crime médio, escala 0–100
    df_crime = an.impacto_criminalidade(2010, 2024)
    crime_values = [
        v for v in df_crime["indice_criminalidade_medio"].tolist()
        if v is not None and not math.isnan(v)
    ]
    indice_seguranca = (1 - sum(crime_values) / len(crime_values)) * 100 if crime_values else None

    # Total de imóveis
    df_imoveis = an.listar_imoveis()
    total_imoveis = len(df_imoveis) if not df_imoveis.empty else 0

    return {
        "cagr_medio_pct":   round(cagr_medio, 2)  if cagr_medio is not None else None,
        "custo_m2_medio":   round(custo_m2, 0)     if custo_m2 is not None   else None,
        "indice_seguranca": round(indice_seguranca, 1) if indice_seguranca is not None else None,
        "total_imoveis":    total_imoveis,
    }
