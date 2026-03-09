"""
smoke_test.py  —  HabitaData DF Smoke Test da Camada Analitica

Executa cada funcao publica e valida o retorno basico:
  [OK]   retorna pd.DataFrame nao vazio com colunas esperadas
  [FAIL] erro ou DataFrame invalido

Uso:
    python smoke_test.py
"""
import sys
import traceback

import pandas as pd

import analytics as an

IMOVEL_ID  = 1
REGIAO_ID  = 1
ANO        = 2024
ANO_INICIO = 2010
ANO_FIM    = 2025
N_TOP      = 5


def _ok(nome, df, colunas=None):
    erros = []
    if not isinstance(df, pd.DataFrame):
        erros.append("nao e DataFrame")
    elif df.empty:
        erros.append("DataFrame vazio")
    elif colunas:
        faltando = [c for c in colunas if c not in df.columns]
        if faltando:
            erros.append(f"colunas ausentes: {faltando}")
    if erros:
        print(f"  [FAIL] {nome}: {'; '.join(erros)}")
        return False
    print(f"  [OK]   {nome}  ({len(df)} linhas x {len(df.columns)} colunas)")
    return True


def _ok_scalar(nome, val):
    if val is None or (isinstance(val, float) and val != val):
        print(f"  [FAIL] {nome}: retornou NaN/None")
        return False
    print(f"  [OK]   {nome}  ({round(val, 4)})")
    return True


def run_tests():
    resultados = []

    tests = [
        # ---- imoveis -------------------------------------------------------
        ("evolucao_imovel",
         lambda: an.evolucao_imovel(IMOVEL_ID),
         ["ano", "valor_estimado", "variacao_yoy_pct"], "df"),

        ("valorizacao_percentual",
         lambda: an.valorizacao_percentual(IMOVEL_ID),
         None, "scalar"),

        ("cagr_imovel",
         lambda: an.cagr_imovel(IMOVEL_ID),
         None, "scalar"),

        ("top_valorizados",
         lambda: an.top_valorizados(N_TOP, ANO_INICIO, ANO_FIM),
         ["id_imovel", "nome_regiao", "cagr_pct"], "df"),

        ("top_desvalorizados",
         lambda: an.top_desvalorizados(N_TOP, ANO_INICIO, ANO_FIM),
         ["id_imovel", "nome_regiao", "cagr_pct"], "df"),

        ("distribuicao_valorizacao",
         lambda: an.distribuicao_valorizacao(ANO_INICIO, ANO_FIM),
         ["id_imovel", "cagr_pct"], "df"),

        # ---- mercado -------------------------------------------------------
        ("valorizacao_media_por_regiao",
         lambda: an.valorizacao_media_por_regiao(ANO_INICIO, ANO_FIM),
         ["nome_regiao", "cagr_medio_pct"], "df"),

        ("ranking_regioes",
         lambda: an.ranking_regioes(ANO_INICIO, ANO_FIM),
         ["posicao", "nome_regiao", "cagr_medio_pct"], "df"),

        ("preco_medio_por_regiao",
         lambda: an.preco_medio_por_regiao(ANO),
         ["nome_regiao", "valor_medio"], "df"),

        ("evolucao_mercado (geral)",
         lambda: an.evolucao_mercado(),
         ["ano", "valor_medio"], "df"),

        ("evolucao_mercado (regiao)",
         lambda: an.evolucao_mercado(REGIAO_ID),
         ["ano", "valor_medio"], "df"),

        ("crescimento_anual_mercado",
         lambda: an.crescimento_anual_mercado(),
         ["ano", "variacao_yoy_pct"], "df"),

        # ---- urbano --------------------------------------------------------
        ("impacto_metragem",
         lambda: an.impacto_metragem(ANO_INICIO, ANO_FIM),
         ["faixa_metragem", "cagr_medio_pct"], "df"),

        ("impacto_distancia_metro",
         lambda: an.impacto_distancia_metro(ANO),
         ["nome_regiao", "distancia_metro_km", "valor_medio_imoveis"], "df"),

        ("impacto_criminalidade",
         lambda: an.impacto_criminalidade(ANO_INICIO, ANO_FIM),
         ["nome_regiao", "cagr_medio_pct", "indice_criminalidade_medio"], "df"),

        ("impacto_infraestrutura",
         lambda: an.impacto_infraestrutura(ANO_INICIO, ANO_FIM),
         ["nome_regiao", "score_infra", "valor_medio"], "df"),

        ("correlacao_custo_m2",
         lambda: an.correlacao_custo_m2(ANO_INICIO, ANO_FIM),
         ["nome_regiao", "pearson_r", "spearman_r"], "df"),
    ]

    print("\n" + "=" * 58)
    print("  HabitaData DF -- Smoke Test da Camada Analitica")
    print("=" * 58)

    for nome, fn, colunas, tipo in tests:
        try:
            resultado = fn()
            ok = _ok_scalar(nome, resultado) if tipo == "scalar" else _ok(nome, resultado, colunas)
            resultados.append(ok)
        except Exception:
            print(f"  [FAIL] {nome}: EXCECAO")
            traceback.print_exc()
            resultados.append(False)

    total  = len(resultados)
    passou = sum(resultados)
    print("-" * 58)
    print(f"  Resultado: {passou}/{total} testes passaram {'[OK]' if passou == total else '[FAIL]'}")
    print("=" * 58 + "\n")

    if passou < total:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
