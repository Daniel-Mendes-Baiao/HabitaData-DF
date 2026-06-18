"""
analytics/mercado.py
====================
HabitaData DF — Análises de mercado imobiliário e comparação entre regiões.

Funções públicas
----------------
valorizacao_media_por_regiao(ano_inicio, ano_fim) → CAGR médio por região
ranking_regioes(ano_inicio, ano_fim)              → ranking de regiões por CAGR
preco_medio_por_regiao(ano)                       → preço médio por região em 1 ano
evolucao_mercado(id_regiao)                       → valor médio do mercado por ano
crescimento_anual_mercado(id_regiao)              → variação % YoY do mercado
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from analytics.db import query


# ---------------------------------------------------------------------------
# 1. Valorização média por região (CAGR médio dos imóveis)
# ---------------------------------------------------------------------------

def valorizacao_media_por_regiao(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Calcula o CAGR médio dos imóveis agrupados por região no período.

    Metodologia:
      1. Para cada imóvel, busca valor no primeiro e último ano do período.
      2. Calcula CAGR individual.
      3. Agrega (média, mediana, desvio-padrão) por região.

    Colunas: nome_regiao | n_imoveis | cagr_medio_pct | cagr_mediana_pct | cagr_std_pct
    """
    sql = """
        SELECT i.id_imovel,
               r.id_regiao,
               r.nome_regiao,
               ini.valor_estimado AS v_ini,
               fim.valor_estimado AS v_fim,
               (fim.ano - ini.ano) AS n_anos
          FROM imoveis i
          JOIN regioes r ON r.id_regiao = i.id_regiao
          JOIN (
              SELECT id_imovel, MIN(ano) AS ano,
                     MIN(valor_estimado) AS valor_estimado
                FROM historico_valor_imovel
               WHERE ano >= :ano_ini
               GROUP BY id_imovel
          ) ini ON ini.id_imovel = i.id_imovel
          JOIN (
              SELECT id_imovel, MAX(ano) AS ano,
                     MAX(valor_estimado) AS valor_estimado
                FROM historico_valor_imovel
               WHERE ano <= :ano_fim
               GROUP BY id_imovel
          ) fim ON fim.id_imovel = i.id_imovel
         WHERE ini.ano < fim.ano
    """
    df = query(sql, {"ano_ini": ano_inicio, "ano_fim": ano_fim})
    if df.empty:
        return df

    # Calcula CAGR individual
    mask = (df["n_anos"] > 0) & (df["v_ini"] > 0)
    df["cagr_pct"] = np.where(
        mask,
        ((df["v_fim"] / df["v_ini"]) ** (1 / df["n_anos"]) - 1) * 100,
        np.nan,
    )

    # Agrega por região
    result = (
        df.dropna(subset=["cagr_pct"])
        .groupby(["id_regiao", "nome_regiao"])["cagr_pct"]
        .agg(
            n_imoveis="count",
            cagr_medio_pct="mean",
            cagr_mediana_pct="median",
            cagr_std_pct="std",
        )
        .reset_index()
        .sort_values("cagr_medio_pct", ascending=False)
    )
    return result


# ---------------------------------------------------------------------------
# 2. Ranking de regiões por valorização
# ---------------------------------------------------------------------------

