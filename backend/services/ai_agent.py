from agno.agent import Agent
from agno.models.openai import OpenAIChat
import os
from dotenv import load_dotenv

# Configuração da OpenRouter
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


# Cache global para reaproveitar a instância do agente de IA
_property_agent = None

def get_property_agent():
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
                "Se o usuário perguntar algo fora do contexto imobiliário do DF, gentilmente redirecione para o tema."
            ],
            markdown=True
        )
    return _property_agent

def analyze_property_with_ai(property_data: dict, user_question: str = None):
    agent = get_property_agent()
    
    metadata = property_data.get('metadata', {})
    
    context = f"""
    ### FICHA TÉCNICA DO ATIVO
    - **ID**: {metadata.get('id_imovel')}
    - **Região Administrativa**: {metadata.get('nome_regiao')}
    - **Área Privativa**: {metadata.get('metragem')} m²
    - **Quartos**: {metadata.get('quartos')} | **Banheiros**: {metadata.get('banheiros')}
    - **Ano de Entrega**: {metadata.get('ano_entrega')}
    - **Valor Inicial**: R$ {metadata.get('valor_inicial'):,.2f}
    
    ### PERFORMANCE HISTÓRICA
    - **Valorização Total**: {property_data.get('total_appreciation_pct', 0):.2f}%
    - **CAGR (Crescimento Anual)**: {property_data.get('cagr_pct', 0):.2f}%
    """
    
    if user_question:
        prompt = f"Com base nos dados abaixo, responda à pergunta do usuário.\n\n{context}\n\n**PERGUNTA DO USUÁRIO**: {user_question}"
    else:
        prompt = f"Com base nos dados abaixo, realize uma análise profunda do potencial deste imóvel como investimento e moradia.\n\n{context}"
        
    try:
        response = agent.run(prompt)
        return response.content
    except Exception as e:
        return f"Erro ao processar análise com IA: {str(e)}"
