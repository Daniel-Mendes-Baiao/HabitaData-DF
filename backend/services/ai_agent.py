"""
backend/services/ai_agent.py
============================
Serviço de IA para o HabitaData DF.
Contém o agente Agno para análise de imóveis e o chat global contextual.
"""

from agno.agent import Agent
from agno.models.openai import OpenAIChat
import os
from typing import Optional
from dotenv import load_dotenv

# Configuração da OpenRouter
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


# ---------------------------------------------------------------------------
# Agente singleton
# ---------------------------------------------------------------------------

_property_agent = None

# Schema do bloco de gráfico — injetado no prompt do agente
_CHART_FORMAT_INSTRUCTIONS = """
## CAPACIDADE DE GRÁFICOS

Quando o usuário pedir uma visualização, comparativo ou análise gráfica, você DEVE emitir
um bloco de gráfico usando EXATAMENTE o formato abaixo. Nunca use ASCII art ou tabelas
Markdown para substituir gráficos quando dados numéricos estiverem disponíveis.

FORMATO DO BLOCO (use somente dados reais fornecidos no contexto):

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
- "bar": comparativo entre categorias (ex: CAGR por região)
- "line": evolução temporal (ex: preço ao longo dos anos)
- "scatter": correlação entre duas variáveis
- "pie": distribuição percentual

REGRAS CRÍTICAS:
1. Use ~~~chart APENAS quando os dados numéricos estiverem disponíveis no contexto.
2. NUNCA invente valores — use somente dados fornecidos explicitamente.
3. Você pode combinar texto explicativo ANTES e DEPOIS do bloco ~~~chart.
4. O JSON dentro do bloco deve ser válido e bem-formatado.
5. Para gráficos de pizza (pie): use "x" para rótulos e "y" para valores.
6. Use cores da paleta: #10b981 (emerald), #3b82f6 (blue), #f59e0b (amber), #8b5cf6 (purple).
"""

# ---------------------------------------------------------------------------
# Ferramentas de Análise (Tools para o Agente)
# ---------------------------------------------------------------------------

def listar_todos_imoveis() -> list[dict]:
    """
    Retorna a lista de todos os imóveis cadastrados no sistema, incluindo ID, região, metragem, quartos, banheiros, ano de entrega e o último valor estimado.
    Útil para listar os IDs e características básicas de todos os imóveis disponíveis.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.listar_imoveis())

def obter_evolucao_imovel(id_imovel: int) -> list[dict]:
    """
    Retorna a evolução histórica anual de preço (série histórica de valores estimados) e a variação ano a ano (YoY) de um imóvel específico a partir do seu ID.
    Use quando o usuário pedir a evolução de preço ou histórico detalhado de um imóvel específico.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.evolucao_imovel(id_imovel))

def obter_cagr_e_valorizacao_imovel(id_imovel: int) -> dict:
    """
    Retorna o CAGR (%) (Compound Annual Growth Rate / Taxa de Crescimento Anual Composto) e a valorização percentual total (%) de um imóvel específico a partir do seu ID.
    Use para analisar a taxa de retorno anualizada e a valorização total acumulada de um imóvel específico.
    """
    import analytics as an
    from backend.services.analytics_adapter import scalar_to_json
    cagr = scalar_to_json(an.cagr_imovel(id_imovel))
    val = scalar_to_json(an.valorizacao_percentual(id_imovel))
    return {"id_imovel": id_imovel, "cagr_pct": cagr, "total_appreciation_pct": val}

def obter_top_imoveis_valorizados(n: int = 5, ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Retorna os N imóveis com maior CAGR (taxa de valorização anual) no período especificado.
    Útil para encontrar e listar os imóveis mais rentáveis e com melhor desempenho histórico.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.top_valorizados(n, ano_inicio, ano_fim))

def obter_top_imoveis_desvalorizados(n: int = 5, ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Retorna os N imóveis com menor CAGR (pior desempenho ou desvalorização) no período especificado.
    Útil para encontrar e listar imóveis com pior rentabilidade histórica.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.top_desvalorizados(n, ano_inicio, ano_fim))

