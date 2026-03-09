"""
analytics/urbano.py
===================
HabitaData DF — Análises de infraestrutura urbana e correlações com valorização.

Funções públicas
----------------
impacto_metragem(ano_inicio, ano_fim)       → CAGR por faixa de metragem
impacto_distancia_metro(ano)                → valor médio × distância do metrô
impacto_criminalidade(ano_inicio, ano_fim)  → CAGR médio × índice de criminalidade
impacto_infraestrutura(ano)                 → score composto de infra × CAGR
correlacao_custo_m2(ano_inicio, ano_fim)    → Pearson + Spearman custo m² × valor
get_multivariate_data(ano_inicio, ano_fim) → Dataset completo de variáveis cruzadas
get_regional_comparison_data(ano_ini, ano_fim) → Dataset agregado por região
get_temporal_growth_indices(regioes) → Evolução temporal de métricas urbanas
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy import stats

from analytics.db import query


# ---------------------------------------------------------------------------
# Helper: bins de metragem
# ---------------------------------------------------------------------------

_BINS_METRAGEM   = [0, 50, 60, 70, 80, 90, float("inf")]
_LABELS_METRAGEM = ["≤50 m²", "51-60 m²", "61-70 m²", "71-80 m²", "81-90 m²", ">90 m²"]


# ---------------------------------------------------------------------------
# 1. Impacto da metragem na valorização
# ---------------------------------------------------------------------------

def impacto_metragem(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Agrupa imóveis por faixa de metragem e calcula o CAGR médio de cada faixa.

    Colunas:
      faixa_metragem | n_imoveis | metragem_media | cagr_medio_pct |
      cagr_mediana_pct | cagr_std_pct
    """
    sql = """
        SELECT i.id_imovel,
               i.metragem,
               ini.valor_estimado AS v_ini,
               fim.valor_estimado AS v_fim,
               (fim.ano - ini.ano) AS n_anos
          FROM imoveis i
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
         WHERE ini.ano < fim.ano AND i.metragem > 0 AND ini.valor_estimado > 0
    """
    df = query(sql, {"ano_ini": ano_inicio, "ano_fim": ano_fim})
    if df.empty:
        return df

    df["cagr_pct"] = (
        (df["v_fim"] / df["v_ini"]) ** (1 / df["n_anos"]) - 1
    ) * 100

    df["faixa_metragem"] = pd.cut(
        df["metragem"],
        bins=_BINS_METRAGEM,
        labels=_LABELS_METRAGEM,
        right=True,
    )

    result = (
        df.groupby("faixa_metragem", observed=True)
        .agg(
            n_imoveis=("id_imovel", "count"),
            metragem_media=("metragem", "mean"),
            cagr_medio_pct=("cagr_pct", "mean"),
            cagr_mediana_pct=("cagr_pct", "median"),
            cagr_std_pct=("cagr_pct", "std"),
        )
        .reset_index()
        .sort_values("metragem_media")
    )
    return result


# ---------------------------------------------------------------------------
# 2. Impacto da distância do metrô
# ---------------------------------------------------------------------------

def impacto_distancia_metro(ano: int = 2025) -> pd.DataFrame:
    """
    Combina o valor médio dos imóveis de cada região com a distância
    média ao metrô registrada naquele ano.

    Colunas:
      nome_regiao | distancia_metro_km | valor_medio_imoveis | n_imoveis
    """
    sql = """
        SELECT r.nome_regiao,
               ir.distancia_metro_km,
               AVG(h.valor_estimado) AS valor_medio_imoveis,
               COUNT(h.id_imovel)    AS n_imoveis
          FROM historico_valor_imovel h
          JOIN imoveis i ON i.id_imovel = h.id_imovel
          JOIN regioes r ON r.id_regiao = i.id_regiao
          JOIN infraestrutura_regional ir
            ON ir.id_regiao = i.id_regiao AND ir.ano = h.ano
         WHERE h.ano = :ano
         GROUP BY r.id_regiao, r.nome_regiao, ir.distancia_metro_km
         ORDER BY ir.distancia_metro_km
    """
    return query(sql, {"ano": ano})


# ---------------------------------------------------------------------------
# 3. Impacto da criminalidade na valorização
# ---------------------------------------------------------------------------

