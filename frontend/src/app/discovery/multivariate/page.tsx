'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data, Layout } from 'plotly.js';
import { useAnalytics } from '@/context/AnalyticsContext';
import { analysisAPI } from '@/services/api';
import { Loader2, Info, TrendingUp, AlertCircle } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-900 animate-pulse rounded-xl" />
});

type MultivariateRow = Record<string, string | number | null | undefined> & {
    nome_regiao: string;
    id_imovel: number;
};

const toNumber = (value: string | number | null | undefined, fallback = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
};

export default function MultivariateDiscovery() {
    const { state } = useAnalytics();
    const [data, setData] = useState<MultivariateRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const res = await analysisAPI.getMultivariate(state.anoSelecionado);
                setData(res.data || []);
            } catch (err) {
                console.error("Erro ao carregar dados multivariados", err);
                setError("Falha ao comunicar com o motor analítico.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [state.anoSelecionado]);

    const chartData = useMemo(() => {
        if (!data.length) return [];

        const regions = Array.from(new Set(data.map(d => d.nome_regiao)));

        return regions.map<Data>(region => {
            const regionData = data.filter(d => d.nome_regiao === region);
            return {
                type: 'scatter',
                x: regionData.map(d => toNumber(d[state.variableX])),
                y: regionData.map(d => toNumber(d[state.variableY])),
                mode: 'markers',
                name: region,
                text: regionData.map(d => `ID: ${d.id_imovel}<br>X: ${d[state.variableX]}<br>Y: ${d[state.variableY]}`),
                marker: {
                    size: regionData.map(d => Math.max(toNumber(d[state.variableSize], 1) / 100000, 6)),
                    sizeref: 0.1,
                    sizemode: 'area',
                    opacity: 0.6,
                    line: { width: 1, color: '#000' }
                }
            };
        });
    }, [data, state.variableX, state.variableY, state.variableSize]);

    const chartLayout: Partial<Layout> = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { title: { text: state.variableX.toUpperCase() }, gridcolor: '#1e293b' },
        yaxis: { title: { text: state.variableY.toUpperCase() }, gridcolor: '#1e293b' },
        margin: { t: 40, b: 60, l: 60, r: 40 },
        hovermode: 'closest',
        showlegend: true,
        legend: { x: 1, y: 1 },
        autosize: true,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
                <p className="text-slate-400 font-medium">Processando matriz multivariada...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <TrendingUp className="text-emerald-500" /> Explorador Multivariado
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Cruzamento dinâmico de variáveis: <span className="text-emerald-400 font-mono">{state.variableX}</span> vs <span className="text-emerald-400 font-mono">{state.variableY}</span>
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-slate-300">Dataset: {data.length} ativos</span>
                    </div>
                </div>
            </header>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-400">
                    <AlertCircle />
                    <p>{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Info className="text-slate-400 cursor-help" />
                        </div>

                        <Plot
                            data={chartData}
                            layout={chartLayout}
                            config={{ responsive: true, displayModeBar: false }}
                            className="w-full h-[600px]"
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl h-full shadow-lg">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" /> Insights de Correlação
                            </h3>

                            <div className="space-y-6">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Cada bolha representa um imóvel. O tamanho é proporcional ao
                                    <span className="text-emerald-400 ml-1">Preço Médio</span>.
                                </p>

                                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 font-mono">Status da Amostragem</p>
                                    <div className="flex justify-between items-end">
                                        <span className="text-2xl font-bold text-white">{data.length}</span>
                                        <span className="text-xs text-emerald-400 pb-1">ativos válidos</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                    <p className="text-[10px] uppercase font-bold text-emerald-500/60 mb-2 font-mono">Dica de Descoberta</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Tente cruzar <b>Criminalidade</b> com <b>Valorização</b> para identificar se a segurança pública é o principal driver de preço na sua região.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700">
                                        Exportar CSV da Matriz
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
