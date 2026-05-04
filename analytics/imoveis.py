"""
analytics/imoveis.py
====================
HabitaData DF — Análises ao nível do imóvel individual.

Funções públicas
----------------
evolucao_imovel(id_imovel)            → evolução anual de preço + variação YoY
valorizacao_percentual(id_imovel)     → % total entre entrega e último dado
cagr_imovel(id_imovel)               → taxa de crescimento anual composto
top_valorizados(n, ano_inicio, ano_fim) → N imóveis com maior CAGR
top_desvalorizados(n, ano_inicio, ano_fim) → N imóveis com pior CAGR
distribuicao_valorizacao(ano_inicio, ano_fim) → CAGR de todos os imóveis
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from analytics.db import query


# ---------------------------------------------------------------------------
# 1. Evolução temporal de um imóvel
# ---------------------------------------------------------------------------

def evolucao_imovel(id_imovel: int) -> pd.DataFrame:
    """
    Retorna a série histórica de valores estimados de um imóvel,
    incluindo a variação percentual ano a ano (YoY).

    Colunas: ano | valor_estimado | variacao_yoy_pct
    """
    sql = """
        SELECT h.ano,
               h.valor_estimado,
               r.nome_regiao,
               i.metragem,
               i.quartos,
               i.banheiros,
               i.ano_entrega,
               i.valor_inicial
          FROM historico_valor_imovel h
          JOIN imoveis i ON i.id_imovel = h.id_imovel
          JOIN regioes r ON r.id_regiao = i.id_regiao
         WHERE h.id_imovel = :id
         ORDER BY h.ano
    """
    df = query(sql, {"id": id_imovel})
    if df.empty:
        return df
    df["variacao_yoy_pct"] = df["valor_estimado"].pct_change() * 100
    return df


# ---------------------------------------------------------------------------
# 2. Valorização percentual total
# ---------------------------------------------------------------------------

def valorizacao_percentual(id_imovel: int) -> float:
    """
    Calcula a valorização percentual total de um imóvel entre
    o ano de entrega (valor_inicial) e o último registro histórico.

    Retorno: float (%) ou NaN se não houver dados suficientes.
    """
    sql = """
        SELECT i.valor_inicial,
               h.valor_estimado AS valor_final,
               h.ano            AS ano_final,
               i.ano_entrega
          FROM imoveis i
          JOIN (
              SELECT id_imovel, valor_estimado, ano
                FROM historico_valor_imovel
               WHERE id_imovel = :id
               ORDER BY ano DESC
               LIMIT 1
          ) h ON h.id_imovel = i.id_imovel
         WHERE i.id_imovel = :id
    """
    df = query(sql, {"id": id_imovel})
    if df.empty or df["valor_inicial"].iloc[0] is None or df["valor_inicial"].iloc[0] == 0:
        return float("nan")
    if df["valor_final"].iloc[0] is None:
        return float("nan")
        
    return (
        (df["valor_final"].iloc[0] - df["valor_inicial"].iloc[0])
        / df["valor_inicial"].iloc[0]
        * 100
    )


# ---------------------------------------------------------------------------
# 3. CAGR de um imóvel
# ---------------------------------------------------------------------------

def cagr_imovel(id_imovel: int) -> float:
    """
    Calcula o CAGR (Compound Annual Growth Rate) de um imóvel.

    Fórmula: CAGR = (valor_final / valor_inicial)^(1/n_anos) - 1

    Retorno: float (%) ou NaN se dados insuficientes (< 2 anos).
    """
    sql = """
        SELECT MIN(ano) AS ano_ini,
               MAX(ano) AS ano_fim,
               MIN(valor_estimado) FILTER (WHERE ano = (SELECT MIN(ano) FROM historico_valor_imovel WHERE id_imovel = :id)) AS v_ini,
               MAX(valor_estimado) FILTER (WHERE ano = (SELECT MAX(ano) FROM historico_valor_imovel WHERE id_imovel = :id)) AS v_fim
          FROM historico_valor_imovel
         WHERE id_imovel = :id
    """
    df = query(sql, {"id": id_imovel})
    if df.empty:
        return float("nan")

    row = df.iloc[0]
    if row["ano_fim"] is None or row["ano_ini"] is None:
        return float("nan")
        
    n = row["ano_fim"] - row["ano_ini"]
    if n <= 0 or row["v_ini"] is None or row["v_ini"] == 0:
        return float("nan")
    return ((row["v_fim"] / row["v_ini"]) ** (1 / n) - 1) * 100


# ---------------------------------------------------------------------------
# Helper interno: calcula CAGR para todos os imóveis em um período
# ---------------------------------------------------------------------------

def _cagr_todos(ano_inicio: int, ano_fim: int) -> pd.DataFrame:
    """
    Retorna DataFrame com CAGR por imóvel no período [ano_inicio, ano_fim].
    Usa SQL para buscar valores de início e fim; calcula CAGR em Python.

    Colunas: id_imovel | nome_regiao | metragem | quartos | banheiros |
             ano_entrega | valor_inicio | valor_fim | n_anos | cagr_pct
    """
    sql = """
        SELECT i.id_imovel,
               r.nome_regiao,
               i.metragem,
               i.quartos,
               i.banheiros,
               i.ano_entrega,
               ini.valor_estimado AS valor_inicio,
               fim.valor_estimado AS valor_fim,
               (fim.ano - ini.ano) AS n_anos
          FROM imoveis i
          JOIN regioes r ON r.id_regiao = i.id_regiao
          -- Primeiro ano com dado >= ano_inicio
          JOIN (
              SELECT id_imovel,
                     MIN(ano) AS ano,
                     MIN(valor_estimado) AS valor_estimado
                FROM historico_valor_imovel
               WHERE ano >= :ano_ini
               GROUP BY id_imovel
          ) ini ON ini.id_imovel = i.id_imovel
          -- Último ano com dado <= ano_fim
          JOIN (
              SELECT id_imovel,
                     MAX(ano) AS ano,
                     MAX(valor_estimado) AS valor_estimado
                FROM historico_valor_imovel
               WHERE ano <= :ano_fim
               GROUP BY id_imovel
          ) fim ON fim.id_imovel = i.id_imovel
         WHERE ini.ano < fim.ano        -- garante pelo menos 1 ano de diferença
    """
    df = query(sql, {"ano_ini": ano_inicio, "ano_fim": ano_fim})
    if df.empty:
        return df

    df["cagr_pct"] = np.where(
        (df["n_anos"] > 0) & (df["valor_inicio"] > 0),
        ((df["valor_fim"] / df["valor_inicio"]) ** (1 / df["n_anos"]) - 1) * 100,
        np.nan,
    )
    return df.dropna(subset=["cagr_pct"])


# ---------------------------------------------------------------------------
# 4. Top N imóveis mais valorizados
# ---------------------------------------------------------------------------

def top_valorizados(
    n: int = 10,
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Retorna os N imóveis com maior CAGR no período informado.

    Colunas: id_imovel | nome_regiao | metragem | cagr_pct | valor_inicio | valor_fim
    """
    df = _cagr_todos(ano_inicio, ano_fim)
    if df.empty:
        return df
    return (
        df.nlargest(n, "cagr_pct")
        .reset_index(drop=True)
    )


