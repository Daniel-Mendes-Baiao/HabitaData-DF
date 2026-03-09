'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { propertiesAPI } from '@/services/api';
import { Search, Home, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// @ts-ignore
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function PropertyExplorer() {
    const [imovelId, setImovelId] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imovelId) return;

        setLoading(true);
        setError('');
        setData(null);

        try {
            const res = await propertiesAPI.getDetails(parseInt(imovelId, 10));
            setData(res);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('Imóvel não encontrado. Tente um ID entre 1 e 300.');
            } else {
                setError('Erro ao buscar dados do imóvel.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Home className="text-emerald-500" /> Explorador de Imóveis
                </h1>
                <p className="text-slate-400 mt-2">
                    Consulte o histórico individual e a performance histórica frente à média regional.
                </p>
            </header>

            {/* Barra de Busca */}
            <form onSubmit={handleSearch} className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                        type="number"
                        min="1"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="Digite o ID do imóvel (ex: 42)"
                        value={imovelId}
                        onChange={(e) => setImovelId(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading ? 'Buscando...' : 'Pesquisar'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-900/30 border border-red-800 text-red-400 rounded-xl">
                    {error}
                </div>
            )}

            {data && (
                <div className="space-y-8 animate-in fade-in duration-500">

                    {/* Ficha Técnica */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-emerald-400">Ficha Técnica — ID: {data.metadata.id_imovel}</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-slate-500">Região</p>
                                <p className="text-lg font-medium text-white">{data.metadata.nome_regiao}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Área Privativa</p>
                                <p className="text-lg font-medium text-white">{data.metadata.metragem} m²</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Quartos / Banheiros</p>
                                <p className="text-lg font-medium text-white">{data.metadata.quartos} / {data.metadata.banheiros}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Ano de Entrega</p>
                                <p className="text-lg font-medium text-white">{data.metadata.ano_entrega}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cards de Performance do Imóvel */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
                                <p className="text-sm text-slate-400 mb-1">Valor Inicial</p>
                                <p className="text-2xl font-bold text-white mb-4">R$ {data.metadata.valor_inicial?.toLocaleString('pt-BR')}</p>

                                <p className="text-sm text-slate-400 mb-1">Valor Estimado Atual</p>
                                <p className="text-3xl font-bold text-emerald-400">
                                    R$ {data.history[data.history.length - 1]?.valor_estimado?.toLocaleString('pt-BR')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-center items-center">
                                    <p className="text-xs text-slate-500 text-center uppercase tracking-wider mb-2">Valorização Total</p>
                                    <div className={`flex items-center gap-1 text-xl font-bold ${data.total_appreciation_pct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {data.total_appreciation_pct >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                        {data.total_appreciation_pct?.toFixed(2)}%
                                    </div>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-center items-center">
                                    <p className="text-xs text-slate-500 text-center uppercase tracking-wider mb-2">CAGR do Imóvel</p>
                                    <div className={`flex items-center gap-1 text-xl font-bold ${data.cagr_pct >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                        {data.cagr_pct?.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de Evolução 15 Anos */}
                        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm h-[350px]">
                            <h2 className="text-lg font-semibold mb-2 px-2">Evolução do Preço Estimado</h2>
                            <Plot
                                data={[
                                    {
                                        x: data.history.map((h: any) => h.ano),
                                        y: data.history.map((h: any) => h.valor_estimado),
                                        type: 'scatter',
                                        mode: 'lines+markers',
                                        marker: { color: '#0ea5e9', size: 8 }, // sky-500
                                        line: { shape: 'spline', width: 3 },
                                        name: `Imóvel #${data.metadata.id_imovel}`,
                                        fill: 'tozeroy',
                                        fillcolor: 'rgba(14, 165, 233, 0.1)'
                                    },
                                ]}
                                layout={{
                                    autosize: true,
                                    margin: { t: 10, r: 10, l: 60, b: 40 },
                                    paper_bgcolor: 'transparent',
                                    plot_bgcolor: 'transparent',
                                    font: { color: '#94a3b8' },
                                    xaxis: { gridcolor: '#334155', tickmode: 'linear', dtick: 2 },
                                    yaxis: { gridcolor: '#334155', tickprefix: 'R$ ' },
                                    hovermode: 'x unified'
                                }}
                                useResizeHandler={true}
                                style={{ width: '100%', height: '100%' }}
                                config={{ displayModeBar: false }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
