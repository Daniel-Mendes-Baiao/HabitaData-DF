"""
backend/main.py
===============
Ponto de entrada da API FastAPI — HabitaData DF.

Registra todos os routers e configura middleware de CORS para
permitir que o frontend Next.js (porta 3000) consuma a API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import geospatial, market, properties, regions, analysis, ai

# ---------------------------------------------------------------------------
# Aplicação
# ---------------------------------------------------------------------------

app = FastAPI(
    title="HabitaData DF — API",
    description=(
        "API analítica da plataforma HabitaData DF. "
        "Fornece dados de mercado imobiliário, valorização histórica, "
        "impacto urbano e respostas de IA para o Distrito Federal."
    ),
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — permite consumo pelo frontend em localhost:3000
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(market.router,     prefix="/api/market",      tags=["Mercado"])
app.include_router(regions.router,    prefix="/api/regions",     tags=["Regiões"])
app.include_router(properties.router, prefix="/api/properties",  tags=["Ativos"])
app.include_router(geospatial.router, prefix="/api/geospatial",  tags=["Geoespacial"])
app.include_router(analysis.router,   prefix="/api/analysis",    tags=["Análise"])
app.include_router(ai.router,         prefix="/api/ai",          tags=["IA"])

# ---------------------------------------------------------------------------
# Endpoints raiz
# ---------------------------------------------------------------------------

@app.get("/", tags=["Status"])
def root():
    """Endpoint raiz — confirma que a API está no ar."""
    return {
        "status": "online",
        "app": "HabitaData DF API",
        "version": "2.4.0",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Status"])
def health_check():
    """
    Health check para uso pelo script de inicialização (run.py).
    Retorna 200 quando a API está pronta para receber requisições.
    """
    return {"status": "healthy"}
