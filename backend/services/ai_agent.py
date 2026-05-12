import os
from functools import lru_cache


try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional local configuration helper
    load_dotenv = None


if load_dotenv:
    load_dotenv()


def _format_currency(value) -> str:
    if value is None:
        return "não informado"
    try:
        return f"R$ {float(value):,.2f}"
    except (TypeError, ValueError):
        return str(value)


def _format_percent(value) -> str:
    if value is None:
        return "não informado"
    try:
        return f"{float(value):.2f}%"
    except (TypeError, ValueError):
        return str(value)


@lru_cache(maxsize=1)
def get_property_agent():
    try:
        from agno.agent import Agent
        from agno.models.openai import OpenAIChat
    except ImportError as exc:
        raise RuntimeError(
            "A análise com IA precisa das dependências opcionais 'agno' e "
            "'python-dotenv'. Instale-as antes de usar /api/ai/analyze."
        ) from exc

    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY não configurada. Defina essa variável de "
            "ambiente para usar a análise com IA."
        )

    return Agent(
        model=OpenAIChat(
            id="google/gemma-3-27b-it:free",
            api_key=openrouter_api_key,
            base_url="https://openrouter.ai/api/v1"
        ),
        description="Você é o HabitaData AI, um especialista sênior em mercado imobiliário do Distrito Federal.",
        instructions=[
            "Você tem acesso aos dados técnicos de ativos imobiliários do DF.",
            "Sua missão é ajudar investidores e compradores a entenderem o valor real e o potencial de cada ativo.",
            "Analise valorização histórica (CAGR), metragem, localização e correlações urbanas.",
            "Seja técnico, mas acessível. Use dados para embasar suas opiniões.",
            "Responda sempre em Português do Brasil.",
            "Use Markdown com títulos, negritos e listas para uma leitura agradável.",
            "Se o usuário perguntar algo fora do contexto imobiliário do DF, gentilmente redirecione para o tema."
        ],
        markdown=True
    )

def analyze_property_with_ai(property_data: dict, user_question: str = None):
    metadata = property_data.get('metadata', {})
    valor_inicial = _format_currency(metadata.get('valor_inicial'))
    valorizacao_total = _format_percent(property_data.get('total_appreciation_pct'))
    cagr = _format_percent(property_data.get('cagr_pct'))

    context = f"""
    ### FICHA TÉCNICA DO ATIVO
    - **ID**: {metadata.get('id_imovel')}
    - **Região Administrativa**: {metadata.get('nome_regiao')}
    - **Área Privativa**: {metadata.get('metragem')} m²
    - **Quartos**: {metadata.get('quartos')} | **Banheiros**: {metadata.get('banheiros')}
    - **Ano de Entrega**: {metadata.get('ano_entrega')}
    - **Valor Inicial**: {valor_inicial}
    
    ### PERFORMANCE HISTÓRICA
    - **Valorização Total**: {valorizacao_total}
    - **CAGR (Crescimento Anual)**: {cagr}
    """
    
    if user_question:
        prompt = f"Com base nos dados abaixo, responda à pergunta do usuário.\n\n{context}\n\n**PERGUNTA DO USUÁRIO**: {user_question}"
    else:
        prompt = f"Com base nos dados abaixo, realize uma análise profunda do potencial deste imóvel como investimento e moradia.\n\n{context}"

    try:
        agent = get_property_agent()
        response = agent.run(prompt)
        return response.content
    except Exception:
        return _build_local_analysis(property_data, user_question)


def _build_local_analysis(property_data: dict, user_question: str = None) -> str:
    metadata = property_data.get('metadata', {})
    region = metadata.get('nome_regiao', 'região selecionada')
    metragem = metadata.get('metragem', 'não informada')
    valorizacao_total = _format_percent(property_data.get('total_appreciation_pct'))
    cagr = _format_percent(property_data.get('cagr_pct'))
    valor_inicial = _format_currency(metadata.get('valor_inicial'))

    if user_question:
        return f"""
### Resposta rápida

No momento a IA externa não está disponível, então usei a análise local da plataforma.

Para a pergunta **"{user_question}"**, o ponto central é comparar o perfil do ativo em **{region}** com seu objetivo:

- **Valor inicial:** {valor_inicial}
- **Área:** {metragem} m²
- **Valorização total:** {valorizacao_total}
- **CAGR anual:** {cagr}

Se o CAGR for positivo e consistente, o ativo tende a ser mais interessante para valorização patrimonial. Se a prioridade for renda, ainda vale cruzar esse resultado com liquidez, aluguel esperado, condomínio e vacância.
""".strip()

    return f"""
### Análise local do ativo

No momento a IA externa não está disponível, então gerei uma leitura objetiva com os dados da própria plataforma.

**Resumo do imóvel**

- **Região:** {region}
- **Área:** {metragem} m²
- **Valor inicial:** {valor_inicial}
- **Valorização total:** {valorizacao_total}
- **CAGR anual:** {cagr}

**Leitura prática**

Um CAGR positivo indica crescimento médio anual do valor do imóvel. Para decisão de compra, compare esse retorno com custo de oportunidade, liquidez da região, distância de infraestrutura relevante e perfil de uso: moradia, revenda ou aluguel.

**Próximo passo recomendado**

Use a comparação regional para ver se **{region}** está performando acima ou abaixo de áreas parecidas. Isso evita decidir apenas pelo preço absoluto.
""".strip()
