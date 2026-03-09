"""
backend/api/geospatial.py
=========================
Rotas para visualizações geoespaciais e análises urbanas
(Deck.gl Layer Data, etc.).
"""

from fastapi import APIRouter, Query

import analytics as an
from backend.services.analytics_adapter import df_to_dict

router = APIRouter()


@router.get("/urban_factors/metragem")
def get_metragem_impact(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Impacto da metragem na valorização (CAGR médio por faixa de m²)."""
    df = an.impacto_metragem(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


@router.get("/urban_factors/metro")
def get_metro_impact(ano: int = Query(2025)):
    """Preço médio vs Distância do Metrô por região no ano especificado."""
    df = an.impacto_distancia_metro(ano)
    return {"data": df_to_dict(df)}


@router.get("/urban_factors/criminality")
def get_criminality_impact(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """CAGR médio por região cruzado com o índice de criminalidade."""
    df = an.impacto_criminalidade(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


@router.get("/urban_factors/infrastructure")
def get_infrastructure_impact(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Score composto de infraestrutura por região/ano vs Valorização."""
    df = an.impacto_infraestrutura(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


@router.get("/urban_factors/cost_m2_correlation")
def get_cost_m2_correlation(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Correlações de Pearson e Spearman do Custo do m² com o Preço Estimado."""
    df = an.correlacao_custo_m2(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


# Nota: O dataset fornecido não possui coordenadas de latitude/longitude.
# Num cenário real de mapa com Deck.gl, esta rota faria um join com GeoPandas
# ou uma tabela de centroides de regiões do IBGE para retornar um FeatureCollection.
@router.get("/map/regions3d")
def get_regions_3d_map_data(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """
    Dados agregados por região prontos para a camada de Extrusão/Hexágono do Deck.gl.
    Inclui: nome, CAGR (para altura da barra) e demais dados (tooltip).
    """
    df_cagr = an.valorizacao_media_por_regiao(ano_inicio, ano_fim)
    df_infra = an.impacto_infraestrutura(ano_fim, ano_fim) # Infra do último ano

    # Mergeando para ter uma view rica (CAGR + Infra Score)
    if not df_infra.empty and not df_cagr.empty:
        df_join = df_cagr.merge(df_infra, on="nome_regiao", how="left")
    else:
        df_join = df_cagr

    return {"data": df_to_dict(df_join)}
