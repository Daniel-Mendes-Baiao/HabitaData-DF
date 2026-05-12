'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { regionsAPI, marketAPI, aiAPI } from '@/services/api';
import type { ChatMessage, RegionSummary } from '@/types';
import {
  Calculator,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Bot,
  MessageSquare,
  Send,
  Loader2,
  ChevronRight,
  Activity,
} from 'lucide-react';

type SimulationResult = {
  years: number;
  regionCagr: number;
  marketCagr: number;
  projectedValue: number;
  marketProjectedValue: number;
  roi: number;
  diffToMarket: number;
  metadata: Record<string, string | number>;
  total_appreciation_pct: number;
  cagr_pct: number;
  history: [];
};

export default function InvestmentSimulator() {
  const [regions, setRegions] = useState<RegionSummary[]>([]);
  const [marketCagr, setMarketCagr] = useState<number>(0);

  // Form State
  const [selectedRegion, setSelectedRegion] = useState('');
  const [investmentValue, setInvestmentValue] = useState<number>(500000);
  const [buyYear, setBuyYear] = useState<number>(2015);
  const [sellYear, setSellYear] = useState<number>(2025);

  // Result State
  const [result, setResult] = useState<SimulationResult | null>(null);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiChat, setAiChat] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchBaseData() {
      try {
        const [regRes, mktDist] = await Promise.all([
          regionsAPI.getRanking(2025),
          marketAPI.getPriceDistribution(2024),
        ]);
        setRegions(regRes.data);
        const allCagrs = mktDist.data
          .map((d: { cagr_pct?: number }) => d.cagr_pct ?? 0)
          .filter((v: number) => v > 0);
        const avg =
          allCagrs.reduce((a: number, b: number) => a + b, 0) / allCagrs.length;
        setMarketCagr(avg || 4.82);
        if (regRes.data.length > 0) setSelectedRegion(regRes.data[0].nome_regiao);
      } catch (err) {
        console.error(err);
      }
    }
    fetchBaseData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChat]);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegion) return;
    const years = sellYear - buyYear;
    if (years <= 0) return;

    const regionData = regions.find((r) => r.nome_regiao === selectedRegion);
    const regionCagr = regionData?.cagr_medio_pct ?? 0;

    const regionMultiplier = Math.pow(1 + regionCagr / 100, years);
    const marketMultiplier = Math.pow(1 + marketCagr / 100, years);
    const projectedValue = investmentValue * regionMultiplier;
    const marketProjectedValue = investmentValue * marketMultiplier;

    setResult({
      years,
      regionCagr,
      marketCagr,
      projectedValue,
      marketProjectedValue,
      roi: ((projectedValue - investmentValue) / investmentValue) * 100,
      diffToMarket: projectedValue - marketProjectedValue,
      // dados para a IA
      metadata: {
        id_imovel: 'SIMULAÇÃO',
        nome_regiao: selectedRegion,
        metragem: 'N/A',
        quartos: 'N/A',
        banheiros: 'N/A',
        ano_entrega: buyYear,
        valor_inicial: investmentValue,
      },
      total_appreciation_pct: ((projectedValue - investmentValue) / investmentValue) * 100,
      cagr_pct: regionCagr,
      history: [],
    });
    setAiAnalysis(null);
    setAiChat([]);
  };

  const handleAiAnalyze = async () => {
    if (!result) return;
    setIsAiLoading(true);
    try {
      const res = await aiAPI.analyze(result);
      setAiAnalysis(res.analysis);
    } catch {
      setAiAnalysis('### Análise indisponível\n\nNão consegui conectar ao serviço de análise agora. A simulação financeira continua válida com os dados calculados na tela.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput || !result) return;
    const userMsg = chatInput;
    setChatInput('');
    setAiChat((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);
    try {
      const res = await aiAPI.analyze(result, userMsg);
      setAiChat((prev) => [...prev, { role: 'ai', text: res.analysis }]);
    } catch {
      setAiChat((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Não consegui conectar ao serviço de análise agora. Ainda assim, você pode usar ROI, CAGR regional e comparação com a média do DF para avaliar o cenário.',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 pb-20 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 text-emerald-500">
            <Calculator size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Simulador Financeiro
            </h1>
            <p className="text-slate-400 font-medium">
              Projete retornos baseados em dados reais do Distrito Federal.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleSimulate} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Valor do Investimento
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">
                  R$
                </span>
                <input
                  type="number"
                  value={investmentValue}
                  onChange={(e) => setInvestmentValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-black text-xl focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  Compra
                </label>
                <input
                  type="number"
                  min="2010"
                  max="2024"
                  value={buyYear}
                  onChange={(e) => setBuyYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  Venda (Projeção)
                </label>
                <input
                  type="number"
                  min={buyYear + 1}
                  max="2040"
                  value={sellYear}
                  onChange={(e) => setSellYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Região de Interesse
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500 appearance-none"
              >
                {regions.map((r, i) => (
                  <option key={i} value={r.nome_regiao}>
                    {r.nome_regiao}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              Calcular Projeção <ChevronRight size={18} />
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-8">
          {!result ? (
            <div className="border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center text-slate-500 space-y-4" style={{ minHeight: '300px' }}>
              <Activity size={48} className="opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">
                Aguardando Parâmetros de Simulação
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              {/* Main Result Card */}
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Valor Projetado (Fim do Período)
                  </p>
                  <h3 className="text-6xl font-black text-emerald-400 tracking-tighter mb-8">
                    R$ {result.projectedValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </h3>
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        Lucro Bruto Estimado
                      </p>
                      <p className="text-3xl font-black text-white">
                        R${' '}
                        {(result.projectedValue - investmentValue).toLocaleString('pt-BR', {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        Retorno Total (ROI)
                      </p>
                      <p className="text-3xl font-black text-emerald-500">
                        +{result.roi.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAiAnalyze}
                    disabled={isAiLoading}
                    className="mt-10 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl shadow-2xl shadow-blue-500/20 transition-all font-black uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    Analisar Cenário com IA Agno
                  </button>
                </div>
                <Calculator className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12" />
              </div>

              {/* AI Analysis */}
              {aiAnalysis && (
                <div className="bg-slate-900 border-2 border-blue-500/20 p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500 text-white rounded-2xl">
                      <Bot size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic">
                        Análise de Cenário IA
                      </h3>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        Agno Strategist Agent
                      </p>
                    </div>
                  </div>
                  <div className="prose prose-invert prose-blue max-w-none text-sm leading-relaxed">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Benchmarks + Chat */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Benchmark */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] space-y-6">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-400" /> Benchmark de Mercado
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Região ({selectedRegion})</span>
                        <span className="text-emerald-400">{result.regionCagr?.toFixed(2)}% aa</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-3">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((result.regionCagr / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Média Global DF</span>
                        <span className="text-blue-400">{result.marketCagr?.toFixed(2)}% aa</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((result.marketCagr / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 flex gap-4 text-xs">
                    <AlertCircle className="text-blue-400 shrink-0" size={20} />
                    <p className="text-slate-400 leading-relaxed">
                      A região de <strong>{selectedRegion}</strong> apresenta um prêmio de{' '}
                      <span className={result.diffToMarket >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        R${' '}
                        {Math.abs(result.diffToMarket).toLocaleString('pt-BR', {
                          maximumFractionDigits: 0,
                        })}
                      </span>{' '}
                      frente à média do DF.
                    </p>
                  </div>
                </div>

                {/* Chat IA */}
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] flex flex-col overflow-hidden" style={{ height: '400px' }}>
                  <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <MessageSquare size={18} className="text-blue-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">
                      Dúvidas sobre o Cenário?
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {aiChat.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-3">
                        <Bot size={36} />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                          Ex: &quot;Vale a pena frente ao CDI?&quot;
                        </p>
                      </div>
                    )}
                    {aiChat.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[90%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-slate-800 text-slate-300 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700">
                          <Loader2 size={14} className="animate-spin text-blue-400" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleAiChat} className="p-4 border-t border-slate-800 bg-slate-950/50">
                    <div className="relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Pergunte à IA..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-12 outline-none text-xs focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={isAiLoading || !chatInput}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 disabled:opacity-30"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
