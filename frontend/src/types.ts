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

// ---------------------------------------------------------------------------
// Chatbot Global — novos tipos
// ---------------------------------------------------------------------------

/** Contexto da tela atual, enviado automaticamente a cada mensagem do chatbot. */
export type PageContext = {
  /** Rota da tela atual, ex: "/properties" */
  route: string;
  /** Título legível da tela, ex: "Detalhamento de Ativos" */
  screenTitle: string;
  /** Filtros ativos na tela atual (ex: ano selecionado, região) */
  activeFilters?: Record<string, unknown>;
  /** Dado selecionado pelo usuário na tela (ex: imóvel em foco) */
  selectedData?: unknown;
};

/** Mensagem no histórico do chat global. */
export type GlobalChatMessage = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

// ---------------------------------------------------------------------------
// Gráficos dinâmicos no chatbot — tipos de renderização (somente frontend)
// ---------------------------------------------------------------------------

/**
 * Schema JSON que a IA emite dentro de um bloco ~~~chart.
 * O frontend parseia e converte para dados do Plotly.
 */
export type ChatChartPayload = {
  /** Tipo de gráfico Plotly a renderizar */
  type: 'bar' | 'line' | 'scatter' | 'pie';
  /** Título exibido acima do gráfico */
  title: string;
  /** Rótulo do eixo X (opcional) */
  xAxisTitle?: string;
  /** Rótulo do eixo Y (opcional) */
  yAxisTitle?: string;
  /** Uma ou mais séries de dados */
  series: {
    /** Nome da série (aparece na legenda) */
    name: string;
    /** Valores do eixo X ou rótulos (pie) */
    x: (string | number)[];
    /** Valores numéricos do eixo Y */
    y: number[];
    /** Cor hex da série (ex: "#10b981") */
    color?: string;
  }[];
};

/**
 * Segmento resultante do parsing de uma mensagem AI.
 * Uma mensagem pode ter N segmentos intercalados de texto e gráfico.
 */
export type MessageSegment =
  | { type: 'text'; content: string }
  | { type: 'chart'; payload: ChatChartPayload };
