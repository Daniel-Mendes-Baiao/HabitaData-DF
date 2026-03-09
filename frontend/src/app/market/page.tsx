'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { marketAPI } from '@/services/api';
import { Activity, TrendingUp, BarChart } from 'lucide-react';

// Plotly needs to be dynamically imported with SSR disabled because it relies on window
// @ts-ignore
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function MarketIntelligenceDashboard() {
    const [evolutionData, setEvolutionData] = useState<any[]>([]);
    const [distributionData, setDistributionData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [evoRes, distRes] = await Promise.all([
                    marketAPI.getEvolution(),
                    marketAPI.getPriceDistribution(),
                ]);
                setEvolutionData(evoRes.data);
                setDistributionData(distRes.data);
            } catch (error) {
                console.error("Error fetching market data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Prepara dados para os gráficos
    const years = evolutionData.map(d => d.ano);
    const avgPrices = evolutionData.map(d => d.valor_medio);

    const cagrs = distributionData.map(d => d.cagr_pct);

    return (
        <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Activity className="text-emerald-500" /> Inteligência de Mercado
                </h1>
                <p className="text-slate-400 mt-2">
                    Análise macro da evolução e distribuição de preços no Distrito Federal.
                </p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <TrendingUp size={20} />
                        <span className="font-medium text-sm text-slate-300">CAGR Médio do Mercado</span>
                    </div>
                    <div className="text-3xl font-bold text-white">4.82%</div>
                    <p className="text-xs text-slate-500 mt-2">Crescimento anual composto (2010-2025)</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <BarChart size={20} />
                        <span className="font-medium text-sm text-slate-300">Mediana de Preço (2025)</span>
                    </div>
                    <div className="text-3xl font-bold text-white">R$ 575K</div>
                    <p className="text-xs text-slate-500 mt-2">Valor mediano estimado atual</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <Activity size={20} />
                        <span className="font-medium text-sm text-slate-300">Volume Analisado</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{distributionData.length}</div>
                    <p className="text-xs text-slate-500 mt-2">Imóveis totais na base histórica</p>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Gráfico 1: Evolução Temporal */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm w-full overflow-hidden">
                    <h2 className="text-lg font-semibold mb-4 px-2">Evolução do Valor Médio</h2>
                    <Plot
                        data={[
                            {
                                x: years,
                                y: avgPrices,
                                type: 'scatter',
                                mode: 'lines+markers',
                                marker: { color: '#10b981' }, // emarald-500
                                line: { shape: 'spline', width: 3 },
                                name: 'Valor Médio (R$)',
                                fill: 'tozeroy',
                                fillcolor: 'rgba(16, 185, 129, 0.1)'
                            },
                        ]}
                        layout={{
                            autosize: true,
                            margin: { t: 10, r: 10, l: 50, b: 40 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#94a3b8' }, // slate-400
                            xaxis: { gridcolor: '#334155' },
                            yaxis: { gridcolor: '#334155', tickprefix: 'R$ ' },
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '350px' }}
                        config={{ displayModeBar: false }}
                    />
                </div>

                {/* Gráfico 2: Histograma de Distribuição */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm w-full overflow-hidden">
                    <h2 className="text-lg font-semibold mb-4 px-2">Distribuição de Valorização (CAGR)</h2>
                    <Plot
                        data={[
                            {
                                x: cagrs,
                                type: 'histogram',
                                marker: { color: '#6366f1' }, // indigo-500
                                opacity: 0.8,
                                name: 'Imóveis',
                            },
                        ]}
                        layout={{
                            autosize: true,
                            margin: { t: 10, r: 10, l: 40, b: 40 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#94a3b8' },
                            xaxis: { gridcolor: '#334155', title: { text: 'CAGR (%)' }, ticksuffix: '%' },
                            yaxis: { gridcolor: '#334155', title: { text: 'Qtd. Imóveis' } },
                            bargap: 0.1,
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '350px' }}
                        config={{ displayModeBar: false }}
                    />
                </div>
            </div>
        </div>
    );
}
