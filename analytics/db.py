"""
analytics/db.py
===============
HabitaData DF — Camada de acesso ao banco SQLite.

Provê:
  - DB_PATH: caminho padrão para habitadata_df.db
  - get_connection(): abre conexão configurada
  - query(): executa SQL e retorna pd.DataFrame
"""

import sqlite3
from pathlib import Path

import pandas as pd

# Resolve o banco relativo à raiz do projeto (dois níveis acima de analytics/)
DB_PATH: Path = Path(__file__).parent.parent / "habitadata_df.db"


def get_connection(db_path: Path | str | None = None) -> sqlite3.Connection:
    """
    Abre e retorna uma conexão SQLite configurada.

    Parâmetros
    ----------
    db_path : Path | str | None
        Caminho para o arquivo .db. Se None, usa DB_PATH padrão.

    Retorno
    -------
    sqlite3.Connection com:
      - row_factory = sqlite3.Row    (acesso por nome de coluna)
      - foreign_keys = ON
      - journal_mode = WAL            (leituras concorrentes)
      - cache_size  = -4000           (~4 MB)
    """
    path = Path(db_path) if db_path else DB_PATH

    if not path.exists():
        raise FileNotFoundError(
            f"Banco de dados não encontrado: {path}\n"
            "Execute setup_db.py para criar o banco antes de usar a camada analítica."
        )

    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA cache_size  = -4000;")
    return conn


def query(
    sql: str,
    params: tuple | list | dict | None = None,
    db_path: Path | str | None = None,
) -> pd.DataFrame:
    """
    Executa uma query SQL e retorna os resultados como DataFrame.

    Parâmetros
    ----------
    sql : str
        Instrução SQL (SELECT).
    params : tuple | list | dict | None
        Parâmetros de substituição (posicionais '?' ou nomeados ':nome').
    db_path : Path | str | None
        Caminho alternativo para o banco. Se None, usa DB_PATH padrão.

    Retorno
    -------
    pd.DataFrame com os resultados. DataFrame vazio se não houver linhas.
    """
    with get_connection(db_path) as conn:
        return pd.read_sql_query(sql, conn, params=params)
