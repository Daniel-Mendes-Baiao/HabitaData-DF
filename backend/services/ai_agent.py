"""
backend/services/ai_agent.py
============================
Agente de IA do HabitaData DF — powered by Agno + OpenRouter.

Arquitetura
-----------
- Framework : Agno (agno==2.6.4)
- Modelo    : google/gemma-4-31b-it:free via OpenRouter API
- Padrão    : Singleton lazy (_property_agent) — criado na 1ª requisição

Ferramentas (tools) disponíveis para o agente
----------------------------------------------
Agrupadas em 4 categorias:
  1. Análise de imóvel individual  (5 tools)
  2. Análise de mercado e regiões  (6 tools)
  3. Análise urbana e correlações  (7 tools)
  4. Novas ferramentas por nome    (2 tools)

O agente decide autonomamente quais chamar com base na pergunta do usuário.
"""

import os
from typing import Optional

import analytics as an
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from backend.services.analytics_adapter import df_to_dict, scalar_to_json
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Singleton — instanciado na primeira chamada a get_property_agent()
_property_agent: Optional[Agent] = None

# ---------------------------------------------------------------------------
# Instruções de gráficos — injetadas no system prompt do agente
# ---------------------------------------------------------------------------

_CHART_FORMAT_INSTRUCTIONS = """
## CAPACIDADE DE GRÁFICOS

Quando o usuário pedir uma visualização, comparativo ou análise gráfica, emita
um bloco de gráfico usando EXATAMENTE o formato abaixo. Nunca use ASCII art ou
tabelas Markdown quando dados numéricos estiverem disponíveis.

FORMATO DO BLOCO:

~~~chart
{
  "type": "bar",
  "title": "Título descritivo",
  "xAxisTitle": "Nome do Eixo X",
  "yAxisTitle": "Nome do Eixo Y",
  "series": [
    {
      "name": "Nome da Série",
      "x": ["Label A", "Label B", "Label C"],
      "y": [10.5, 8.2, 6.1],
      "color": "#10b981"
    }
  ]
}
~~~

TIPOS DISPONÍVEIS:
- "bar"     : comparativo entre categorias (ex: CAGR por região)
- "line"    : evolução temporal (ex: preço ao longo dos anos)
- "scatter" : correlação entre duas variáveis
- "pie"     : distribuição percentual

REGRAS:
1. Use ~~~chart SOMENTE quando os dados vierem de uma ferramenta consultada.
2. NUNCA invente valores — use apenas dados retornados pelas ferramentas.
3. Texto explicativo pode vir ANTES e DEPOIS do bloco ~~~chart.
4. O JSON deve ser válido e bem-formatado.
5. Para gráfico de pizza (pie): use "x" para rótulos e "y" para valores.
6. Paleta de cores: #10b981 (emerald), #3b82f6 (blue), #f59e0b (amber), #8b5cf6 (purple).
"""

# ---------------------------------------------------------------------------
# SEÇÃO 1 — Ferramentas: Análise de Imóvel Individual
# ---------------------------------------------------------------------------

def listar_todos_imoveis() -> list[dict]:
    """
    Lista todos os imóveis cadastrados com ID, região, metragem, quartos,
    banheiros, ano de entrega e último valor estimado.
    Use para descobrir IDs de imóveis antes de consultar detalhes específicos.
    """
    return df_to_dict(an.listar_imoveis())


def obter_evolucao_imovel(id_imovel: int) -> list[dict]:
    """
    Série histórica anual de valor estimado e variação YoY (%) de um imóvel.
    Use quando o usuário pedir o histórico de preço de um imóvel específico pelo ID.
    """
    return df_to_dict(an.evolucao_imovel(id_imovel))


def obter_cagr_e_valorizacao_imovel(id_imovel: int) -> dict:
    """
    Retorna o CAGR (%) e a valorização total acumulada (%) de um imóvel pelo ID.
    Use para analisar rentabilidade histórica e taxa de retorno de um imóvel específico.
    """
    return {
        "id_imovel": id_imovel,
        "cagr_pct": scalar_to_json(an.cagr_imovel(id_imovel)),
        "total_appreciation_pct": scalar_to_json(an.valorizacao_percentual(id_imovel)),
    }


