"""
analytics/__init__.py
=====================
HabitaData DF — API pública do pacote analytics.

Importa e re-exporta todas as funções analíticas dos sub-módulos,
permitindo acesso direto:

    from analytics import evolucao_imovel, ranking_regioes, impacto_metragem

Módulos:
  - analytics.db       : conexão e query helpers
  - analytics.imoveis  : análises por imóvel
  - analytics.mercado  : análises de mercado e regiões
  - analytics.urbano   : análises urbanas e correlações
"""

# --- Conexão & utilitários ---------------------------------------------------
from analytics.db import DB_PATH, get_connection, query

# --- Análises por imóvel -----------------------------------------------------
from analytics.imoveis import (
    cagr_imovel,
    distribuicao_valorizacao,
    evolucao_imovel,
    top_desvalorizados,
    top_valorizados,
    valorizacao_percentual,
)

# --- Análises de mercado e regiões -------------------------------------------
from analytics.mercado import (
    crescimento_anual_mercado,
    evolucao_mercado,
    preco_medio_por_regiao,
    ranking_regioes,
    valorizacao_media_por_regiao,
)

# --- Análises urbanas e correlações ------------------------------------------
from analytics.urbano import (
    correlacao_custo_m2,
    impacto_criminalidade,
    impacto_distancia_metro,
    impacto_infraestrutura,
    impacto_metragem,
    get_multivariate_data,
    get_regional_comparison_data,
    get_temporal_growth_indices,
    get_correlation_matrix,
)

__all__ = [
    # db
    "DB_PATH",
    "get_connection",
    "query",
    # imoveis
    "evolucao_imovel",
    "valorizacao_percentual",
    "cagr_imovel",
    "top_valorizados",
    "top_desvalorizados",
    "distribuicao_valorizacao",
    # mercado
    "valorizacao_media_por_regiao",
    "ranking_regioes",
    "preco_medio_por_regiao",
    "evolucao_mercado",
    "crescimento_anual_mercado",
    # urbano
    "impacto_metragem",
    "impacto_distancia_metro",
    "impacto_criminalidade",
    "impacto_infraestrutura",
    "correlacao_custo_m2",
    "get_multivariate_data",
    "get_regional_comparison_data",
    "get_temporal_growth_indices",
    "get_correlation_matrix",
]