def obter_cagr_medio_por_regiao(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Calcula a taxa de valorização média (CAGR médio), mediana e desvio-padrão dos imóveis agrupados por região no período especificado.
    Útil para saber quais regiões mais valorizaram no Distrito Federal de forma geral.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.valorizacao_media_por_regiao(ano_inicio, ano_fim))

def obter_ranking_regioes_por_valorizacao(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Retorna o ranking das regiões administrativas ordenadas por CAGR médio no período especificado.
    Use para saber a posição relativa e classificação de valorização de cada região.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.ranking_regioes(ano_inicio, ano_fim))

def obter_preco_medio_por_regiao(ano: int = 2025) -> list[dict]:
    """
    Retorna estatísticas de preço (média, mediana, mínimo, máximo) dos imóveis por região em um ano específico.
    Use para responder qual é a região mais cara, mais barata ou obter o preço médio dos imóveis em determinado ano.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.preco_medio_por_regiao(ano))

def obter_comparativo_regional_infraestrutura(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Retorna o comparativo regional contendo o preço/m² médio, CAGR médio, distância média ao metrô, quantidade de escolas, segurança e criminalidade por região.
    Use para responder perguntas comparativas de infraestrutura, segurança, relação risco/retorno e correlação urbana entre as regiões.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.get_regional_comparison_data(ano_inicio, ano_fim))

def obter_evolucao_mercado(id_regiao: Optional[int] = None) -> list[dict]:
    """
    Retorna a evolução histórica anual do valor médio e mediana de mercado geral (se id_regiao for None) ou de uma região específica (passando o id_regiao).
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.evolucao_mercado(id_regiao))

def obter_crescimento_anual_yoy_mercado(id_regiao: Optional[int] = None) -> list[dict]:
    """
    Calcula a variação percentual anual (ano a ano - YoY) do valor médio do mercado geral ou de uma região específica.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.crescimento_anual_mercado(id_regiao))

def obter_impacto_metragem(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Retorna o impacto do tamanho/metragem dos imóveis na taxa de valorização (CAGR) por faixa de área útil (ex: <=50m², 51-60m², etc.).
    Use para responder qual tamanho de imóvel valoriza mais ou se imóveis menores valorizam mais rápido que imóveis grandes.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.impacto_metragem(ano_inicio, ano_fim))

def obter_impacto_distancia_metro(ano: int = 2025) -> list[dict]:
    """
    Relaciona os valores dos imóveis com a distância média da região para as estações de metrô em um ano específico.
    Use para analisar se a proximidade ao metrô afeta o preço ou valorização dos imóveis.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.impacto_distancia_metro(ano))

def obter_impacto_criminalidade(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Analisa a relação entre a criminalidade média (segurança) e a taxa de valorização (CAGR) dos imóveis por região.
    Use para responder sobre o impacto da segurança/violência urbana na valorização imobiliária.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.impacto_criminalidade(ano_inicio, ano_fim))

def obter_impacto_infraestrutura_e_valor_medio(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Retorna o score composto de infraestrutura urbana das regiões (escolas, hospitais, comércio, segurança, metrô) relacionado com os valores médios de imóveis por ano.
    Use para responder sobre o impacto do desenvolvimento urbano nos preços de mercado.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.impacto_infraestrutura(ano_inicio, ano_fim))

def obter_correlacao_custo_m2_e_valor(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Retorna a correlação estatística entre o custo de construção do m² regional e o preço final dos imóveis.
    Use para responder se o preço do imóvel acompanha o custo da construção civil.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.correlacao_custo_m2(ano_inicio, ano_fim))