def obter_top_imoveis_valorizados(n: int = 5, ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Os N imóveis com maior CAGR (melhor valorização anual) no período.
    Use para encontrar os imóveis mais rentáveis da base.
    """
    return df_to_dict(an.top_valorizados(n, ano_inicio, ano_fim))


def obter_top_imoveis_desvalorizados(n: int = 5, ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Os N imóveis com menor CAGR (pior desempenho ou desvalorização) no período.
    Use para identificar imóveis com baixa rentabilidade histórica.
    """
    return df_to_dict(an.top_desvalorizados(n, ano_inicio, ano_fim))


# ---------------------------------------------------------------------------
# SEÇÃO 2 — Ferramentas: Mercado e Regiões
# ---------------------------------------------------------------------------

def obter_cagr_medio_por_regiao(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    CAGR médio, mediana e desvio-padrão dos imóveis agrupados por região.
    Use para saber quais regiões do DF mais valorizaram no período.
    """
    return df_to_dict(an.valorizacao_media_por_regiao(ano_inicio, ano_fim))


def obter_ranking_regioes_por_valorizacao(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Ranking das regiões administrativas do DF ordenado por CAGR médio.
    Use para saber a posição relativa de cada região em termos de valorização.
    """
    return df_to_dict(an.ranking_regioes(ano_inicio, ano_fim))


def obter_preco_medio_por_regiao(ano: int = 2025) -> list[dict]:
    """
    Preço médio, mediana, mínimo e máximo dos imóveis por região em um ano.
    Use para responder qual região é mais cara ou barata em um determinado ano.
    """
    return df_to_dict(an.preco_medio_por_regiao(ano))


def obter_evolucao_mercado(id_regiao: Optional[int] = None) -> list[dict]:
    """
    Evolução histórica anual do valor médio e mediana de mercado.
    Se id_regiao for None, retorna o mercado geral do DF.
    Se informado, filtra pela região específica (necessita do ID numérico).
    """
    return df_to_dict(an.evolucao_mercado(id_regiao))


def obter_crescimento_anual_yoy_mercado(id_regiao: Optional[int] = None) -> list[dict]:
    """
    Variação percentual ano a ano (YoY) do valor médio do mercado geral ou de uma região.
    Use para analisar ciclos de alta e baixa do mercado imobiliário do DF.
    """
    return df_to_dict(an.crescimento_anual_mercado(id_regiao))


def obter_comparativo_regional_infraestrutura(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Comparativo regional com preço/m², CAGR médio, distância ao metrô,
    quantidade de escolas, segurança e criminalidade.
    Use para perguntas de relação risco/retorno e comparação urbana entre regiões.
    """
    return df_to_dict(an.get_regional_comparison_data(ano_inicio, ano_fim))


# ---------------------------------------------------------------------------
# SEÇÃO 3 — Ferramentas: Análise Urbana e Correlações
# ---------------------------------------------------------------------------

def obter_impacto_metragem(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    CAGR médio por faixa de área útil (≤50m², 51-60m², 61-80m², etc.).
    Use para responder se imóveis menores ou maiores valorizam mais.
    """
    return df_to_dict(an.impacto_metragem(ano_inicio, ano_fim))


def obter_impacto_distancia_metro(ano: int = 2025) -> list[dict]:
    """
    Relação entre valor dos imóveis e distância média da região às estações de metrô.
    Use para analisar se a proximidade ao metrô afeta o preço ou valorização.
    """
    return df_to_dict(an.impacto_distancia_metro(ano))


def obter_impacto_criminalidade(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Relação entre o índice de criminalidade e a taxa de valorização (CAGR) por região.
    Use para responder sobre o impacto da segurança pública na valorização imobiliária.
    """
    return df_to_dict(an.impacto_criminalidade(ano_inicio, ano_fim))


def obter_impacto_infraestrutura_e_valor_medio(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Score composto de infraestrutura (escolas, hospitais, comércio, segurança, metrô)
    relacionado com os valores médios de imóveis por ano e região.
    Use para analisar o impacto do desenvolvimento urbano nos preços de mercado.
    """
    return df_to_dict(an.impacto_infraestrutura(ano_inicio, ano_fim))


def obter_correlacao_custo_m2_e_valor(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Correlação estatística (Pearson e Spearman) entre custo de construção do m²
    regional e o preço final dos imóveis no período.
    Use para responder se o preço do imóvel acompanha o custo da construção civil.
    """
    return df_to_dict(an.correlacao_custo_m2(ano_inicio, ano_fim))


def obter_matriz_correlacao_multivariada(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Matriz de correlação de Pearson cruzando todas as variáveis numéricas do dataset
    (metragem, quartos, banheiros, CAGR, distância metrô, escolas, criminalidade).
    Use para análises multivariadas e descoberta de padrões entre variáveis.
    """
    return df_to_dict(an.get_correlation_matrix(ano_inicio, ano_fim))


def obter_indices_crescimento_temporal(regioes: Optional[list[str]] = None) -> list[dict]:
    """
    Índices base 100 de fatores urbanos (metrô, escolas, criminalidade, preço do m²)
    ao longo do tempo para regiões específicas (ou todas se regioes=None).
    Use para comparar a evolução de longo prazo entre regiões ou variáveis.
    """
    return df_to_dict(an.get_temporal_growth_indices(regioes))


# ---------------------------------------------------------------------------
# SEÇÃO 4 — Ferramentas: Consulta por Nome de Região
# ---------------------------------------------------------------------------

def obter_evolucao_por_nome_regiao(nome_regiao: str) -> list[dict]:
    """
    Série histórica anual completa (valor médio + variação YoY%) de uma região
    pelo NOME (ex: 'Aguas Claras', 'Samambaia', 'Plano Piloto').
    A busca é parcial e case-insensitive: 'aguas claras' encontra 'AGUAS CLARAS'.
    Use para 'como Águas Claras evoluiu ao longo dos anos?' ou
    'qual foi a valorização de Samambaia de 2010 a 2020?'.
    """
    return df_to_dict(an.evolucao_mercado_por_nome_regiao(nome_regiao))


def obter_maior_valorizacao_yoy_por_regiao(nome_regiao: str) -> list[dict]:
    """
    Ano e percentual de maior valorização anual (YoY) de uma região pelo NOME.
    Use para 'qual foi o melhor ano de valorização de Águas Claras?',
    'quando Samambaia mais valorizou?' ou 'qual o pico histórico do Lago Sul?'.
    Retorna: ano, nome_regiao, valor_medio no ano, variacao_yoy_pct.
    """
    return df_to_dict(an.maior_valorizacao_yoy_por_regiao(nome_regiao))


# ---------------------------------------------------------------------------
# Instância do Agente (Singleton)
# ---------------------------------------------------------------------------

def get_property_agent() -> Agent:
    """
    Retorna a instância singleton do agente Agno.
    Criado na primeira chamada (lazy initialization) e reutilizado nas demais.
    """
    global _property_agent
    if _property_agent is None:
        _property_agent = Agent(
            model=OpenAIChat(
                id="google/gemma-4-31b-it:free",
                api_key=OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                role_map={
                    "system":    "system",
                    "user":      "user",
                    "assistant": "assistant",
                    "tool":      "tool",
                },
            ),
            description="Você é o HabitaData AI, especialista sênior em mercado imobiliário do Distrito Federal.",
            instructions=[
                # --- REGRA FUNDAMENTAL ---
                "REGRA PRINCIPAL: Você tem acesso TOTAL ao banco de dados do HabitaData DF. "
                "Para QUALQUER pergunta sobre dados imobiliários (preços, valorização, CAGR, regiões, "
                "infraestrutura, comparações), DEVE obrigatoriamente chamar as ferramentas disponíveis "
                "para buscar os dados diretamente do banco. NUNCA invente ou estime valores.",

                # --- CONTEXTO DA TELA: HINT, NÃO RESTRIÇÃO ---
                "O bloco '### CONTEXTO DE NAVEGAÇÃO' indica em qual tela o usuário está e quais "
                "filtros estão ativos na interface. Isso é uma DICA, NÃO uma restrição. "
                "Se o usuário perguntar sobre uma região ou imóvel diferente do que está na tela, "
                "use os parâmetros da PERGUNTA, não os da tela. "
                "Use o contexto da tela apenas para inferir a intenção de perguntas implícitas "
                "(ex: 'e essa região?' → usa a região ativa na tela).",

                # --- COMPORTAMENTO GERAL ---
                "Você pode responder sobre QUALQUER região, imóvel ou período disponível no banco. "
                "Se precisar de múltiplas ferramentas, chame quantas forem necessárias.",
                "Cite os números reais obtidos pelas ferramentas. Seja técnico, mas acessível.",
                "Responda sempre em Português do Brasil.",
                "Use Markdown com títulos, negritos e listas para uma leitura agradável.",
                "Se o usuário perguntar algo totalmente fora do contexto imobiliário do DF, redirecione gentilmente.",
                _CHART_FORMAT_INSTRUCTIONS,
            ],
            markdown=True,
            debug_mode=False,   # True = logs internos do Agno no terminal (apenas para debug)
            tools=[
                # Imóvel individual
                listar_todos_imoveis,
                obter_evolucao_imovel,
                obter_cagr_e_valorizacao_imovel,
                obter_top_imoveis_valorizados,
                obter_top_imoveis_desvalorizados,
                # Mercado e regiões
                obter_cagr_medio_por_regiao,
                obter_ranking_regioes_por_valorizacao,
                obter_preco_medio_por_regiao,
                obter_comparativo_regional_infraestrutura,
                obter_evolucao_mercado,
                obter_crescimento_anual_yoy_mercado,
                # Urbano e correlações
                obter_impacto_metragem,
                obter_impacto_distancia_metro,
                obter_impacto_criminalidade,
                obter_impacto_infraestrutura_e_valor_medio,
                obter_correlacao_custo_m2_e_valor,
                obter_matriz_correlacao_multivariada,
                obter_indices_crescimento_temporal,
                # Por nome de região
                obter_evolucao_por_nome_regiao,
                obter_maior_valorizacao_yoy_por_regiao,
            ],
        )
    return _property_agent


# ---------------------------------------------------------------------------
# Endpoint legado — análise de imóvel específico (/api/ai/analyze)
# ---------------------------------------------------------------------------

def analyze_property_with_ai(property_data: dict, user_question: Optional[str] = None) -> str:
    """
    Analisa um imóvel específico com IA e responde à pergunta do usuário.
    Usado pela tela de Portfólio de Ativos e pelo Simulador Financeiro.
    """
    agent = get_property_agent()
    metadata = property_data.get("metadata", {})

    valor_inicial = metadata.get("valor_inicial", 0)
    try:
        valor_str = f"R$ {float(valor_inicial):,.2f}"
    except (TypeError, ValueError):
        valor_str = str(valor_inicial)

    ficha = (
        f"### FICHA TÉCNICA DO ATIVO\n"
        f"- **ID**: {metadata.get('id_imovel')}\n"
        f"- **Região**: {metadata.get('nome_regiao')}\n"
        f"- **Área**: {metadata.get('metragem')} m²\n"
        f"- **Quartos**: {metadata.get('quartos')} | **Banheiros**: {metadata.get('banheiros')}\n"
        f"- **Ano de Entrega**: {metadata.get('ano_entrega')}\n"
        f"- **Valor Inicial**: {valor_str}\n\n"
        f"### PERFORMANCE HISTÓRICA\n"
        f"- **Valorização Total**: {property_data.get('total_appreciation_pct', 0):.2f}%\n"
        f"- **CAGR (Crescimento Anual)**: {property_data.get('cagr_pct', 0):.2f}%\n"
    )

    if user_question:
        prompt = f"Com base nos dados abaixo, responda à pergunta do usuário.\n\n{ficha}\n\n**PERGUNTA**: {user_question}"
    else:
        prompt = f"Com base nos dados abaixo, realize uma análise profunda do potencial deste imóvel como investimento e moradia.\n\n{ficha}"

    try:
        response = agent.run(prompt)
        return response.content
    except Exception as e:
        return f"Erro ao processar análise com IA: {str(e)}"


# ---------------------------------------------------------------------------
# Chat global contextual — (/api/ai/chat)
# ---------------------------------------------------------------------------

def _build_page_context_block(page_context: dict) -> str:
    """
    Monta o bloco de contexto de navegação injetado no prompt do agente.

    Este bloco informa ao agente em qual tela o usuário está e quais filtros
    estão ativos na interface. É um HINT, não uma restrição — a pergunta do
    usuário sempre tem prioridade sobre os filtros da tela.
    """
    route        = page_context.get("route", "/")
    screen_title = page_context.get("screenTitle", "Dashboard")
    active_filters = page_context.get("activeFilters", {})
    selected_data  = page_context.get("selectedData", None)

    lines = [
        "### CONTEXTO DE NAVEGAÇÃO (hint — não restringe suas consultas)",
        f"- **Tela atual**: {screen_title} (`{route}`)",
    ]

    if active_filters:
        clean = {k: v for k, v in active_filters.items() if v is not None}
        if clean:
            lines.append(f"- **Filtros visíveis na tela**: {clean}")

    if selected_data:
        preview = str(selected_data)
        if len(preview) > 500:
            preview = preview[:500] + "…(truncado)"
        lines.append(f"- **Item em foco na tela**: {preview}")

    lines.append(
        "\n> ⚠️ Se a pergunta mencionar região, imóvel ou período diferente dos filtros acima, "
        "IGNORE os filtros da tela e use os parâmetros da pergunta."
    )
    return "\n".join(lines)


def chat_with_context(message: str, page_context: dict, history: list[dict]) -> str:
    """
    Processa uma mensagem do chat global.

    Enriquece o prompt com o contexto da tela atual e as últimas mensagens
    do histórico, depois chama o agente Agno para gerar a resposta.

    Parâmetros
    ----------
    message      : mensagem atual do usuário
    page_context : contexto da tela (rota, filtros, item selecionado)
    history      : lista de mensagens anteriores {'role': ..., 'text': ...}
    """
    agent = get_property_agent()
    context_block = _build_page_context_block(page_context)

    # Montar histórico — últimas 6 mensagens para não estourar a context window
    history_block = ""
    if history:
        lines = ["\n### HISTÓRICO DA CONVERSA"]
        for msg in history[-6:]:
            label = "Usuário" if msg.get("role") == "user" else "HabitaData AI"
            lines.append(f"**{label}**: {msg.get('text', '')}")
        history_block = "\n".join(lines)

    # Detectar se o usuário quer um gráfico
    chart_keywords = [
        'gráfico', 'grafico', 'chart', 'visualiz', 'compare', 'comparar',
        'plotar', 'plot', 'mostre', 'exibir', 'barra', 'linha', 'pizza',
        'evolução', 'tendência', 'distribuição', 'ranking visual',
    ]
    wants_chart = any(kw in message.lower() for kw in chart_keywords)
    chart_hint = (
        "\n\n> LEMBRETE: O usuário quer um gráfico. Chame as ferramentas para "
        "obter os dados, depois emita o bloco ~~~chart conforme suas instruções."
        if wants_chart else ""
    )

    prompt = (
        f"{context_block}"
        f"{history_block}"
        f"\n\n### PERGUNTA DO USUÁRIO\n{message}"
        f"{chart_hint}"
        f"\n\n---\n"
        f"Responda com base nos dados REAIS do banco — chame as ferramentas "
        f"necessárias independentemente do que está na tela. Use Markdown."
    )

    try:
        response = agent.run(prompt)
        return response.content
    except Exception as e:
        return f"Erro ao processar a mensagem: {str(e)}"
