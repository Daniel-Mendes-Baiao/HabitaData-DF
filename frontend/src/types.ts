export type RegionSummary = {
  nome_regiao: string;
  n_ativos?: number;
  n_imoveis?: number;
  valor_m2?: number;
  cagr_pct?: number;
  cagr_medio_pct?: number;
  distancia_metro_km?: number;
  escolas_1km?: number;
  indice_criminalidade?: number;
  score_seguranca?: number;
};

export type TemporalRegionPoint = {
  nome_regiao: string;
  ano: number;
  preco_medio_raw?: number;
  preco_m2_raw?: number;
  preco_m2_idx?: number;
  n_imoveis?: number;
};

export type PropertyListItem = {
  id_imovel: number;
  nome_regiao: string;
  metragem: number;
  ultimo_valor?: number;
};

export type PropertyHistoryPoint = {
  ano: number;
  valor_estimado: number;
  variacao_yoy_pct?: number;
};

export type PropertyDetails = {
  metadata: {
    id_imovel: number;
    nome_regiao: string;
    metragem: number;
    quartos: number;
    banheiros: number;
    ano_entrega: number;
    valor_inicial: number;
  };
  history: PropertyHistoryPoint[];
  cagr_pct: number;
  total_appreciation_pct: number;
};

export type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
};

export type AIPropertyPayload = PropertyDetails | {
  metadata: Record<string, string | number>;
  total_appreciation_pct: number;
  cagr_pct: number;
  history: PropertyHistoryPoint[];
};
