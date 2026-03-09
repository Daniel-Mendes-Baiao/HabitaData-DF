'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { regionsAPI } from '@/services/api';
import { Map, BarChart2, Star } from 'lucide-react';

// @ts-ignore
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function RegionIntelligence() {
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [appreciationData, setAppreciationData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [rankRes, appRes] = await Promise.all([
                    regionsAPI.getRanking(),
                    regionsAPI.getAppreciation(),
                ]);
                setRankingData(rankRes.data);
                setAppreciationData(appRes.data);
            } catch (error) {
                console.error("Error fetching regions data", error);
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
    // Top 10 Regiões para o gráfico de barras
    const top10 = rankingData.slice(0, 10);
    const topNames = top10.map(d => d.nome_regiao).reverse(); // inverte para o topo ficar em cima no barh
    const topCAGR = top10.map(d => d.cagr_medio_pct).reverse();

    // Dados de dispersão: Risco x Retorno (Desvio vs CAGR médio)
    const appNames = appreciationData.map(d => d.nome_regiao);
    const appCAGR = appreciationData.map(d => d.cagr_medio_pct);
    const appStdDev = appreciationData.map(d => d.std_cagr_pct);

    return (
        <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Map className="text-emerald-500" /> Inteligência Regional
                </h1>
                <p className="text-slate-400 mt-2">
                    Rankings, comparações e métricas isoladas das RAs (Regiões Administrativas) do DF.
                </p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Star size={18} className="text-yellow-500" />
                        <span className="font-medium text-sm text-slate-300">Região #1 Rank</span>
                    </div>
                    <div className="text-xl font-bold text-white truncate" title={rankingData[0]?.nome_regiao}>
                        {rankingData[0]?.nome_regiao}
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold mt-2">{rankingData[0]?.cagr_medio_pct?.toFixed(2)}% CAGR</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <BarChart2 size={18} />
                        <span className="font-medium text-sm text-slate-300">Média de Valorização</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                        {(appreciationData.reduce((acc, curr) => acc + (curr.cagr_medio_pct || 0), 0) / appreciationData.length).toFixed(2)}%
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Média global das RAs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico 1: Bar Chart Horizontal do Top 10 */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm w-full overflow-hidden">
                    <h2 className="text-lg font-semibold mb-4 px-2">Top 10 Regiões que mais Valorizaram</h2>
                    <Plot
                        data={[
                            {
                                type: 'bar',
                                x: topCAGR,
                                y: topNames,
                                orientation: 'h',
                                marker: { color: '#10b981' }, // emerald-500
                            },
                        ]}
                        layout={{
                            autosize: true,
                            margin: { t: 10, r: 20, l: 140, b: 40 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#94a3b8' },
                            xaxis: { gridcolor: '#334155', title: { text: 'CAGR (%)' }, ticksuffix: '%' },
                            yaxis: { gridcolor: 'transparent' },
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '400px' }}
                        config={{ displayModeBar: false }}
                    />
                </div>

                {/* Gráfico 2: Dispersão CAGR x Risco (Desvio Padrão) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm w-full overflow-hidden">
                    <h2 className="text-lg font-semibold mb-4 px-2">Risco x Retorno por Região</h2>
                    <Plot
                        data={[
                            {
                                x: appStdDev,
                                y: appCAGR,
                                text: appNames,
                                mode: 'markers',
                                type: 'scatter',
                                marker: {
                                    size: 10,
                                    color: appCAGR,
                                    colorscale: 'Viridis',
                                    showscale: true,
                                },
                            },
                        ]}
                        layout={{
                            autosize: true,
                            margin: { t: 10, r: 10, l: 50, b: 50 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#94a3b8' },
                            xaxis: { gridcolor: '#334155', title: { text: 'Risco (Desvio Padrão %)' } },
                            yaxis: { gridcolor: '#334155', title: { text: 'Retorno (CAGR %)' } },
                            hovermode: 'closest',
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '400px' }}
                        config={{ displayModeBar: false }}
                    />
                </div>
            </div>

            {/* Tabela Interativa de Ranking Completo */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm mt-8">
                <h2 className="text-lg font-semibold mb-4 px-2">Ranking Geral Completo</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3">Posição</th>
                                <th className="px-6 py-3">Região</th>
                                <th className="px-6 py-3 text-right">CAGR Médio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankingData.map((row, idx) => (
                                <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                                    <td className="px-6 py-3 font-medium text-emerald-400">#{row.posicao}</td>
                                    <td className="px-6 py-3">{row.nome_regiao}</td>
                                    <td className="px-6 py-3 text-right font-mono">{row.cagr_medio_pct?.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
