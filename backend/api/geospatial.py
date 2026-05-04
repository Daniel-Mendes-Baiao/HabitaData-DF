"""
backend/api/geospatial.py
=========================
Rotas para visualizações geoespaciais e análises urbanas
(Deck.gl Layer Data, etc.).
"""

from fastapi import APIRouter, Query

import analytics as an
from backend.services.analytics_adapter import df_to_dict

router = APIRouter()


@router.get("/urban_factors/metragem")
def get_metragem_impact(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Impacto da metragem na valorização (CAGR médio por faixa de m²)."""
    df = an.impacto_metragem(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


@router.get("/urban_factors/metro")
def get_metro_impact(ano: int = Query(2025)):
    """Preço médio vs Distância do Metrô por região no ano especificado."""
    df = an.impacto_distancia_metro(ano)
    return {"data": df_to_dict(df)}


@router.get("/urban_factors/criminality")
def get_criminality_impact(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """CAGR médio por região cruzado com o índice de criminalidade."""
    df = an.impacto_criminalidade(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


@router.get("/urban_factors/infrastructure")
def get_infrastructure_impact(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Score composto de infraestrutura por região/ano vs Valorização."""
    df = an.impacto_infraestrutura(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


@router.get("/urban_factors/cost_m2_correlation")
def get_cost_m2_correlation(
    ano_inicio: int = Query(2010),
    ano_fim: int = Query(2025)
):
    """Correlações de Pearson e Spearman do Custo do m² com o Preço Estimado."""
    df = an.correlacao_custo_m2(ano_inicio, ano_fim)
    return {"data": df_to_dict(df)}


# Coordenadas aproximadas para as Regiões Administrativas (RAs) do DF
REGION_COORDINATES = {
    "PLANO PILOTO": {"lat": -15.7942, "lon": -47.8828},
    "AGUAS CLARAS": {"lat": -15.8400, "lon": -48.0280},
    "CEILANDIA": {"lat": -15.8200, "lon": -48.1100},
    "TAGUATINGA": {"lat": -15.8300, "lon": -48.0500},
    "GUARA": {"lat": -15.8200, "lon": -47.9800},
    "SOBRADINHO": {"lat": -15.6500, "lon": -47.7900},
    "PLANALTINA": {"lat": -15.6100, "lon": -47.6500},
    "SAMAMBAIA": {"lat": -15.8700, "lon": -48.0800},
    "SANTA MARIA": {"lat": -16.0100, "lon": -48.0100},
    "GAMA": {"lat": -16.0100, "lon": -48.0600},
    "RECANTO DAS EMAS": {"lat": -15.9000, "lon": -48.0600},
    "RIACHO FUNDO": {"lat": -15.8800, "lon": -48.0100},
    "CRUZEIRO": {"lat": -15.7900, "lon": -47.9300},
    "SUDOESTE/OCTOGONAL": {"lat": -15.8000, "lon": -47.9200},
    "LAGO SUL": {"lat": -15.8300, "lon": -47.8800},
    "LAGO NORTE": {"lat": -15.7500, "lon": -47.8600},
    "VICENTE PIRES": {"lat": -15.8000, "lon": -48.0200},
    "PARK WAY": {"lat": -15.8700, "lon": -47.9500},
    "JARDIM BOTANICO": {"lat": -15.8600, "lon": -47.8100},
    "ITAPOA": {"lat": -15.7500, "lon": -47.7600},
    "PARANOA": {"lat": -15.7700, "lon": -47.7800},
    "CANDANGOLANDIA": {"lat": -15.8400, "lon": -47.9500},
    "NUCLEO BANDEIRANTE": {"lat": -15.8700, "lon": -47.9600},
    "VARJAO": {"lat": -15.7300, "lon": -47.8700},
    "FERCAL": {"lat": -15.5900, "lon": -47.8700},
    "SIA": {"lat": -15.8000, "lon": -47.9500},
    "SCIA/ESTRUTURAL": {"lat": -15.7800, "lon": -47.9800},
    "SOBRADINHO II": {"lat": -15.6200, "lon": -47.8100},
    "BRAZLANDIA": {"lat": -15.6700, "lon": -48.2000},
}


@router.get("/map/regions3d")
def get_regions_3d_map_data(
    ano: int = Query(2021)
):
    """
    Gera uma matriz densa de pontos (Virtual Grid) para o Deck.gl,
    utilizando interpolação baseada nas regiões reais.
    """
    # Dados base das regiões reais
    df_precos = an.preco_medio_por_regiao(ano)
    df_cagr = an.valorizacao_media_por_regiao(ano - 1, ano)
    df_infra = an.impacto_infraestrutura(ano, ano)
    df_metro = an.impacto_distancia_metro(ano)

    # Mergeando dados reais
    df_real = df_precos
    if not df_cagr.empty:
        df_real = df_real.merge(df_cagr[['nome_regiao', 'cagr_medio_pct']], on="nome_regiao", how="left")
    if not df_infra.empty:
        df_real = df_real.merge(df_infra[['nome_regiao', 'score_infra', 'indice_criminalidade']], on="nome_regiao", how="left")
    if not df_metro.empty:
        df_real = df_real.merge(df_metro[['nome_regiao', 'distancia_metro_km']], on="nome_regiao", how="left")

    real_records = df_to_dict(df_real)
    
    # Adicionar coordenadas aos registros reais
    for rec in real_records:
        reg_name = rec.get("nome_regiao", "").upper()
        coords = REGION_COORDINATES.get(reg_name, {"lat": -15.7942, "lon": -47.8828})
        rec["lat"] = coords["lat"]
        rec["lon"] = coords["lon"]

    # Gerar Grid Virtual (30x30)
    # Bounding box DF aproximada
    lat_min, lat_max = -16.05, -15.55
    lon_min, lon_max = -48.25, -47.45
    steps = 30
    
    grid_data = []
    import math

    for i in range(steps):
        for j in range(steps):
            curr_lat = lat_min + (lat_max - lat_min) * (i / steps)
            curr_lon = lon_min + (lon_max - lon_min) * (j / steps)
            
            # Interpolação simples (IDW - Inverse Distance Weighting)
            total_weight = 0
            interp_values = {
                "valor_medio": 0,
                "cagr_medio_pct": 0,
                "indice_criminalidade": 0,
                "distancia_metro_km": 0
            }
            
            for real in real_records:
                # Distância euclidiana simplificada
                dist = math.sqrt((curr_lat - real["lat"])**2 + (curr_lon - real["lon"])**2)
                if dist == 0: dist = 0.001
                
                weight = 1.0 / (dist ** 2)
                total_weight += weight
                
                for key in interp_values:
                    interp_values[key] += (real.get(key) or 0) * weight
            
            if total_weight > 0:
                record = {
                    "latitude": curr_lat,
                    "longitude": curr_lon,
                    "nome_regiao": "Virtual Node"
                }
                for key in interp_values:
                    record[key] = interp_values[key] / total_weight
                
                # Só adiciona se o peso for significativo (limita o espalhamento infinito)
                grid_data.append(record)

    return grid_data
