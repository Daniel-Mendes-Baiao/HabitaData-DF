import axios from 'axios';
import type { AIPropertyPayload } from '@/types';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const marketAPI = {
    getEvolution: async (regiao_id?: number) => {
        const res = await api.get('/market/evolution', { params: { regiao_id } });
        return res.data;
    },
    getGrowth: async (regiao_id?: number) => {
        const res = await api.get('/market/growth', { params: { regiao_id } });
        return res.data;
    },
    getPriceDistribution: async (ano = 2021) => {
        const res = await api.get('/market/price_distribution', { params: { ano } });
        return res.data;
    },
};

export const regionsAPI = {
    getRanking: async (ano = 2021) => {
        const res = await api.get('/regions/ranking', { params: { ano } });
        return res.data;
    },
    getAveragePrice: async (ano = 2025) => {
        const res = await api.get('/regions/average_price', { params: { ano } });
        return res.data;
    },
    getAppreciation: async (ano = 2021) => {
        const res = await api.get('/regions/appreciation', { params: { ano } });
        return res.data;
    },
};

export const propertiesAPI = {
    list: async () => {
        const res = await api.get('/properties/');
        return res.data;
    },
    getDetails: async (imovel_id: number) => {
        const res = await api.get(`/properties/${imovel_id}`);
        return res.data;
    },
    getTopAppreciated: async (limit = 10) => {
        const res = await api.get('/properties/top/appreciated', { params: { limit } });
        return res.data;
    },
};

export const geospatialAPI = {
    getRegions3D: async (ano = 2021) => {
        const res = await api.get('/geospatial/map/regions3d', { params: { ano } });
        return res.data;
    },
    getInfrastructureImpact: async (ano = 2021) => {
        const res = await api.get('/geospatial/urban_factors/infrastructure', { params: { ano } });
        return res.data;
    },
};

export const analysisAPI = {
    getMultivariate: async (ano = 2021) => {
        const res = await api.get('/analysis/multivariate', { params: { ano } });
        return res.data;
    },
    getCorrelationMatrix: async (ano = 2021) => {
        const res = await api.get('/analysis/correlation-matrix', { params: { ano } });
        return res.data;
    },
    getFactorsImpact: async (ano = 2021) => {
        const res = await api.get('/analysis/factors-impact', { params: { ano } });
        return res.data;
    },
    getRegionalComparison: async (ano = 2021) => {
        const res = await api.get('/analysis/regional-comparison', { params: { ano } });
        return res.data;
    },
    getGrowthIndices: async (regioes?: string) => {
        const res = await api.get('/analysis/growth-indices', { params: { regioes } });
        return res.data;
    },
};

export const aiAPI = {
    analyze: async (property_data: AIPropertyPayload, user_question?: string) => {
        const res = await api.post('/ai/analyze', { property_data, user_question });
        return res.data;
    },
};



export default api;