# ---------------------------------------------------------------------------
# 5. Top N imóveis mais desvalorizados
# ---------------------------------------------------------------------------

def top_desvalorizados(
    n: int = 10,
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Retorna os N imóveis com menor CAGR (pior desempenho) no período informado.

    Colunas: id_imovel | nome_regiao | metragem | cagr_pct | valor_inicio | valor_fim
    """
    df = _cagr_todos(ano_inicio, ano_fim)
    if df.empty:
        return df
    return (
        df.nsmallest(n, "cagr_pct")
        .reset_index(drop=True)
    )


# ---------------------------------------------------------------------------
# 6. Distribuição de valorização de todos os imóveis
# ---------------------------------------------------------------------------

def distribuicao_valorizacao(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Retorna o CAGR de todos os imóveis no período, pronto para
    construção de histogramas, box plots e análises de distribuição.

    Colunas: id_imovel | nome_regiao | metragem | quartos | banheiros |
             ano_entrega | cagr_pct | valor_inicio | valor_fim | n_anos
    """
    return _cagr_todos(ano_inicio, ano_fim).reset_index(drop=True)
# ---------------------------------------------------------------------------
# 7. Listagem de todos os imóveis
# ---------------------------------------------------------------------------

def listar_imoveis() -> pd.DataFrame:
    """
    Lista todos os imóveis com metadados básicos e o último valor estimado.

    Colunas: id_imovel | nome_regiao | metragem | quartos | banheiros | 
             ano_entrega | ultimo_valor | ultimo_ano
    """
    sql = """
        SELECT i.id_imovel,
               r.nome_regiao,
               i.metragem,
               i.quartos,
               i.banheiros,
               i.ano_entrega,
               h.valor_estimado AS ultimo_valor,
               h.ano AS ultimo_ano
          FROM imoveis i
          JOIN regioes r ON r.id_regiao = i.id_regiao
          LEFT JOIN (
              SELECT id_imovel, valor_estimado, ano
                FROM historico_valor_imovel
               WHERE (id_imovel, ano) IN (
                   SELECT id_imovel, MAX(ano)
                     FROM historico_valor_imovel
                    GROUP BY id_imovel
               )
          ) h ON h.id_imovel = i.id_imovel
         ORDER BY i.id_imovel
    """
    return query(sql)
