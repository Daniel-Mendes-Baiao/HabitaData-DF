"""
backend/main.py
===============
Ponto de entrada da API FastAPI para a Plataforma HabitaData DF.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import geospatial, market, properties, regions, analysis

app = FastAPI(
    title="HabitaData DF API",
    description="API analítica para a plataforma de visualização do mercado imobiliário do DF.",
    version="1.0.0",
)

# Configurar CORS para permitir que o frontend (Next.js) consuma a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar os routers
app.include_router(market.router, prefix="/api/market", tags=["Market Intelligence"])
app.include_router(regions.router, prefix="/api/regions", tags=["Region Intelligence"])
app.include_router(properties.router, prefix="/api/properties", tags=["Property Explorer"])
app.include_router(geospatial.router, prefix="/api/geospatial", tags=["GeoSpatial & Maps"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Advanced Analysis"])


@app.get("/")
def root():
    return {"message": "Bem-vindo à API do HabitaData DF", "docs": "/docs"}