def obter_matriz_correlacao_multivariada(ano_inicio: int = 2010, ano_fim: int = 2025) -> list[dict]:
    """
    Calcula a matriz de correlação estatística de Pearson cruzando todas as variáveis numéricas do dataset multivariado (metragem, quartos, banheiros, CAGR, distância metrô, escolas, criminalidade).
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.get_correlation_matrix(ano_inicio, ano_fim))

def obter_indices_crescimento_temporal(regioes: Optional[list[str]] = None) -> list[dict]:
    """
    Retorna a evolução temporal e índices base 100 de fatores urbanos (metrô, escolas, criminalidade, preço do m²) de regiões administrativas específicas.
    Use para analisar tendências e crescimento de longo prazo por cidade.
    """
    import analytics as an
    from backend.services.analytics_adapter import df_to_dict
    return df_to_dict(an.get_temporal_growth_indices(regioes))


def get_property_agent() -> Agent:
    """Retorna a instância singleton do agente Agno (lazy initialization)."""
    global _property_agent
    if _property_agent is None:
        _property_agent = Agent(
            model=OpenAIChat(
                id="google/gemma-4-31b-it:free",
                api_key=OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                role_map={
                    "system": "system",
                    "user": "user",
                    "assistant": "assistant",
                    "tool": "tool",
                }
            ),
            description="Você é o HabitaData AI, um especialista sênior em mercado imobiliário do Distrito Federal.",
            instructions=[
                "Você tem acesso a ferramentas/funções para obter dados dinâmicos do banco de dados/camada analítica do Distrito Federal.",
                "Sempre que precisar responder a perguntas sobre preços, valorização, CAGR, infraestrutura ou comparação de regiões, utilize as funções/ferramentas apropriadas.",
                "O bloco '### CONTEXTO DA TELA ATUAL' descreve o que o usuário está vendo na interface (filtros selecionados, tela atual, item selecionado). Use esses parâmetros/filtros nas chamadas de funções/ferramentas quando fizer sentido (ex: use o ano ou regiões listadas nos filtros se o usuário fizer uma pergunta implícita ou geral).",
                "Você tem acesso aos dados técnicos de ativos imobiliários do DF através das ferramentas.",
                "Sua missão é ajudar investidores e compradores a entenderem o valor real e o potencial de cada ativo.",
                "Analise valorização histórica (CAGR), metragem, localização e correlações urbanas usando os resultados das funções chamadas.",
                "Seja técnico, mas acessível. Use dados obtidos pelas ferramentas para embasar suas opiniões.",
                "Responda sempre em Português do Brasil.",
                "Use Markdown com títulos, negritos e listas para uma leitura agradável.",
                "Se o usuário perguntar algo fora do contexto imobiliário do DF, gentilmente redirecione para o tema.",
                _CHART_FORMAT_INSTRUCTIONS,
            ],
            markdown=True,
            debug_mode=True,
            tools=[
                listar_todos_imoveis,
                obter_evolucao_imovel,
                obter_cagr_e_valorizacao_imovel,
                obter_top_imoveis_valorizados,
                obter_top_imoveis_desvalorizados,
                obter_cagr_medio_por_regiao,
                obter_ranking_regioes_por_valorizacao,
                obter_preco_medio_por_regiao,
                obter_comparativo_regional_infraestrutura,
                obter_evolucao_mercado,
                obter_crescimento_anual_yoy_mercado,
                obter_impacto_metragem,
                obter_impacto_distancia_metro,
                obter_impacto_criminalidade,
                obter_impacto_infraestrutura_e_valor_medio,
                obter_correlacao_custo_m2_e_valor,
                obter_matriz_correlacao_multivariada,
                obter_indices_crescimento_temporal
            ]
        )
    return _property_agent


# ---------------------------------------------------------------------------
# Análise de imóvel individual (endpoint legado /api/ai/analyze)
# ---------------------------------------------------------------------------

def analyze_property_with_ai(property_data: dict, user_question: Optional[str] = None) -> str:
    """Analisa um imóvel específico e responde à pergunta do usuário."""
    agent = get_property_agent()

    metadata = property_data.get("metadata", {})

    valor_inicial = metadata.get("valor_inicial", 0)
    try:
        valor_str = f"R$ {float(valor_inicial):,.2f}"
    except (TypeError, ValueError):
        valor_str = str(valor_inicial)

    context = f"""
### FICHA TÉCNICA DO ATIVO
- **ID**: {metadata.get('id_imovel')}
- **Região Administrativa**: {metadata.get('nome_regiao')}
- **Área Privativa**: {metadata.get('metragem')} m²
- **Quartos**: {metadata.get('quartos')} | **Banheiros**: {metadata.get('banheiros')}
- **Ano de Entrega**: {metadata.get('ano_entrega')}
- **Valor Inicial**: {valor_str}

