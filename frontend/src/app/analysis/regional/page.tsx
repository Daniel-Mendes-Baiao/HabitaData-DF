'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/context/AnalyticsContext';
import { analysisAPI } from '@/services/api';
import { 
    Loader2, 
    TrendingUp, 
    Calendar, 
    Activity, 
    Target, 
    ArrowUpRight, 
    ArrowDownRight, 
    Info, 
    Building2,
    Shield,
    Train,
    School,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    ArrowRight
} from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-900/50 animate-pulse rounded-3xl" />
});

export default function RegionalAnalysis() {
    const { state, setAnoSelecionado } = useAnalytics();
    const [loading, setLoading] = useState(true);
    const [benchmarkingData, setBenchmarkingData] = useState<any[]>([]);
    const [temporalData, setTemporalData] = useState<any[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [compareRegions, setCompareRegions] = useState<string[]>([]);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [benchRes, tempRes] = await Promise.all([
                    analysisAPI.getRegionalComparison(state.anoSelecionado),
                    analysisAPI.getGrowthIndices()
                ]);

                const bData = benchRes.data || [];
                const tData = tempRes.data || [];

                setBenchmarkingData(bData);
                setTemporalData(tData);

                if (bData.length > 0 && !selectedRegion) {
                    setSelectedRegion(bData[0].nome_regiao);
                    setCompareRegions([bData[1]?.nome_regiao, bData[2]?.nome_regiao].filter(Boolean));
                }
            } catch (err) {
                console.error("Erro ao carregar análise consolidada", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [state.anoSelecionado]);

    const primaryData = useMemo(() => benchmarkingData.find(d => d.nome_regiao === selectedRegion), [benchmarkingData, selectedRegion]);

    const chartData = useMemo(() => {
        const allSelected = [selectedRegion, ...compareRegions];
        return allSelected.map(reg => {
            const regTemp = temporalData.filter(d => d.nome_regiao === reg);
            return {
                x: regTemp.map(d => d.ano),
                y: regTemp.map(d => d.preco_medio_raw),
                type: 'scatter',
                mode: 'lines',
                name: reg,
                line: { width: reg === selectedRegion ? 4 : 2, shape: 'spline', color: reg === selectedRegion ? '#10b981' : undefined },
                fill: reg === selectedRegion ? 'tozeroy' : 'none',
                fillcolor: reg === selectedRegion ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
            };
        });
    }, [temporalData, selectedRegion, compareRegions]);

    const insights = useMemo(() => {
        if (!primaryData || !temporalData.length) return [];
        const regTemp = temporalData.filter(d => d.nome_regiao === selectedRegion);
        const lastYear = regTemp[regTemp.length - 1];
        const firstYear = regTemp[0];
        
        const totalGrowth = lastYear && firstYear ? ((lastYear.preco_medio_raw / firstYear.preco_medio_raw) - 1) * 100 : 0;
        
        const results = [];
        
        if (totalGrowth > 50) {
            results.push({
                type: 'positive',
                title: 'Crescimento Histórico Robusto',
                desc: `A região ${selectedRegion} apresentou uma valorização bruta de ${totalGrowth.toFixed(1)}% desde ${firstYear?.ano || 2010}.`,
                icon: <TrendingUp className="text-emerald-400" size={16} />
            });
        }

        if (primaryData.distancia_metro_km < 2) {
            results.push({
                type: 'positive',
                title: 'Excelente Conectividade Urbana',
                desc: `A proximidade ao metrô (${primaryData.distancia_metro_km.toFixed(1)}km) é um catalisador chave para a liquidez nesta área.`,
                icon: <Train className="text-blue-400" size={16} />
            });
        } else {
            results.push({
                type: 'neutral',
                title: 'Dependência de Modal Rodoviário',
                desc: `Com ${primaryData.distancia_metro_km.toFixed(1)}km até o metrô, o valor é mais influenciado por vias de acesso e infraestrutura local.`,
                icon: <AlertCircle className="text-amber-400" size={16} />
            });
        }

        if (primaryData.cagr_pct > 8) {
            results.push({
                type: 'positive',
                title: 'Performance Acima do Mercado',
                desc: `O CAGR de ${primaryData.cagr_pct.toFixed(2)}% indica que esta região está em fase de maturação acelerada ou forte demanda.`,
                icon: <ArrowUpRight className="text-emerald-400" size={16} />
            });
        }

        return results;
    }, [primaryData, temporalData, selectedRegion]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <Loader2 className="animate-spin text-emerald-500" size={64} />
                <div className="text-center">
                    <p className="text-white font-bold text-xl">Consolidando Inteligência Regional</p>
                    <p className="text-slate-500 text-sm font-mono mt-1 uppercase tracking-tighter">Sincronizando séries históricas e indicadores urbanos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-1000">
            {/* Header com Controles */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-md">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                        <Target size={12} /> Deep Analytics Engine
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Análise de Imóveis por Região</h1>
                    <p className="text-slate-400 text-sm">Visão 360º de performance, infraestrutura e evolução histórica.</p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Região Principal</label>
                        <select 
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="w-56 bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                        >
                            {benchmarkingData.map(d => <option key={d.nome_regiao} value={d.nome_regiao}>{d.nome_regiao}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Ano de Referência</label>
                        <select 
                            value={state.anoSelecionado}
                            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                            className="w-32 bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                        >
                            {Array.from({ length: 16 }, (_, i) => 2010 + i).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            {/* Grid de Métricas Chave */}
            {primaryData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <QuickMetric 
                        label="Preço Médio / m²" 
                        value={`R$ ${primaryData.valor_m2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                        sub={`Ano ${state.anoSelecionado}`}
                        icon={<Building2 size={18} className="text-emerald-400" />}
                    />
                    <QuickMetric 
                        label="Valorização (CAGR)" 
                        value={`${primaryData.cagr_pct.toFixed(2)}%`}
                        sub="Histórico anualizado"
                        icon={<TrendingUp size={18} className="text-blue-400" />}
                        trend={primaryData.cagr_pct > 0 ? 'up' : 'down'}
                    />
                    <QuickMetric 
                        label="Segurança Local" 
                        value={`${(primaryData.indice_criminalidade).toFixed(0)}%`}
                        sub="Indice de Criminalidade"
                        icon={<Shield size={18} className="text-purple-400" />}
                    />
                    <QuickMetric 
                        label="Infraestrutura" 
                        value={`${primaryData.escolas_1km.toFixed(0)} un`}
                        sub="Escolas em 1km"
                        icon={<School size={18} className="text-amber-400" />}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Gráfico Temporal */}
                <div className="xl:col-span-8 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Calendar className="text-emerald-400" size={20} /> Evolução Histórica de Preços
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            REGIAO SELECIONADA
                        </div>
                    </div>
                    
                    <Plot
                        data={chartData as any}
                        layout={{
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            xaxis: { gridcolor: '#1e293b', zeroline: false, tickfont: { color: '#64748b' } },
                            yaxis: { gridcolor: '#1e293b', zeroline: false, tickfont: { color: '#64748b' } },
                            margin: { t: 20, b: 40, l: 60, r: 20 },
                            hovermode: 'x unified',
                            showlegend: true,
                            legend: { orientation: 'h', y: 1.1, font: { color: '#94a3b8', size: 11 } },
                            template: { layout: { template: 'plotly_dark' } } as any,
                            autosize: true,
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '400px' }}
                    />
                </div>

                {/* Painel de Insights e Comparação */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <BarChart3 className="text-emerald-400" size={18} /> Pontos Importantes
                        </h3>
                        
                        <div className="space-y-4">
                            {insights.map((insight, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/50 space-y-2 group hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-2">
                                        {insight.icon}
                                        <h4 className="text-sm font-bold text-slate-200">{insight.title}</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">{insight.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <p className="text-[10px] uppercase font-bold text-slate-600 mb-4 tracking-widest">Benchmarking: Comparar com</p>
                            <div className="grid grid-cols-2 gap-2">
                                {benchmarkingData.filter(d => d.nome_regiao !== selectedRegion).slice(0, 6).map(reg => (
                                    <button 
                                        key={reg.nome_regiao}
                                        onClick={() => {
                                            if (compareRegions.includes(reg.nome_regiao)) {
                                                setCompareRegions(compareRegions.filter(r => r !== reg.nome_regiao));
                                            } else {
                                                setCompareRegions([...compareRegions, reg.nome_regiao]);
                                            }
                                        }}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                                            compareRegions.includes(reg.nome_regiao)
                                                ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                        }`}
                                    >
                                        {reg.nome_regiao}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600/20 to-blue-600/20 border border-emerald-500/20 p-6 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-emerald-500/10 transition-all">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Dica Estratégica</p>
                            <p className="text-sm text-slate-300">Compare regiões com perfis de infraestrutura similares.</p>
                        </div>
                        <ArrowRight className="text-emerald-400 group-hover:translate-x-1 transition-transform" size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickMetric({ label, value, sub, icon, trend }: any) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] space-y-4 hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start">
                <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trend === 'up' ? 'ALTA' : 'BAIXA'}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</p>
                <p className="text-2xl font-black text-white tracking-tight">{value}</p>
                <p className="text-[10px] text-slate-600 font-medium">{sub}</p>
            </div>
        </div>
    );
}
