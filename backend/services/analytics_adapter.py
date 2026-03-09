"""
backend/services/analytics_adapter.py
=====================================
Serviço adaptador que converte os retornos Pandas da camada analítica
para estruturas nativas do Python (dict/list) prontas para o FastAPI serializar.
"""

import math
from typing import Any

import pandas as pd


def df_to_dict(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Converte um DataFrame para uma lista de dicionários,
    substituindo NaNs/Infinities por None para compatibilidade JSON.
    """
    if df.empty:
        return []

    # Substituir NaN/Inf por None
    df = df.replace([math.inf, -math.inf], None)
    df = df.where(pd.notnull(df), None)

    # Converter para tipos nativos do Python que o JSON serializa (resolve numpy types)
    # df.to_dict(orient="records") não garante nativos se as colunas forem numpy objects
    records = df.to_dict(orient="records")
    
    # Limpeza profunda para garantir que nada do numpy sobrou (crucial para o 500)
    for row in records:
        for key, val in row.items():
            if hasattr(val, "item"): # numpy types haben .item()
                row[key] = val.item()
            elif isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                row[key] = None
                
    return records


def scalar_to_json(val: Any) -> float | None:
    """Garante que escalares (CAGR, %, etc.) sejam convertidos para float nativo ou None."""
    try:
        if val is None:
            return None
        # Tentar converter para float nativo (isso resolve numpy.float64, etc.)
        f_val = float(val)
        if math.isnan(f_val) or math.isinf(f_val):
            return None
        return f_val
    except (TypeError, ValueError):
        return None