### PERFORMANCE HISTÓRICA
- **Valorização Total**: {property_data.get('total_appreciation_pct', 0):.2f}%
- **CAGR (Crescimento Anual)**: {property_data.get('cagr_pct', 0):.2f}%
"""

    if user_question:
        prompt = (
            f"Com base nos dados abaixo, responda à pergunta do usuário.\n\n"
            f"{context}\n\n**PERGUNTA DO USUÁRIO**: {user_question}"
        )
    else:
        prompt = (
            f"Com base nos dados abaixo, realize uma análise profunda do potencial "
            f"deste imóvel como investimento e moradia.\n\n{context}"
        )

    try:
        response = agent.run(prompt)
        return response.content
    except Exception as e:
        return f"Erro ao processar análise com IA: {str(e)}"


# ---------------------------------------------------------------------------
# Chat global contextual (endpoint novo /api/ai/chat)
# ---------------------------------------------------------------------------

def _build_page_context_block(page_context: dict) -> str:
    """
    Recebe o page_context enviado pelo frontend e descreve a tela atual e os filtros selecionados,
    sem buscar dados do banco de dados/analytics de forma pública e procedural.
    Serve para que o agente saiba em qual tela o usuário está e quais filtros/dados estão ativos.
    """
    route = page_context.get("route", "/")
    screen_title = page_context.get("screenTitle", "Dashboard")
    active_filters = page_context.get("activeFilters", {})
    selected_data = page_context.get("selectedData", None)

    lines = [
        "### CONTEXTO DA TELA ATUAL",
        f"- **Tela**: {screen_title} (`{route}`)",
    ]

    if active_filters:
        lines.append(f"- **Filtros ativos**: {active_filters}")

    if selected_data:
        lines.append(f"- **Dados/Item Selecionado**: {selected_data}")

    return "\n".join(lines)


def chat_with_context(
    message: str,
    page_context: dict,
    history: list[dict],
) -> str:
    """
    Endpoint principal do chat global.
    Enriquece o prompt com dados reais da plataforma conforme a tela atual
    e chama o agente Agno com o histórico da conversa.
    """
    agent = get_property_agent()

    context_block = _build_page_context_block(page_context)

    # Montar o histórico como texto para injetar no prompt
    history_block = ""
    if history:
        history_lines = ["\n### HISTÓRICO DA CONVERSA"]
        for msg in history[-6:]:  # últimas 6 mensagens para não estourar context window
            role_label = "Usuário" if msg.get("role") == "user" else "HabitaData AI"
            history_lines.append(f"**{role_label}**: {msg.get('text', '')}")
        history_block = "\n".join(history_lines)

    # Detectar se o usuário está pedindo uma visualização gráfica
    chart_keywords = [
        'gráfico', 'grafico', 'chart', 'visualiz', 'compare', 'comparar',
        'plotar', 'plot', 'mostre', 'exibir', 'barra', 'linha', 'pizza',
        'evolução', 'tendência', 'distribuição', 'ranking visual',
    ]
    user_wants_chart = any(kw in message.lower() for kw in chart_keywords)

    chart_reminder = (
        "\n\n> LEMBRETE: O usuário parece querer uma visualização. "
        "Se os dados numéricos estiverem disponíveis no contexto acima, "
        "emita um bloco ~~~chart com o JSON estruturado conforme suas instruções."
        if user_wants_chart else ""
    )

    prompt = (
        f"{context_block}"
        f"{history_block}"
        f"\n\n### MENSAGEM ATUAL DO USUÁRIO\n{message}"
        f"{chart_reminder}"
        f"\n\nResponda de forma útil, contextual e técnica. "
        f"Use os dados fornecidos acima para embasar sua resposta sempre que relevante."
    )

    try:
        response = agent.run(prompt)
        return response.content
    except Exception as e:
        return f"Erro ao processar a mensagem: {str(e)}"
