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
                "Você tem acesso aos dados técnicos de ativos imobiliários do DF.",
                "Sua missão é ajudar investidores e compradores a entenderem o valor real e o potencial de cada ativo.",
                "Analise valorização histórica (CAGR), metragem, localização e correlações urbanas.",
                "Seja técnico, mas acessível. Use dados para embasar suas opiniões.",
                "Responda sempre em Português do Brasil.",
                "Use Markdown com títulos, negritos e listas para uma leitura agradável.",
                "Se o usuário perguntar algo fora do contexto imobiliário do DF, gentilmente redirecione para o tema.",
                _CHART_FORMAT_INSTRUCTIONS,
            ],
            markdown=True,
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
    Recebe o page_context enviado pelo frontend e busca dados reais
    dos serviços de analytics para enriquecer o contexto do agente.
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

    # Enriquecimento por rota: busca dados reais do analytics layer
    try:
        import analytics as an
        from backend.services.analytics_adapter import df_to_dict, scalar_to_json

        # ---- Dashboard Central ----
        if route == "/":
            try:
                df_ranking = an.ranking_regioes(2021)
                top3 = df_to_dict(df_ranking.head(3))
                lines.append("\n### DADOS DO DASHBOARD (Top 3 Regiões por CAGR)")
                for r in top3:
                    lines.append(
                        f"- **{r.get('nome_regiao', '?')}**: CAGR {r.get('cagr_medio_pct', 0):.2f}%"
                    )
            except Exception:
                pass

        # ---- Análise Regional ----
        elif route == "/analysis/regional":
            ano = int(active_filters.get("ano", 2021)) if active_filters else 2021
            try:
                df_reg = an.get_regional_comparison_data(ano - 5, ano)
                sample = df_to_dict(df_reg.head(5))
                lines.append(f"\n### DADOS DE ANÁLISE REGIONAL (ano ref.: {ano})")
                for r in sample:
                    nome = r.get("nome_regiao", "?")
                    cagr = r.get("cagr_medio_pct") or r.get("cagr_pct") or 0
                    preco = r.get("valor_m2") or r.get("preco_m2_raw") or 0
                    lines.append(f"- **{nome}**: CAGR ~{cagr:.2f}%, Preço/m² ~R${preco:,.0f}")
            except Exception:
                pass

        # ---- Detalhamento de Ativos ----
        elif route == "/properties":
            if selected_data and isinstance(selected_data, dict):
                meta = selected_data.get("metadata", {})
                lines.append("\n### ATIVO SELECIONADO PELO USUÁRIO")
                lines.append(f"- **ID**: {meta.get('id_imovel', '?')}")
                lines.append(f"- **Região**: {meta.get('nome_regiao', '?')}")
                lines.append(f"- **Metragem**: {meta.get('metragem', '?')} m²")
                lines.append(f"- **Quartos/Banheiros**: {meta.get('quartos', '?')}/{meta.get('banheiros', '?')}")
                cagr = selected_data.get("cagr_pct", 0)
                total_ap = selected_data.get("total_appreciation_pct", 0)
                lines.append(f"- **CAGR**: {cagr:.2f}%")
                lines.append(f"- **Valorização Total**: {total_ap:.2f}%")
            else:
                try:
                    df_top = an.top_valorizados(5, 2010, 2025)
                    top5 = df_to_dict(df_top)
                    lines.append("\n### TOP 5 ATIVOS MAIS VALORIZADOS")
                    for p in top5:
                        lines.append(
                            f"- ID {p.get('id_imovel', '?')} ({p.get('nome_regiao', '?')}): CAGR {p.get('cagr_pct', 0):.2f}%"
                        )
                except Exception:
                    pass

        # ---- Simulador Financeiro ----
        elif route == "/simulator":
            if selected_data and isinstance(selected_data, dict):
                lines.append("\n### PARÂMETROS DO SIMULADOR")
                for k, v in selected_data.items():
                    lines.append(f"- **{k}**: {v}")

    except Exception:
        # Se o analytics não estiver disponível, continua sem enriquecimento
        pass

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
