'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { analysisAPI } from '@/services/api';
import type { RegionSummary, TemporalRegionPoint } from '@/types';
import { 
    Loader2, 
    TrendingUp, 
    Target, 
    ArrowUpRight, 
    ArrowDownRight, 
    Building2,
    Shield,
    Train,
    School,
    AlertCircle,
    BarChart3,
    ArrowRight
} from 'lucide-react';

type Insight = {
    title: string;
    desc: string;
    icon: ReactNode;
};

type RegionCard = {
    name: string;
    isPrimary: boolean;
    series: TemporalRegionPoint[];
    currentPriceM2: number;
    growth: number;
    sample: number;
    security: number;
    metro?: number;
};

export default function RegionalAnalysis() {
    const { state, setAnoSelecionado } = useAnalytics();
    const [loading, setLoading] = useState(true);
    const [benchmarkingData, setBenchmarkingData] = useState<RegionSummary[]>([]);
    const [temporalData, setTemporalData] = useState<TemporalRegionPoint[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [compareRegions, setCompareRegions] = useState<string[]>([]);

    const handlePrimaryRegionChange = (region: string) => {
        setSelectedRegion(region);
        setCompareRegions(prev => prev.filter(item => item !== region));
    };

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [benchRes, tempRes] = await Promise.all([
                    analysisAPI.getRegionalComparison(state.anoSelecionado),
                    analysisAPI.getGrowthIndices()
                ]);

                const bData: RegionSummary[] = benchRes.data || [];
                const tData: TemporalRegionPoint[] = tempRes.data || [];

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
    }, [state.anoSelecionado, selectedRegion]);

    const primaryData = useMemo(() => benchmarkingData.find(d => d.nome_regiao === selectedRegion), [benchmarkingData, selectedRegion]);

    const normalizedCompareRegions = useMemo(
        () => Array.from(new Set(compareRegions)).filter(region => region && region !== selectedRegion),
        [compareRegions, selectedRegion]
    );

    const selectedRegionCards = useMemo(() => {
        const allSelected = [selectedRegion, ...normalizedCompareRegions].filter(Boolean);
        return allSelected.map(reg => {
            const regTemp = temporalData.filter(d => d.nome_regiao === reg && d.ano >= 2015 && d.preco_m2_raw);
            const first = regTemp[0];
            const last = regTemp[regTemp.length - 1];
            const firstPrice = first?.preco_m2_raw ?? 0;
            const lastPrice = last?.preco_m2_raw ?? 0;
            const growth = firstPrice > 0 ? ((lastPrice / firstPrice) - 1) * 100 : 0;
            const bench = benchmarkingData.find(d => d.nome_regiao === reg);

            return {
                name: reg,
                isPrimary: reg === selectedRegion,
                series: regTemp,
                currentPriceM2: last?.preco_m2_raw || 0,
                growth,
                sample: last?.n_imoveis || bench?.n_ativos || 0,
                security: bench?.score_seguranca || 0,
                metro: bench?.distancia_metro_km,
            };
        }).filter(card => card.series.length > 0);
    }, [benchmarkingData, temporalData, selectedRegion, normalizedCompareRegions]);

    const comparisonOptions = useMemo(() => {
        return benchmarkingData
            .filter(region => region.nome_regiao !== selectedRegion)
            .filter(region => !normalizedCompareRegions.includes(region.nome_regiao))
            .slice(0, 8);
    }, [benchmarkingData, selectedRegion, normalizedCompareRegions]);

    const insights = useMemo(() => {
        if (!primaryData || !temporalData.length) return [];
        const regTemp = temporalData.filter(d => d.nome_regiao === selectedRegion && d.ano >= 2015 && d.preco_m2_raw);
        const lastYear = regTemp[regTemp.length - 1];
        const firstYear = regTemp[0];

        const firstPrice = firstYear?.preco_m2_raw ?? 0;
        const lastPrice = lastYear?.preco_m2_raw ?? 0;
        const totalGrowth = firstPrice > 0 ? ((lastPrice / firstPrice) - 1) * 100 : 0;
        
        const results: Insight[] = [];
        
        if (totalGrowth > 50) {
            results.push({
                title: 'Crescimento Histórico Robusto',
                desc: `O preço médio por m² em ${selectedRegion} avançou ${totalGrowth.toFixed(1)}% desde ${firstYear?.ano || 2015}.`,
                icon: <TrendingUp className="text-emerald-400" size={16} />
            });
        }

        const metroDistance = primaryData.distancia_metro_km ?? 999;

        if (metroDistance < 2) {
            results.push({
                title: 'Excelente Conectividade Urbana',
                desc: `A proximidade ao metrô (${metroDistance.toFixed(1)}km) é um catalisador chave para a liquidez nesta área.`,
                icon: <Train className="text-blue-400" size={16} />
            });
        } else {
            results.push({
                title: 'Dependência de Modal Rodoviário',
                desc: `Com ${metroDistance.toFixed(1)}km até o metrô, o valor é mais influenciado por vias de acesso e infraestrutura local.`,
                icon: <AlertCircle className="text-amber-400" size={16} />
            });
        }

        if ((primaryData.cagr_pct ?? 0) > 8) {
            results.push({
                title: 'Performance Acima do Mercado',
                desc: `O CAGR de ${(primaryData.cagr_pct ?? 0).toFixed(2)}% indica que esta região está em fase de maturação acelerada ou forte demanda.`,
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
                            onChange={(e) => handlePrimaryRegionChange(e.target.value)}
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
                        value={`R$ ${(primaryData.valor_m2 ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                        sub={`Ano ${state.anoSelecionado}`}
                        icon={<Building2 size={18} className="text-emerald-400" />}
                    />
                    <QuickMetric 
                        label="Valorização (CAGR)" 
                        value={`${(primaryData.cagr_pct ?? 0).toFixed(2)}%`}
                        sub="Histórico anualizado"
                        icon={<TrendingUp size={18} className="text-blue-400" />}
                        trend={(primaryData.cagr_pct ?? 0) > 0 ? 'up' : 'down'}
                    />
                    <QuickMetric 
                        label="Segurança Local" 
                        value={`${(primaryData.indice_criminalidade ?? 0).toFixed(0)}%`}
                        sub="Indice de Criminalidade"
                        icon={<Shield size={18} className="text-purple-400" />}
                    />
                    <QuickMetric 
                        label="Infraestrutura" 
                        value={`${(primaryData.escolas_1km ?? 0).toFixed(0)} un`}
                        sub="Escolas em 1km"
                        icon={<School size={18} className="text-amber-400" />}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Mini gráficos por região */}
                <div className="xl:col-span-8 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-emerald-400" size={20} /> Tendência por Região
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Cada card tem escala própria para mostrar o desenho da curva sem esmagar regiões menores.
                            </p>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            2015-2024 · R$/m²
                        </div>
                    </div>

                    {normalizedCompareRegions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {normalizedCompareRegions.map(region => (
                                <button
                                    key={region}
                                    type="button"
                                    onClick={() => setCompareRegions(prev => prev.filter(item => item !== region))}
                                    className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold capitalize hover:bg-blue-500/20 transition-colors"
                                >
                                    {region} ×
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedRegionCards.map(card => (
                            <RegionSparkCard key={card.name} card={card} />
                        ))}
                    </div>
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
                            <p className="text-[10px] uppercase font-bold text-slate-600 mb-4 tracking-widest">Adicionar comparação</p>
                            <div className="grid grid-cols-2 gap-2">
                                {comparisonOptions.map(reg => (
                                    <button 
                                        key={reg.nome_regiao}
                                        type="button"
                                        onClick={() => setCompareRegions(prev => Array.from(new Set([...prev, reg.nome_regiao])).filter(item => item !== selectedRegion))}
                                        className="px-3 py-2 rounded-xl text-[10px] font-bold transition-all border bg-slate-950 border-slate-800 text-slate-500 hover:border-blue-500/50 hover:text-blue-300"
                                    >
                                        {reg.nome_regiao}
                                    </button>
                                ))}
                            </div>
                            {comparisonOptions.length === 0 && (
                                <p className="text-xs text-slate-600">Todas as opções disponíveis já estão no painel.</p>
                            )}
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

function RegionSparkCard({ card }: { card: RegionCard }) {
    const values = card.series.map((d) => Number(d.preco_m2_raw) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 320;
    const height = 92;
    const points = values.map((value: number, index: number) => {
        const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 14) - 7;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const firstYear = card.series[0]?.ano;
    const lastYear = card.series[card.series.length - 1]?.ano;
    const growthPositive = card.growth >= 0;

    return (
        <button
            type="button"
            className={`text-left bg-slate-950/70 border p-5 rounded-3xl transition-all hover:border-emerald-500/50 ${
                card.isPrimary ? 'border-emerald-500/50 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]' : 'border-slate-800'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${card.isPrimary ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                        <h4 className="text-sm font-black text-white capitalize">{card.name}</h4>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1 font-mono">
                        {firstYear}-{lastYear} · {Number(card.sample).toFixed(0)} imóveis
                    </p>
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-black ${growthPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {growthPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {card.growth.toFixed(1)}%
                </div>
            </div>

            <div className="mt-4 h-24">
                <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
                    <line x1="0" y1={height - 7} x2={width} y2={height - 7} stroke="#1e293b" strokeWidth="1" />
                    <polyline
                        points={points}
                        fill="none"
                        stroke={card.isPrimary ? '#10b981' : '#60a5fa'}
                        strokeWidth={card.isPrimary ? 4 : 3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {values.map((value: number, index: number) => {
                        const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
                        const y = height - ((value - min) / range) * (height - 14) - 7;
                        return (
                            <circle
                                key={`${card.name}-${index}`}
                                cx={x}
                                cy={y}
                                r={index === values.length - 1 ? 3.5 : 0}
                                fill={card.isPrimary ? '#10b981' : '#60a5fa'}
                            />
                        );
                    })}
                </svg>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                    <p className="text-[9px] uppercase font-black text-slate-600 tracking-widest">Preço/m²</p>
                    <p className="text-sm font-black text-white">
                        R$ {card.currentPriceM2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div>
                    <p className="text-[9px] uppercase font-black text-slate-600 tracking-widest">Segurança</p>
                    <p className="text-sm font-black text-white">{card.security.toFixed(0)}/100</p>
                </div>
                <div>
                    <p className="text-[9px] uppercase font-black text-slate-600 tracking-widest">Metrô</p>
                    <p className="text-sm font-black text-white">{card.metro?.toFixed(1) ?? '-'} km</p>
                </div>
            </div>
        </button>
    );
}

function QuickMetric({
    label,
    value,
    sub,
    icon,
    trend,
}: {
    label: string;
    value: string;
    sub: string;
    icon: ReactNode;
    trend?: 'up' | 'down';
}) {
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
