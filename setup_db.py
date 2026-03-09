"""
setup_db.py
===========
HabitaData DF — Criação e carga inicial do banco SQLite.

Uso:
    python setup_db.py

O script:
  1. Lê o schema SQL (schema.sql) e cria todas as tabelas e índices.
  2. Carrega cada arquivo CSV da pasta dataset/ na order correta
     (respeitando as dependências de FK: regioes → imoveis → séries temporais).
  3. Exibe um resumo da carga ao final.

Requisitos: Python 3.8+ (stdlib apenas — sqlite3, csv, pathlib, logging)
"""

import csv
import logging
import sqlite3
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

BASE_DIR    = Path(__file__).parent          # c:\...\PI\
DATASET_DIR = BASE_DIR / "dataset"
SCHEMA_FILE = BASE_DIR / "schema.sql"
DB_FILE     = BASE_DIR / "habitadata_df.db"

# Mapeamento: tabela → arquivo CSV  (ordem respeita dependências FK)
LOAD_ORDER = [
    ("regioes",                 "regioes.csv"),
    ("imoveis",                 "imoveis.csv"),
    ("historico_valor_imovel",  "historico_valor_imovel.csv"),
    ("custo_m2_regional",       "custo_m2_regional.csv"),
    ("infraestrutura_regional", "infraestrutura_regional.csv"),
]

# Conversores coluna → tipo Python para cada tabela
TYPE_MAP: dict[str, dict[str, type]] = {
    "regioes": {
        "id_regiao": int,
        "indice_desenvolvimento": float,
    },
    "imoveis": {
        "id_imovel": int,
        "id_regiao": int,
        "metragem": float,
        "quartos": int,
        "banheiros": int,
        "ano_entrega": int,
        "valor_inicial": float,
    },
    "historico_valor_imovel": {
        "id_imovel": int,
        "ano": int,
        "valor_estimado": float,
    },
    "custo_m2_regional": {
        "id_regiao": int,
        "ano": int,
        "custo_m2": float,
    },
    "infraestrutura_regional": {
        "id_regiao": int,
        "ano": int,
        "distancia_metro_km": float,
        "escolas_1km": int,
        "hospitais_3km": int,
        "comercio_1km": int,
        "indice_criminalidade": float,
    },
}


# ---------------------------------------------------------------------------
# Funções auxiliares
# ---------------------------------------------------------------------------

def create_database(conn: sqlite3.Connection) -> None:
    """Executa o schema.sql e cria tabelas + índices."""
    log.info("Criando schema a partir de '%s' …", SCHEMA_FILE)
    schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")
    conn.executescript(schema_sql)
    conn.commit()
    log.info("Schema criado com sucesso.")


def cast_row(table: str, row: dict[str, str]) -> dict:
    """Converte os valores de string CSV para os tipos Python corretos."""
    converters = TYPE_MAP.get(table, {})
    result = {}
    for col, raw in row.items():
        if raw == "" or raw is None:
            result[col] = None
        elif col in converters:
            result[col] = converters[col](raw)
        else:
            result[col] = raw          # mantém string (ex.: nome_regiao)
    return result


def load_csv(conn: sqlite3.Connection, table: str, csv_file: Path) -> int:
    """
    Lê um CSV e insere todas as linhas na tabela usando INSERT OR IGNORE
    (idempotente: reexecutar o script não duplica dados).

    Retorna o número de linhas inseridas.
    """
    if not csv_file.exists():
        log.warning("Arquivo não encontrado: %s — tabela '%s' não carregada.", csv_file, table)
        return 0

    log.info("Carregando '%s' → tabela '%s' …", csv_file.name, table)
    rows_inserted = 0

    with csv_file.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = [cast_row(table, r) for r in reader if any(v.strip() for v in r.values())]

    if not rows:
        log.warning("Nenhuma linha encontrada em '%s'.", csv_file.name)
        return 0

    columns    = list(rows[0].keys())
    placeholders = ", ".join(["?"] * len(columns))
    col_names    = ", ".join(columns)
    sql          = f"INSERT OR IGNORE INTO {table} ({col_names}) VALUES ({placeholders})"

    with conn:
        for row in rows:
            conn.execute(sql, list(row.values()))
            rows_inserted += 1

    log.info("  ✔  %d linhas inseridas em '%s'.", rows_inserted, table)
    return rows_inserted


def print_summary(conn: sqlite3.Connection) -> None:
    """Exibe o total de registros em cada tabela após a carga."""
    print("\n" + "=" * 50)
    print("  RESUMO DO BANCO HABITADATA DF")
    print("=" * 50)
    for table, _ in LOAD_ORDER:
        count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print(f"  {table:<30}: {count:>6} registros")
    print("=" * 50)
    print(f"  Banco salvo em: {DB_FILE}\n")


# ---------------------------------------------------------------------------
# Ponto de entrada
# ---------------------------------------------------------------------------

def main() -> None:
    log.info("=== HabitaData DF — Setup do Banco SQLite ===")

    # Remove banco anterior (opcional — comente se quiser manter)
    if DB_FILE.exists():
        log.info("Banco existente encontrado. Removendo para recriação limpa …")
        DB_FILE.unlink()

    conn = sqlite3.connect(DB_FILE)
    # Desempenho: WAL mode + cache maior para carga em batch
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA cache_size  = -8000;")   # ~8 MB de cache
    conn.execute("PRAGMA synchronous = NORMAL;")

    try:
        create_database(conn)

        total = 0
        for table, csv_name in LOAD_ORDER:
            csv_path = DATASET_DIR / csv_name
            total += load_csv(conn, table, csv_path)

        log.info("Carga concluída. Total de linhas inseridas: %d", total)
        print_summary(conn)

    except Exception as exc:
        log.error("Erro durante a configuração: %s", exc, exc_info=True)
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
