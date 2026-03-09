'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/context/AnalyticsContext';
import { analysisAPI } from '@/services/api';
import { Loader2, TrendingUp, Calendar, Zap, Activity, Filter, BarChart3, List } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-900 animate-pulse rounded-3xl" />
});

export default function TemporalGrowth() {
    const { state, setAnoSelecionado } = useAnalytics();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState<string>('preco_medio');
    const [viewType, setViewType] = useState<'idx' | 'raw'>('idx');
    const [selectedRegioes, setSelectedRegioes] = useState<string[]>([]);

    const METRICS = [
        { id: 'preco_medio', label: 'Preço Imobiliário', icon: <TrendingUp size={14} /> },
        { id: 'crime', label: 'Criminalidade', icon: <Zap size={14} /> },
        { id: 'dist_metro', label: 'Acesso ao Metrô', icon: <Calendar size={14} /> },
        { id: 'escolas', label: 'Infra Educação', icon: <Activity size={14} /> },
    ];

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await analysisAPI.getGrowthIndices();
                const fetchedData = res.data || [];
                setData(fetchedData);

                if (fetchedData.length > 0) {
                    const regions = Array.from(new Set(fetchedData.map((d: any) => d.nome_regiao))) as string[];
                    setSelectedRegioes(regions.slice(0, 3));
                }
            } catch (err) {
                console.error("Erro ao carregar índices de crescimento", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const regions = useMemo(() => Array.from(new Set(data.map(d => d.nome_regiao))), [data]);

    const chartData = useMemo(() => {
        if (!data.length) return [];

        const metricKey = `${metric}_${viewType}`;
        const filteredData = selectedRegioes.length > 0
            ? data.filter(d => selectedRegioes.includes(d.nome_regiao))
            : data;

        const visibleRegions = Array.from(new Set(filteredData.map(d => d.nome_regiao)));

        return visibleRegions.map((reg) => {
            const regData = filteredData.filter(d => d.nome_regiao === reg);
            return {
                x: regData.map(d => d.ano),
                y: regData.map(d => d[metricKey]),
                type: 'scatter',
                mode: 'lines+markers',
                name: reg,
                line: { width: 3, shape: 'spline' },
                marker: { size: 6 }
            };
        });
    }, [data, metric, viewType, selectedRegioes]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest">Analisando Séries Temporais...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in slide-in-from-bottom duration-700">
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Zap className="text-indigo-400" /> Índices de Crescimento
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Evolução histórica. O seletor global de ano ({state.anoSelecionado}) foca a análise.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-4 bg-slate-900/40 backdrop-blur-md p-2 rounded-[2rem] border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-3 px-4">
                        <Calendar size={16} className="text-indigo-400" />
                        <label className="text-[10px] uppercase font-bold text-slate-500">Ano em Questão:</label>
                        <select
                            value={state.anoSelecionado}
                            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                            className="bg-transparent text-sm text-white outline-none font-bold cursor-pointer hover:text-indigo-400 transition-colors"
                        >
                            {Array.from({ length: 16 }, (_, i) => 2010 + i).map(year => (
                                <option key={year} value={year} className="bg-slate-900 text-white">{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-8 w-px bg-slate-800 hidden lg:block" />

                    <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button
                            onClick={() => setViewType('idx')}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${viewType === 'idx' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Índice (Base 100)
                        </button>
                        <button
                            onClick={() => setViewType('raw')}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${viewType === 'raw' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Valores Reais
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-800 hidden lg:block" />

                    <div className="flex gap-1 pr-2">
                        {METRICS.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMetric(m.id)}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${metric === m.id
                                    ? 'bg-slate-800 text-white border border-slate-700'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative min-h-[600px] group transition-all hover:bg-slate-900/60">
                    <div className="absolute top-8 right-8 flex items-center gap-2 text-[10px] font-mono font-bold text-slate-600 uppercase">
                        <BarChart3 size={12} /> Temporal Series Analytica
                    </div>
                    <Plot
                        data={chartData as any}
                        layout={{
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            xaxis: { title: { text: 'Ano', font: { size: 10, color: '#64748b' } }, gridcolor: '#1e293b', zeroline: false } as any,
                            yaxis: { title: { text: viewType === 'idx' ? 'Índice (Normalizado)' : 'Valor Bruto', font: { size: 10, color: '#64748b' } }, gridcolor: '#1e293b', zeroline: false } as any,
                            margin: { t: 60, b: 60, l: 60, r: 40 },
                            hovermode: 'x unified',
                            showlegend: true,
                            legend: { x: 0, y: 1.1, orientation: 'h', font: { size: 10, color: '#94a3b8' } },
                            template: { layout: { template: 'plotly_dark' } } as any,
                            autosize: true,
                            shapes: [
                                {
                                    type: 'line',
                                    x0: state.anoSelecionado,
                                    x1: state.anoSelecionado,
                                    y0: 0,
                                    y1: 1,
                                    yref: 'paper',
                                    line: { color: 'rgba(129, 140, 248, 0.4)', width: 2, dash: 'dot' }
                                }
                            ]
                        } as any}
                        config={{ responsive: true, displayModeBar: false }}
                        className="w-full h-[550px]"
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-[2rem] shadow-lg">
                        <h4 className="text-xs font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-indigo-400">
                            <Filter size={14} /> Seleção Regional
                        </h4>
                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {regions.map(reg => (
                                <button
                                    key={reg}
                                    onClick={() => {
                                        if (selectedRegioes.includes(reg)) {
                                            setSelectedRegioes(selectedRegioes.filter(r => r !== reg));
                                        } else {
                                            setSelectedRegioes([...selectedRegioes, reg]);
                                        }
                                    }}
                                    className={`flex justify-between items-center px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all ${selectedRegioes.includes(reg)
                                        ? 'bg-indigo-500/10 text-white border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                                        : 'bg-slate-800/20 text-slate-500 hover:text-slate-300 border border-transparent'
                                        }`}
                                >
                                    {reg}
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedRegioes.includes(reg) ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'bg-slate-700'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900/40 border border-slate-800/50 rounded-[2rem] space-y-6">
                        <HighlightCard icon={<TrendingUp size={14} />} title="Análise Delta" desc="Observe a inclinação das retas para identificar qual região acelera mais rápido." color="text-indigo-400" />
                        <HighlightCard icon={<List size={14} />} title="Ano Ativo" desc={`A linha tracejada indica o ano de ${state.anoSelecionado} selecionado globalmente.`} color="text-emerald-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function HighlightCard({ title, desc, color, icon }: any) {
    return (
        <div className="space-y-2">
            <h5 className={`${color} font-bold text-[10px] font-mono uppercase tracking-widest flex items-center gap-2`}>
                {icon} {title}
            </h5>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}