def ranking_regioes(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Retorna as regiões ordenadas da mais para a menos valorizada
    (por CAGR médio dos imóveis no período).

    Colunas: posicao | nome_regiao | cagr_medio_pct | n_imoveis |
             cagr_mediana_pct | cagr_std_pct
    """
    df = valorizacao_media_por_regiao(ano_inicio, ano_fim)
    if df.empty:
        return df
    df = df.sort_values("cagr_medio_pct", ascending=False).reset_index(drop=True)
    df.insert(0, "posicao", df.index + 1)
    return df


# ---------------------------------------------------------------------------
# 3. Preço médio por região em um ano específico
# ---------------------------------------------------------------------------

def preco_medio_por_regiao(ano: int = 2025) -> pd.DataFrame:
    """
    Retorna o valor médio, mínimo e máximo dos imóveis por região
    em um ano específico.

    Colunas: nome_regiao | n_imoveis | valor_medio | valor_min | valor_max | valor_mediana
    """
    sql = """
        SELECT r.nome_regiao,
               COUNT(h.id_imovel)      AS n_imoveis,
               AVG(h.valor_estimado)   AS valor_medio,
               MIN(h.valor_estimado)   AS valor_min,
               MAX(h.valor_estimado)   AS valor_max
          FROM historico_valor_imovel h
          JOIN imoveis i ON i.id_imovel = h.id_imovel
          JOIN regioes r ON r.id_regiao = i.id_regiao
         WHERE h.ano = :ano
         GROUP BY r.id_regiao, r.nome_regiao
         ORDER BY valor_medio DESC
    """
    df = query(sql, {"ano": ano})
    if df.empty:
        return df

    # Mediana precisa de Python (SQLite não tem PERCENTILE)
    sql_raw = """
        SELECT r.nome_regiao, h.valor_estimado
          FROM historico_valor_imovel h
          JOIN imoveis i ON i.id_imovel = h.id_imovel
          JOIN regioes r ON r.id_regiao = i.id_regiao
         WHERE h.ano = :ano
    """
    raw = query(sql_raw, {"ano": ano})
    medianas = raw.groupby("nome_regiao")["valor_estimado"].median().rename("valor_mediana")
    return df.merge(medianas, on="nome_regiao")


# ---------------------------------------------------------------------------
# 4. Evolução histórica do mercado (por região ou geral)
# ---------------------------------------------------------------------------

def evolucao_mercado(id_regiao: int | None = None) -> pd.DataFrame:
    """
    Retorna a evolução do valor médio de mercado por ano.

    Parâmetros
    ----------
    id_regiao : int | None
        Se informado, filtra apenas a região. Se None, retorna o mercado geral.

    Colunas: ano | nome_regiao (se filtro) | n_imoveis | valor_medio | valor_mediana
    """
    if id_regiao is not None:
        sql = """
            SELECT h.ano,
                   r.nome_regiao,
                   COUNT(h.id_imovel)    AS n_imoveis,
                   AVG(h.valor_estimado) AS valor_medio
              FROM historico_valor_imovel h
              JOIN imoveis i ON i.id_imovel = h.id_imovel
              JOIN regioes r ON r.id_regiao = i.id_regiao
             WHERE i.id_regiao = :reg
             GROUP BY h.ano, r.nome_regiao
             ORDER BY h.ano
        """
        df_agg = query(sql, {"reg": id_regiao})
        sql_raw = """
            SELECT h.ano, h.valor_estimado
              FROM historico_valor_imovel h
              JOIN imoveis i ON i.id_imovel = h.id_imovel
             WHERE i.id_regiao = :reg
        """
        raw = query(sql_raw, {"reg": id_regiao})
    else:
        sql = """
            SELECT h.ano,
                   COUNT(h.id_imovel)    AS n_imoveis,
                   AVG(h.valor_estimado) AS valor_medio
              FROM historico_valor_imovel h
             GROUP BY h.ano
             ORDER BY h.ano
        """
        df_agg = query(sql)
        raw = query("SELECT ano, valor_estimado FROM historico_valor_imovel")

    if df_agg.empty:
        return df_agg

    medianas = raw.groupby("ano")["valor_estimado"].median().rename("valor_mediana")
    return df_agg.merge(medianas, on="ano")


# ---------------------------------------------------------------------------
# 5. Crescimento anual do mercado (YoY)
# ---------------------------------------------------------------------------

def crescimento_anual_mercado(id_regiao: int | None = None) -> pd.DataFrame:
    """
    Calcula a variação percentual ano a ano do valor médio de mercado.

    Parâmetros
    ----------
    id_regiao : int | None
        Filtra por região se informado.

    Colunas: ano | valor_medio | variacao_yoy_pct (+ nome_regiao se filtro)
    """
    df = evolucao_mercado(id_regiao)
    if df.empty:
        return df
    df["variacao_yoy_pct"] = df["valor_medio"].pct_change() * 100
    return df


# ---------------------------------------------------------------------------
# 6. Evolução histórica por NOME de região (aceita string)
# ---------------------------------------------------------------------------

def evolucao_mercado_por_nome_regiao(nome_regiao: str) -> pd.DataFrame:
    """
    Retorna a evolução histórica anual do valor médio dos imóveis de uma
    região pelo seu NOME (não precisa do id_regiao).
    Busca parcial e case-insensitive (ex: 'aguas claras' encontra 'AGUAS CLARAS').

    Colunas: ano | nome_regiao | n_imoveis | valor_medio | valor_mediana | variacao_yoy_pct
    """
    sql = """
        SELECT h.ano,
               r.nome_regiao,
               COUNT(h.id_imovel)    AS n_imoveis,
               AVG(h.valor_estimado) AS valor_medio
          FROM historico_valor_imovel h
          JOIN imoveis i ON i.id_imovel = h.id_imovel
          JOIN regioes r ON r.id_regiao = i.id_regiao
         WHERE UPPER(r.nome_regiao) LIKE UPPER(:nome)
         GROUP BY h.ano, r.nome_regiao
         ORDER BY h.ano
    """
    df_agg = query(sql, {"nome": f"%{nome_regiao}%"})
    if df_agg.empty:
        return df_agg

    sql_raw = """
        SELECT h.ano, h.valor_estimado
          FROM historico_valor_imovel h
          JOIN imoveis i ON i.id_imovel = h.id_imovel
          JOIN regioes r ON r.id_regiao = i.id_regiao
         WHERE UPPER(r.nome_regiao) LIKE UPPER(:nome)
    """
    raw = query(sql_raw, {"nome": f"%{nome_regiao}%"})
    if not raw.empty:
        medianas = raw.groupby("ano")["valor_estimado"].median().rename("valor_mediana")
        df_agg = df_agg.merge(medianas, on="ano", how="left")

    df_agg["variacao_yoy_pct"] = df_agg["valor_medio"].pct_change() * 100
    return df_agg


# ---------------------------------------------------------------------------
# 7. Maior valorização YoY por nome de região
# ---------------------------------------------------------------------------

def maior_valorizacao_yoy_por_regiao(nome_regiao: str) -> pd.DataFrame:
    """
    Retorna o ano e a variação YoY (%) de maior valorização de mercado
    para uma região específica pelo nome.

    Colunas: ano | nome_regiao | valor_medio | variacao_yoy_pct
    """
    df = evolucao_mercado_por_nome_regiao(nome_regiao)
    if df.empty:
        return df
    df_valid = df.dropna(subset=["variacao_yoy_pct"])
    if df_valid.empty:
        return df
    idx_max = df_valid["variacao_yoy_pct"].idxmax()
    return df_valid.loc[[idx_max]]
