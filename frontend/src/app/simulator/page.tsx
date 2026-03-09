'use client';

import { useState, useEffect } from 'react';
import { regionsAPI, marketAPI } from '@/services/api';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';

export default function InvestmentSimulator() {
    const [regions, setRegions] = useState<any[]>([]);
    const [marketCagr, setMarketCagr] = useState<number>(0);

    // Form State
    const [selectedRegion, setSelectedRegion] = useState('');
    const [investmentValue, setInvestmentValue] = useState<number>(500000);
    const [buyYear, setBuyYear] = useState<number>(2015);
    const [sellYear, setSellYear] = useState<number>(2025);

    // Result State
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        async function fetchBaseData() {
            try {
                const [regRes, mktDist] = await Promise.all([
                    regionsAPI.getRanking(2010, 2025),
                    marketAPI.getPriceDistribution(2010, 2025) // Traz array cagr
                ]);

                setRegions(regRes.data);

                // Calcular média de CAGR do mercado via reduce simples
                const allCagrs = mktDist.data.map((d: any) => d.cagr_pct).filter((v: number) => v > 0);
                const avg = allCagrs.reduce((a: number, b: number) => a + b, 0) / allCagrs.length;
                setMarketCagr(avg || 4.82);

                if (regRes.data.length > 0) {
                    setSelectedRegion(regRes.data[0].nome_regiao);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchBaseData();
    }, []);

    const handleSimulate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegion) return;

        const years = sellYear - buyYear;
        if (years <= 0) return;

        const regionData = regions.find(r => r.nome_regiao === selectedRegion);
        const regionCagr = regionData ? regionData.cagr_medio_pct : 0;

        // Fórmula Juros Compostos: FV = PV * (1 + i)^n
        const regionMultiplier = Math.pow(1 + (regionCagr / 100), years);
        const marketMultiplier = Math.pow(1 + (marketCagr / 100), years);

        const projectedValue = investmentValue * regionMultiplier;
        const marketProjectedValue = investmentValue * marketMultiplier;

        setResult({
            years,
            regionCagr,
            marketCagr,
            projectedValue,
            marketProjectedValue,
            roi: ((projectedValue - investmentValue) / investmentValue) * 100,
            diffToMarket: projectedValue - marketProjectedValue
        });
    };

    return (
        <div className="p-8 pb-20 max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Calculator className="text-emerald-500" /> Simulador de Investimento
                </h1>
                <p className="text-slate-400 mt-2">
                    Projete o retorno de um imóvel baseado com métricas históricas reais do DF.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Formulário */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm h-fit">
                    <form onSubmit={handleSimulate} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Valor Investido (R$)</label>
                            <input
                                type="number"
                                step="50000"
                                value={investmentValue}
                                onChange={(e) => setInvestmentValue(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Ano Compra</label>
                                <input
                                    type="number" min="2010" max="2024"
                                    value={buyYear}
                                    onChange={(e) => setBuyYear(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Ano Venda (Projeção)</label>
                                <input
                                    type="number" min={buyYear + 1} max="2040"
                                    value={sellYear}
                                    onChange={(e) => setSellYear(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Região Alvo</label>
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
                            >
                                {regions.map((r, i) => (
                                    <option key={i} value={r.nome_regiao}>{r.nome_regiao} (CAGR: {r.cagr_medio_pct?.toFixed(2)}%)</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Simular Cenário
                        </button>
                    </form>
                </div>

                {/* Resultados */}
                <div className="space-y-6">
                    {!result ? (
                        <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center p-6 text-center text-slate-500">
                            <p>Preencha os parâmetros e simule para ver a projeção de rendimentos projetada pela camada analítica.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm animate-in zoom-in duration-300">
                                <p className="text-sm text-slate-400 mb-1">Valor Projetado de Venda</p>
                                <p className="text-4xl font-bold text-emerald-400 mb-2">
                                    R$ {result.projectedValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                </p>
                                <div className="flex gap-4 mt-4 pt-4 border-t border-slate-800">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Lucro Bruto</p>
                                        <p className="text-lg font-medium text-white">R$ {(result.projectedValue - investmentValue).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">ROI Total</p>
                                        <p className="text-lg font-medium text-emerald-400">+{result.roi.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
                                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-blue-400" /> Benchmark de Mercado
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400">Na Região ({selectedRegion})</span>
                                            <span className="font-medium text-emerald-400">{result.regionCagr?.toFixed(2)}% aa</span>
                                        </div>
                                        <div className="w-full bg-slate-950 rounded-full h-2">
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((result.regionCagr / 10) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400">Média Global do DF</span>
                                            <span className="font-medium text-indigo-400">{result.marketCagr?.toFixed(2)}% aa</span>
                                        </div>
                                        <div className="w-full bg-slate-950 rounded-full h-2">
                                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min((result.marketCagr / 10) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-slate-950 rounded-lg flex gap-3 text-sm">
                                    <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                                    <p className="text-slate-300">
                                        Sua escolha em <strong>{selectedRegion}</strong> renderia{' '}
                                        <strong className={result.diffToMarket >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                            R$ {Math.abs(result.diffToMarket).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                        </strong>{' '}
                                        a {result.diffToMarket >= 0 ? 'mais' : 'menos'} do que investir na média representativa do Distrito Federal durante os <strong>{result.years} anos</strong>.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
