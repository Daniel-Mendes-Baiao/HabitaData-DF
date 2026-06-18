import axios from 'axios';
import type { AIPropertyPayload, PageContext, GlobalChatMessage } from '@/types';

// ---------------------------------------------------------------------------
// Configuração base
// ---------------------------------------------------------------------------

/** URL base da API FastAPI. Altere aqui se o backend rodar em outra porta. */
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Mercado — /api/market
// ---------------------------------------------------------------------------

export const marketAPI = {
    /** Evolução histórica do valor médio de mercado (geral ou por região). */
    getEvolution: (regiao_id?: number) =>
        api.get('/market/evolution', { params: { regiao_id } }).then(r => r.data),

    /** Variação percentual anual (YoY) do mercado (geral ou por região). */
    getGrowth: (regiao_id?: number) =>
        api.get('/market/growth', { params: { regiao_id } }).then(r => r.data),

    /** Distribuição do CAGR de todos os imóveis no período. */
    getPriceDistribution: (ano_inicio = 2010, ano_fim = 2025) =>
        api.get('/market/price_distribution', { params: { ano_inicio, ano_fim } }).then(r => r.data),
};

// ---------------------------------------------------------------------------
// Regiões — /api/regions
// ---------------------------------------------------------------------------

export const regionsAPI = {
    /** Ranking de regiões ordenado por CAGR médio. */
    getRanking: (ano_inicio = 2010, ano_fim = 2025) =>
        api.get('/regions/ranking', { params: { ano_inicio, ano_fim } }).then(r => r.data),

    /** Preço médio, mediana, mínimo e máximo por região no ano informado. */
    getAveragePrice: (ano = 2025) =>
        api.get('/regions/average_price', { params: { ano } }).then(r => r.data),

    /** CAGR médio e desvio-padrão por região no período. */
    getAppreciation: (ano_inicio = 2010, ano_fim = 2025) =>
        api.get('/regions/appreciation', { params: { ano_inicio, ano_fim } }).then(r => r.data),
};

// ---------------------------------------------------------------------------
// Ativos (Imóveis) — /api/properties
// ---------------------------------------------------------------------------

export const propertiesAPI = {
    /** Lista todos os imóveis com metadados básicos. */
    list: () =>
        api.get('/properties/').then(r => r.data),

    /** Detalhamento completo de um imóvel: histórico, CAGR, valorização. */
    getDetails: (imovel_id: number) =>
        api.get(`/properties/${imovel_id}`).then(r => r.data),

    /** Top N imóveis mais valorizados. */
    getTopAppreciated: (limit = 10, ano_inicio = 2010, ano_fim = 2025) =>
        api.get('/properties/top/appreciated', { params: { limit, ano_inicio, ano_fim } }).then(r => r.data),

    /** Top N imóveis menos valorizados. */
    getTopDepreciated: (limit = 10, ano_inicio = 2010, ano_fim = 2025) =>
        api.get('/properties/top/depreciated', { params: { limit, ano_inicio, ano_fim } }).then(r => r.data),
};

// ---------------------------------------------------------------------------
// Geoespacial — /api/geospatial
// ---------------------------------------------------------------------------

export const geospatialAPI = {
    /** Grid virtual 3D para Deck.gl com interpolação IDW por região. */
    getRegions3D: (ano = 2021) =>
        api.get('/geospatial/map/regions3d', { params: { ano } }).then(r => r.data),

    /** Score de infraestrutura urbana por região vs valorização. */
    getInfrastructureImpact: (ano_inicio = 2010, ano_fim = 2025) =>
        api.get('/geospatial/urban_factors/infrastructure', { params: { ano_inicio, ano_fim } }).then(r => r.data),
};

// ---------------------------------------------------------------------------
// Análise Avançada — /api/analysis
// ---------------------------------------------------------------------------

export const analysisAPI = {
    /** Dataset multivariado para o ano selecionado (5 anos de CAGR). */
    getMultivariate: (ano = 2021) =>
        api.get('/analysis/multivariate', { params: { ano } }).then(r => r.data),

    /** Matriz de correlação de Pearson ({z, x, y} pronto para Plotly heatmap). */
    getCorrelationMatrix: (ano = 2021) =>
        api.get('/analysis/correlation-matrix', { params: { ano } }).then(r => r.data),

    /** Impacto de fatores urbanos (crime + infraestrutura) na valorização. */
    getFactorsImpact: (ano_inicio = 2010, ano_fim = 2025) =>
        api.get('/analysis/factors-impact', { params: { ano_inicio, ano_fim } }).then(r => r.data),

    /** Dados agregados por região para o ano selecionado. */
    getRegionalComparison: (ano = 2021) =>
        api.get('/analysis/regional-comparison', { params: { ano } }).then(r => r.data),

    /** Índices base 100 de métricas urbanas ao longo do tempo. */
    getGrowthIndices: (regioes?: string) =>
        api.get('/analysis/growth-indices', { params: { regioes } }).then(r => r.data),

    /**
     * Resumo executivo para o Dashboard Central.
     * Retorna: cagr_medio_pct, custo_m2_medio, indice_seguranca, total_imoveis.
     */
    getSummary: (): Promise<{
        cagr_medio_pct: number | null;
        custo_m2_medio: number | null;
        indice_seguranca: number | null;
        total_imoveis: number;
    }> =>
        api.get('/analysis/summary').then(r => r.data),
};

// ---------------------------------------------------------------------------
// IA — /api/ai
// ---------------------------------------------------------------------------

export const aiAPI = {
    /** Análise profunda de um imóvel específico com o agente de IA. */
    analyze: (property_data: AIPropertyPayload, user_question?: string) =>
        api.post('/ai/analyze', { property_data, user_question }).then(r => r.data),
};

export const chatAPI = {
    /**
     * Envia uma mensagem ao chat global com contexto da tela e histórico.
     * Retorna `{ reply: string }`.
     */
    sendMessage: (
        message: string,
        pageContext: PageContext,
        history: Pick<GlobalChatMessage, 'role' | 'text'>[],
    ): Promise<{ reply: string }> =>
        api.post('/ai/chat', {
            message,
            page_context: pageContext,
            history,
        }).then(r => r.data),
};

export default api;
