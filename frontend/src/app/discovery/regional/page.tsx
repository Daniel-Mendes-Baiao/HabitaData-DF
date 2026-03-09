'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/context/AnalyticsContext';
import { analysisAPI } from '@/services/api';
import {
    Loader2, Activity, TrendingUp, Shield, School, Train,
    DollarSign, Ruler, ArrowRight, Maximize2, Calendar
} from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-900 animate-pulse rounded-3xl" />
});

export default function RegionalBenchmarking() {
    const { state, setAnoSelecionado } = useAnalytics();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRegioes, setSelectedRegioes] = useState<string[]>([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await analysisAPI.getRegionalComparison(state.anoSelecionado);
                const fetchedData = res.data || [];
                setData(fetchedData);
                if (selectedRegioes.length === 0 && fetchedData.length > 0) {
                    setSelectedRegioes(fetchedData.slice(0, 2).map((d: any) => d.nome_regiao));
                }
            } catch (err) {
                console.error("Erro ao carregar comparativo regional", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [state.anoSelecionado]);

    const radarData = useMemo(() => {
        if (!data.length) return [];
        return selectedRegioes.map((regName, idx) => {
            const reg = data.find(d => d.nome_regiao === regName);
            if (!reg) return null;
            return {
                type: 'scatterpolar',
                r: [
                    Math.min(100, (reg.cagr_pct + 10) * 5),
                    Math.max(0, (10 - reg.distancia_metro_km) * 10),
                    Math.min(100, reg.escolas_1km * 15),
                    Math.max(0, (1 - reg.indice_criminalidade / 100) * 100),
                    Math.min(100, reg.valor_medio_periodo / 20000)
                ],
                theta: ['Retorno (CAGR)', 'Mobilidade', 'Educação', 'Segurança', 'Valorização'],
                fill: 'toself',
                name: regName,
                line: { color: idx === 0 ? '#10b981' : idx === 1 ? '#6366f1' : '#f59e0b' }
            };
        }).filter(Boolean);
    }, [data, selectedRegioes]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
                <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest text-center px-4">Cruzando dados regionais para {state.anoSelecionado}...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Activity className="text-emerald-500" /> Benchmarking Regional
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Comparativo detalhado para o ano de {state.anoSelecionado}.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-3 px-2">
                        <Calendar size={16} className="text-emerald-500" />
                        <label className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Ano:</label>
                        <select
                            value={state.anoSelecionado}
                            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                            className="bg-transparent text-sm text-white outline-none font-bold cursor-pointer hover:text-emerald-400 transition-colors"
                        >
                            {Array.from({ length: 16 }, (_, i) => 2010 + i).map(year => (
                                <option key={year} value={year} className="bg-slate-900 text-white">{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-8 w-px bg-slate-800 mx-2" />

                    <div className="flex gap-2">
                        {data.slice(0, 5).map(reg => (
                            <button
                                key={reg.nome_regiao}
                                onClick={() => {
                                    if (selectedRegioes.includes(reg.nome_regiao)) {
                                        setSelectedRegioes(selectedRegioes.filter(r => r !== reg.nome_regiao));
                                    } else if (selectedRegioes.length < 3) {
                                        setSelectedRegioes([...selectedRegioes, reg.nome_regiao]);
                                    }
                                }}
                                className={`px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all ${selectedRegioes.includes(reg.nome_regiao)
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {reg.nome_regiao}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl overflow-hidden min-h-[550px]">
                    <Plot
                        data={radarData as any}
                        layout={{
                            polar: {
                                radialaxis: { visible: true, range: [0, 100], gridcolor: '#1e293b', tickfont: { size: 10 } },
                                angularaxis: { gridcolor: '#1e293b', linecolor: '#1e293b', tickfont: { size: 10 } },
                                bgcolor: 'rgba(0,0,0,0)'
                            },
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            showlegend: true,
                            legend: { orientation: 'h', y: -0.15 },
                            margin: { t: 40, b: 40, l: 40, r: 40 },
                            template: { layout: { template: 'plotly_dark' } } as any,
                            autosize: true
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '500px' }}
                    />
                </div>

                <div className="xl:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedRegioes.map((regName, idx) => {
                            const reg = data.find(d => d.nome_regiao === regName);
                            return reg && (
                                <div key={regName} className={`p-6 rounded-[2rem] border animate-in slide-in-from-right duration-500 delay-${idx * 100} ${idx === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : idx === 1 ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-amber-500/5 border-amber-500/20'
                                    }`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-2xl font-black text-white">{regName}</h3>
                                        <div className={`w-4 h-4 rounded-full ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                        <MetricItem icon={<DollarSign size={14} />} label="Valor Médio" value={`R$ ${(reg.valor_medio_periodo / 1000).toFixed(1)}k`} />
                                        <MetricItem icon={<TrendingUp size={14} />} label="Retorno 5y (CAGR)" value={`${reg.cagr_pct.toFixed(2)}%`} color={reg.cagr_pct > 0 ? 'text-emerald-400' : 'text-red-400'} />
                                        <MetricItem icon={<Maximize2 size={14} />} label="Preço / m²" value={`R$ ${reg.valor_m2.toFixed(0)}`} />
                                        <MetricItem icon={<Ruler size={14} />} label="Metragem Média" value={`${reg.metragem.toFixed(0)} m²`} />
                                        <MetricItem icon={<Shield size={14} />} label="Segurança" value={`${(reg.indice_criminalidade).toFixed(0)}/100`} />
                                        <MetricItem icon={<Train size={14} />} label="Dist. Metrô" value={`${reg.distancia_metro_km.toFixed(1)} km`} />
                                        <MetricItem icon={<School size={14} />} label="Escolas (1km)" value={`${reg.escolas_1km.toFixed(1)} un`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg">
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" /> Resumo Comparativo ({state.anoSelecionado})
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            {selectedRegioes.length > 1 ? (
                                `Snapshot de ${state.anoSelecionado}: Comparando ${selectedRegioes.join(' vs ')}. ${selectedRegioes[0]} apresenta ${data.find(d => d.nome_regiao === selectedRegioes[0])?.valor_m2 >
                                    data.find(d => d.nome_regiao === selectedRegioes[1])?.valor_m2 ? 'maior valor por m²' : 'melhor custo-benefício'
                                }.`
                            ) : (
                                "Selecione múltiplas regiões acima para uma análise comparativa detalhada."
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricItem({ icon, label, value, color = "text-white" }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
                {icon}
                <p className="text-[10px] uppercase font-bold tracking-tight">{label}</p>
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
        </div>
    );
}