def impacto_criminalidade(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Relaciona o CAGR médio dos imóveis de cada região com o índice
    médio de criminalidade da região no período.

    Colunas:
      nome_regiao | cagr_medio_pct | indice_criminalidade_medio | n_imoveis
    """
    # CAGR por região (reutiliza lógica)
    from analytics.mercado import valorizacao_media_por_regiao
    df_cagr = valorizacao_media_por_regiao(ano_inicio, ano_fim)[
        ["id_regiao", "nome_regiao", "n_imoveis", "cagr_medio_pct"]
    ]

    sql = """
        SELECT id_regiao,
               AVG(indice_criminalidade) AS indice_criminalidade_medio
          FROM infraestrutura_regional
         WHERE ano BETWEEN :ano_ini AND :ano_fim
         GROUP BY id_regiao
    """
    df_crime = query(sql, {"ano_ini": ano_inicio, "ano_fim": ano_fim})

    return (
        df_cagr.merge(df_crime, on="id_regiao")
        .drop(columns=["id_regiao"])
        .sort_values("indice_criminalidade_medio")
    )


# ---------------------------------------------------------------------------
# 4. Impacto da infraestrutura urbana
# ---------------------------------------------------------------------------

def impacto_infraestrutura(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Cria um score composto de infraestrutura para cada região/ano e
    o relaciona com o valor médio dos imóveis.

    Score composto:
      escolas_norm + hospitais_norm + comercio_norm
      - distancia_metro_norm - criminalidade_norm
      (cada variável normalizada [0,1] dentro do conjunto)

    Colunas:
      nome_regiao | ano | distancia_metro_km | escolas_1km | hospitais_3km |
      comercio_1km | indice_criminalidade | score_infra | valor_medio
    """
    sql_infra = """
        SELECT ir.id_regiao,
               r.nome_regiao,
               ir.ano,
               ir.distancia_metro_km,
               ir.escolas_1km,
               ir.hospitais_3km,
               ir.comercio_1km,
               ir.indice_criminalidade,
               AVG(h.valor_estimado) AS valor_medio
          FROM infraestrutura_regional ir
          JOIN regioes r ON r.id_regiao = ir.id_regiao
          JOIN imoveis i ON i.id_regiao = ir.id_regiao
          JOIN historico_valor_imovel h
            ON h.id_imovel = i.id_imovel AND h.ano = ir.ano
         WHERE ir.ano BETWEEN :ano_ini AND :ano_fim
         GROUP BY ir.id_regiao, ir.ano
         ORDER BY ir.id_regiao, ir.ano
    """
    df = query(sql_infra, {"ano_ini": ano_inicio, "ano_fim": ano_fim})
    if df.empty:
        return df

    def _norm(s: pd.Series) -> pd.Series:
        rng = s.max() - s.min()
        return (s - s.min()) / rng if rng > 0 else pd.Series(0.5, index=s.index)

    df["score_infra"] = (
        _norm(df["escolas_1km"])
        + _norm(df["hospitais_3km"])
        + _norm(df["comercio_1km"])
        - _norm(df["distancia_metro_km"])
        - _norm(df["indice_criminalidade"])
    )
    return df


# ---------------------------------------------------------------------------
# 5. Correlação entre custo do m² regional e preço dos imóveis
# ---------------------------------------------------------------------------

def correlacao_custo_m2(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Calcula as correlações de Pearson e Spearman entre o custo médio
    do m² regional e o valor médio estimado dos imóveis, por ano e por região.

    Retorna uma linha por região com os coeficientes de correlação.

    Colunas:
      nome_regiao | pearson_r | pearson_p | spearman_r | spearman_p | n_anos
    """
    sql = """
        SELECT r.nome_regiao,
               cm.ano,
               cm.custo_m2,
               AVG(h.valor_estimado) AS valor_medio
          FROM custo_m2_regional cm
          JOIN regioes r ON r.id_regiao = cm.id_regiao
          JOIN imoveis i ON i.id_regiao = cm.id_regiao
          JOIN historico_valor_imovel h
            ON h.id_imovel = i.id_imovel AND h.ano = cm.ano
         WHERE cm.ano BETWEEN :ano_ini AND :ano_fim
         GROUP BY r.id_regiao, r.nome_regiao, cm.ano, cm.custo_m2
         ORDER BY r.id_regiao, cm.ano
    """
    df = query(sql, {"ano_ini": ano_inicio, "ano_fim": ano_fim})
    if df.empty:
        return df

    rows = []
    for regiao, grp in df.groupby("nome_regiao"):
        if len(grp) < 3:
            continue
        pr, pp = stats.pearsonr(grp["custo_m2"], grp["valor_medio"])
        sr, sp = stats.spearmanr(grp["custo_m2"], grp["valor_medio"])
        rows.append(
            {
                "nome_regiao":  regiao,
                "pearson_r":    round(pr, 4),
                "pearson_p":    round(pp, 4),
                "spearman_r":   round(sr, 4),
                "spearman_p":   round(sp, 4),
                "n_anos":       len(grp),
            }
        )
    return pd.DataFrame(rows).sort_values("pearson_r", ascending=False)


# ---------------------------------------------------------------------------
# 6. Dataset Multivariado para Exploração
# ---------------------------------------------------------------------------

def get_multivariate_data(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Retorna o dataset mais completo possível cruzando variáveis de imóvel,
    região e infraestrutura para análises de correlação e dispersão.

    Colunas:
      id_imovel | nome_regiao | metragem | quartos | banheiros | 
      valor_medio_periodo | cagr_pct | score_infra | 
      distancia_metro_km | indice_criminalidade | escolas_1km
    """
    # 1. CAGR e Metadados do Imóvel
    from analytics.imoveis import _cagr_todos
    df_imoveis = _cagr_todos(ano_inicio, ano_fim)
    if df_imoveis.empty:
        return df_imoveis

    # 2. Score de Infraestrutura Médio do Período por Região
    sql_infra = """
        SELECT id_regiao,
               AVG(distancia_metro_km) AS distancia_metro_km,
               AVG(escolas_1km)        AS escolas_1km,
               AVG(indice_criminalidade) AS indice_criminalidade
          FROM infraestrutura_regional
         WHERE ano BETWEEN :ano_ini AND :ano_fim
         GROUP BY id_regiao
    """
    df_infra = query(sql_infra, {"ano_ini": ano_inicio, "ano_fim": ano_fim})

    # 3. Join e limpeza
    # Precisamos do id_regiao nos imoveis (já vem no cagr_todos se alterado ou pegamos via SQL)
    # Na verdade, cagr_todos em imoveis.py não retorna id_regiao, apenas nome.
    # Vamos fazer um SQL customizado mais eficiente aqui.
    sql_full = """
        SELECT i.id_imovel, r.nome_regiao, i.metragem, i.quartos, i.banheiros,
               ini.valor_estimado AS v_ini, fim.valor_estimado AS v_fim,
               (fim.ano - ini.ano) AS n_anos,
               inf.distancia_metro_km, inf.escolas_1km, inf.indice_criminalidade
          FROM imoveis i
          JOIN regioes r ON r.id_regiao = i.id_regiao
          JOIN (
              SELECT id_imovel, MIN(ano) as ano, valor_estimado
              FROM historico_valor_imovel WHERE ano >= :ano_ini GROUP BY id_imovel
          ) ini ON ini.id_imovel = i.id_imovel
          JOIN (
              SELECT id_imovel, MAX(ano) as ano, valor_estimado
              FROM historico_valor_imovel WHERE ano <= :ano_fim GROUP BY id_imovel
          ) fim ON fim.id_imovel = i.id_imovel
          JOIN (
              SELECT id_regiao, 
                     AVG(distancia_metro_km) as distancia_metro_km,
                     AVG(escolas_1km) as escolas_1km,
                     AVG(indice_criminalidade) as indice_criminalidade
              FROM infraestrutura_regional
              WHERE ano BETWEEN :ano_ini AND :ano_fim
              GROUP BY id_regiao
          ) inf ON inf.id_regiao = i.id_regiao
         WHERE ini.ano < fim.ano
    """
    df = query(sql_full, {"ano_ini": ano_inicio, "ano_fim": ano_fim})
    if df.empty:
        return df

    # Cálculo final das métricas derivadas
    df["cagr_pct"] = ((df["v_fim"] / df["v_ini"]) ** (1 / df["n_anos"]) - 1) * 100
    df["valor_medio_periodo"] = (df["v_ini"] + df["v_fim"]) / 2
    
    # Normalização da Segurança: Inverter criminalidade para score (0-100)
    # criminalidade no DB está entre 0.2 e 0.4. Vamos mapear 1.0 (pior) -> 0 e 0 -> 100
    df["score_seguranca"] = (1 - df["indice_criminalidade"]) * 100

    return df


# ---------------------------------------------------------------------------
# 7. Matriz de Correlação
# ---------------------------------------------------------------------------

def get_correlation_matrix(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Calcula a matriz de correlação de Pearson entre todas as variáveis numéricas.

    Retorna um DataFrame onde índice e colunas são os nomes das variáveis.
    """
    df = get_multivariate_data(ano_inicio, ano_fim)
    if df.empty:
        return df

    cols_analise = [
        "metragem", "quartos", "banheiros", "v_ini", "v_fim", 
        "cagr_pct", "valor_medio_periodo", "distancia_metro_km", 
        "escolas_1km", "score_seguranca"
    ]
    
    # Garantir que as colunas existem
    cols_analise = [c for c in cols_analise if c in df.columns]
    
    corr_df = df[cols_analise].corr(method="pearson").fillna(0)
    return corr_df


# ---------------------------------------------------------------------------
# 8. Comparativo Regional (Agregado)
# ---------------------------------------------------------------------------

def get_regional_comparison_data(
    ano_inicio: int = 2010,
    ano_fim: int = 2025,
) -> pd.DataFrame:
    """
    Agrega o dataset multivariado em nível regional para comparação entre cidades.
    Retorna métricas médias e totais por RA.
    """
    df = get_multivariate_data(ano_inicio, ano_fim)
    if df.empty:
        return df

    # Cálculo do Preço por m² (Individualmente antes de agregar para maior precisão)
    df["valor_m2"] = df["valor_medio_periodo"] / df["metragem"]

    # Agrupar por Região
    agg_map = {
        "id_imovel": "count",
        "metragem": "mean",
        "valor_medio_periodo": "mean",
        "valor_m2": "mean",
        "cagr_pct": "mean",
        "distancia_metro_km": "mean",
        "escolas_1km": "mean",
        "indice_criminalidade": "mean",
        "score_seguranca": "mean"
    }
    
    df_reg = df.groupby("nome_regiao").agg(agg_map).reset_index()
    df_reg.rename(columns={"id_imovel": "n_ativos"}, inplace=True)
    
    return df_reg


# ---------------------------------------------------------------------------
# 9. Índices de Crescimento Temporal por Região
# ---------------------------------------------------------------------------

def get_temporal_growth_indices(
    regioes: list[str] | None = None,
) -> pd.DataFrame:
    """
    Calcula o crescimento acumulado (Índice Base 100) para múltiplas variáveis
    ao longo do tempo para as regiões selecionadas.
    """
    sql = """
        SELECT r.nome_regiao, i.ano,
               AVG(i.distancia_metro_km) as dist_metro,
               AVG(i.escolas_1km) as escolas,
               AVG(i.indice_criminalidade) as crime,
               AVG(m.valor_medio) as preco_medio
          FROM infraestrutura_regional i
          JOIN regioes r ON r.id_regiao = i.id_regiao
          LEFT JOIN (
              SELECT imp.id_regiao, hist.ano, AVG(hist.valor_estimado) as valor_medio
              FROM historico_valor_imovel hist
              JOIN imoveis imp ON imp.id_imovel = hist.id_imovel
              GROUP BY imp.id_regiao, hist.ano
          ) m ON m.id_regiao = i.id_regiao AND m.ano = i.ano
         GROUP BY r.nome_regiao, i.ano
         ORDER BY r.nome_regiao, i.ano
    """
    df = query(sql)
    
    if regioes:
        df = df[df["nome_regiao"].isin(regioes)]
        
    if df.empty:
        return df

    # Transformar em Índice Base 100 por Região
    results = []
    for reg, group in df.groupby("nome_regiao"):
        group = group.sort_values("ano")
        first_row = group.iloc[0]
        
        # Evitar divisão por zero e normalizar
        for col in ["dist_metro", "escolas", "crime", "preco_medio"]:
            # Preencher NaNs na coluna original se existirem
            group[col] = group[col].ffill().bfill().fillna(0)
            
            base_val = group[col].iloc[0] if len(group) > 0 else 0
            
            # Salvar valor real
            group[f"{col}_raw"] = group[col]
            
            if pd.isnull(base_val) or base_val == 0:
                group[f"{col}_idx"] = 100.0
            else:
                group[f"{col}_idx"] = (group[col] / base_val) * 100
            
        results.append(group)
        
    final_df = pd.concat(results).reset_index(drop=True) if results else pd.DataFrame()
    return final_df

