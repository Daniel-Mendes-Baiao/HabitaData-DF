-- =============================================================
--  HabitaData DF — Schema SQLite
--  Projeto: Análise de valorização de habitação popular em Brasília
--  Gerado em: 2026-03-09
-- =============================================================

PRAGMA foreign_keys = ON;   -- Habilita integridade referencial no SQLite

-- -------------------------------------------------------------
-- 1. REGIOES
--    Tabela-mestre de regiões administrativas do DF.
--    Nível mais alto da hierarquia; todas as outras tabelas
--    geo-temporais dependem dela via id_regiao.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS regioes (
    id_regiao            INTEGER NOT NULL,
    nome_regiao          TEXT    NOT NULL,
    indice_desenvolvimento REAL  NOT NULL
        CHECK (indice_desenvolvimento BETWEEN 0.0 AND 1.0),

    PRIMARY KEY (id_regiao)
);

-- -------------------------------------------------------------
-- 2. IMOVEIS
--    Cadastro de cada unidade habitacional.
--    Depende de regioes(id_regiao).
--    valor_inicial é o preço no ano de entrega (referência base).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS imoveis (
    id_imovel    INTEGER NOT NULL,
    id_regiao    INTEGER NOT NULL,
    metragem     REAL    NOT NULL CHECK (metragem > 0),
    quartos      INTEGER NOT NULL CHECK (quartos > 0),
    banheiros    INTEGER NOT NULL CHECK (banheiros > 0),
    ano_entrega  INTEGER NOT NULL CHECK (ano_entrega BETWEEN 1980 AND 2100),
    valor_inicial REAL   NOT NULL CHECK (valor_inicial > 0),

    PRIMARY KEY (id_imovel),
    FOREIGN KEY (id_regiao) REFERENCES regioes(id_regiao)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- -------------------------------------------------------------
-- 3. HISTORICO_VALOR_IMOVEL
--    Série temporal de valores estimados por imóvel.
--    Granularidade: 1 linha por (imóvel × ano).
--    PK composta garante unicidade sem coluna surrogate extra.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico_valor_imovel (
    id_imovel      INTEGER NOT NULL,
    ano            INTEGER NOT NULL CHECK (ano BETWEEN 1980 AND 2100),
    valor_estimado REAL    NOT NULL CHECK (valor_estimado > 0),

    PRIMARY KEY (id_imovel, ano),
    FOREIGN KEY (id_imovel) REFERENCES imoveis(id_imovel)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 4. CUSTO_M2_REGIONAL
--    Custo médio do m² por região e ano.
--    Granularidade: 1 linha por (região × ano).
--    Usado para normalizar valor_estimado e comparar regiões.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custo_m2_regional (
    id_regiao INTEGER NOT NULL,
    ano       INTEGER NOT NULL CHECK (ano BETWEEN 1980 AND 2100),
    custo_m2  REAL    NOT NULL CHECK (custo_m2 > 0),

    PRIMARY KEY (id_regiao, ano),
    FOREIGN KEY (id_regiao) REFERENCES regioes(id_regiao)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- -------------------------------------------------------------
-- 5. INFRAESTRUTURA_REGIONAL
--    Indicadores de infraestrutura urbana por região e ano.
--    Granularidade: 1 linha por (região × ano).
--    Permite correlacionar infraestrutura com valorização.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS infraestrutura_regional (
    id_regiao             INTEGER NOT NULL,
    ano                   INTEGER NOT NULL CHECK (ano BETWEEN 1980 AND 2100),
    distancia_metro_km    REAL    NOT NULL CHECK (distancia_metro_km >= 0),
    escolas_1km           INTEGER NOT NULL CHECK (escolas_1km >= 0),
    hospitais_3km         INTEGER NOT NULL CHECK (hospitais_3km >= 0),
    comercio_1km          INTEGER NOT NULL CHECK (comercio_1km >= 0),
    indice_criminalidade  REAL    NOT NULL
        CHECK (indice_criminalidade BETWEEN 0.0 AND 1.0),

    PRIMARY KEY (id_regiao, ano),
    FOREIGN KEY (id_regiao) REFERENCES regioes(id_regiao)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =============================================================
--  ÍNDICES PARA CONSULTAS ANALÍTICAS
-- =============================================================

-- Busca de todos os imóveis de uma região (join mais comum)
CREATE INDEX IF NOT EXISTS idx_imoveis_regiao
    ON imoveis(id_regiao);

-- Evolução temporal de um imóvel específico
CREATE INDEX IF NOT EXISTS idx_historico_imovel_ano
    ON historico_valor_imovel(id_imovel, ano);

-- Filtrar/ordenar histórico por ano (ex.: todos os valores de 2022)
CREATE INDEX IF NOT EXISTS idx_historico_ano
    ON historico_valor_imovel(ano);

-- Consultas de valorização por região: join imoveis + historico
-- (id_regiao está em imoveis; esta combinação acelera o agrupamento)
CREATE INDEX IF NOT EXISTS idx_imoveis_regiao_metragem
    ON imoveis(id_regiao, metragem);

-- Custo do m² filtrado por ano
CREATE INDEX IF NOT EXISTS idx_custo_m2_ano
    ON custo_m2_regional(ano);

-- Infraestrutura filtrada por ano ou por região
CREATE INDEX IF NOT EXISTS idx_infra_ano
    ON infraestrutura_regional(ano);

CREATE INDEX IF NOT EXISTS idx_infra_regiao_ano
    ON infraestrutura_regional(id_regiao, ano);
