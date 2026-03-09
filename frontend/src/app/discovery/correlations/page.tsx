'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/context/AnalyticsContext';
import { analysisAPI } from '@/services/api';
import { Loader2, Activity, BarChart3, Info, Maximize2, Layers, Calendar } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-900 animate-pulse rounded-[2.5rem]" />
});

export default function CorrelationDiscovery() {
    const { state, setAnoSelecionado } = useAnalytics();
    const [matrix, setMatrix] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const labelsMap: Record<string, string> = {
        'metragem': 'Metragem',
        'quartos': 'Quartos',
        'banheiros': 'Banheiros',
        'v_ini': 'Preço Inicial',
        'v_fim': 'Preço Final',
        'cagr_pct': 'Valorização %',
        'valor_medio_periodo': 'Preço Médio',
        'distancia_metro_km': 'Dist. Metrô',
        'escolas_1km': 'Escolas (1km)',
        'indice_criminalidade': 'Criminalidade'
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await analysisAPI.getCorrelationMatrix(state.anoSelecionado);
                // Translate labels
                const translatedLabels = res.x.map((l: string) => labelsMap[l] || l);
                setMatrix({ ...res, x: translatedLabels, y: translatedLabels });
            } catch (err) {
                console.error("Erro ao carregar matriz", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [state.anoSelecionado]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
                <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest">Calculando Interdependências...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in slide-in-from-bottom duration-700">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="text-emerald-500" /> Matriz de Correlação
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Análise de dependência estatística entre variáveis imobiliárias e indicadores urbanos.
                    </p>
                </div>

                {/* Seletor de Ano Único Premium */}
                <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <Calendar size={16} className="text-emerald-500" />
                        <label className="text-[10px] uppercase font-bold text-slate-500">Ano em Questão:</label>
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
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 bg-slate-950 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group min-h-[650px]">
                    <div className="absolute top-8 right-8 flex items-center gap-2 text-[10px] font-mono font-bold text-slate-700 uppercase">
                        <Maximize2 size={12} /> Heatmap Matrix v2
                    </div>
                    {matrix && (
                        <Plot
                            data={[{
                                z: matrix.z,
                                x: matrix.x,
                                y: matrix.y,
                                type: 'heatmap',
                                colorscale: [
                                    [0, '#ef4444'],   // -1 (Forte Correlação Negativa)
                                    [0.4, '#1e293b'], // Próximo a zero
                                    [0.6, '#1e293b'], // Próximo a zero
                                    [1, '#10b981']    // +1 (Forte Correlação Positiva)
                                ],
                                zmin: -1,
                                zmax: 1,
                                hoverongaps: false,
                                hovertemplate: '<b>%{y}</b> vs <b>%{x}</b><br>Correlação: %{z:.2f}<extra></extra>',
                                colorbar: {
                                    thickness: 15,
                                    len: 0.8,
                                    title: { text: 'Grau de Relação', font: { size: 10, color: '#64748b' } },
                                    tickfont: { size: 10, color: '#64748b' }
                                }
                            }] as any}
                            layout={{
                                template: { layout: { template: 'plotly_dark' } } as any,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                margin: { t: 40, b: 100, l: 120, r: 40 },
                                xaxis: {
                                    tickangle: 35,
                                    tickfont: { size: 10, color: '#94a3b8' },
                                    gridcolor: '#1e293b'
                                },
                                yaxis: {
                                    autorange: 'reversed',
                                    tickfont: { size: 10, color: '#94a3b8' },
                                    gridcolor: '#1e293b'
                                },
                                autosize: true,
                            } as any}
                            config={{ responsive: true, displayModeBar: false }}
                            className="w-full h-[600px]"
                        />
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-lg space-y-8">
                        <div>
                            <h3 className="text-[11px] font-bold text-emerald-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                                <Info size={14} /> Guia do Analista
                            </h3>

                            <div className="space-y-6">
                                <LegendItem
                                    color="bg-emerald-500"
                                    title="Positiva (+1.0)"
                                    desc="As variáveis crescem juntas. Indicativo de relação forte e direta."
                                />
                                <LegendItem
                                    color="bg-red-500"
                                    title="Negativa (-1.0)"
                                    desc="Relação inversa: quando uma métrica sobe, a outra tende a cair."
                                />
                                <LegendItem
                                    color="bg-slate-700"
                                    title="Nula (0.0)"
                                    desc="Independência total. Não há padrão linear de comportamento."
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800">
                            <div className="flex items-start gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                <Layers className="text-emerald-500 mt-1" size={24} />
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-emerald-500 font-mono">Dica Técnica</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                        "A matriz agora analisa um snapshot do ano selecionado com base nas tendências dos últimos 5 anos."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LegendItem({ color, title, desc }: any) {
    return (
        <div className="flex gap-4 group">
            <div className={`w-1 ${color} h-12 rounded-full transition-all group-hover:w-1.5`} />
            <div className="space-y-1">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">{title}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
