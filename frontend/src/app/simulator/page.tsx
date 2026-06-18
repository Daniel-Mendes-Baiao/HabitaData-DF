'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { regionsAPI, aiAPI, analysisAPI } from '@/services/api';
import { usePageContext } from '@/hooks/usePageContext';
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
  User,
  Zap,
  DollarSign,
  Clock,
  MapPin,
  BarChart3,
} from 'lucide-react';

const SIM_CHIPS = [
  "Vale a pena frente ao CDI?",
  "Qual o cenário pessimista?",
  "Compare com fundos imobiliários",
  "Riscos macroeconômicos?"
];

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

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  usePageContext({
    route: '/simulator',
    screenTitle: 'Simulador Financeiro',
    activeFilters: {
      regiao: selectedRegion,
      valorInvestimento: investmentValue,
      anoCompra: buyYear,
      anoVenda: sellYear,
    },
    selectedData: result ?? undefined,
  });

  useEffect(() => {
    async function fetchBaseData() {
      try {
        // getRanking(ano_inicio, ano_fim) — banco só tem dados até 2024
        const [regRes, summaryRes] = await Promise.all([
          regionsAPI.getRanking(2010, 2024),
          analysisAPI.getSummary(),
        ]);

        setRegions(regRes.data);

        // CAGR médio do mercado — vem direto do endpoint de summary (pré-calculado no backend)
        setMarketCagr(summaryRes.cagr_medio_pct ?? 4.77);

        if (regRes.data.length > 0) setSelectedRegion(regRes.data[0].nome_regiao);
      } catch (err) {
        console.error('Erro ao carregar dados do simulador:', err);
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
    const regionCagr = regionData ? regionData.cagr_medio_pct : 0;

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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleChipClick = (text: string) => {
    setChatInput(text);
  };

  return (
    <div className="p-8 lg:p-12 pb-20 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-[1.5rem] border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/5">
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
          <div className="lg:col-span-4 glassmorphism p-8 rounded-[2.5rem] shadow-2xl glow-blue-hover transition-all">
            <form onSubmit={handleSimulate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  Valor do Investimento
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-black">
                    <DollarSign size={18} />
                  </span>
                  <input
                    type="number"
                    value={investmentValue}
                    onChange={(e) => setInvestmentValue(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white font-black text-xl focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                    <Clock size={10} className="inline mr-1 -mt-0.5" /> Compra
                  </label>
                  <input
                    type="number"
                    min="2010"
                    max="2024"
                    value={buyYear}
                    onChange={(e) => setBuyYear(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-slate-700/50 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all"
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
                    className="w-full bg-slate-950/80 border border-slate-700/50 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  <MapPin size={10} className="inline mr-1 -mt-0.5" /> Região de Interesse
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/50 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 appearance-none transition-all"
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
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                Calcular Projeção <ChevronRight size={18} />
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="lg:col-span-8 space-y-8">
            {!result ? (
              <div className="glassmorphism !border-2 !border-dashed !border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center text-slate-500 space-y-4" style={{ minHeight: '300px' }}>
                <div className="p-5 bg-slate-800/30 rounded-[1.5rem]">
                  <Activity size={48} className="opacity-30" />
                </div>
                <p className="font-bold uppercase tracking-widest text-xs">
                  Aguardando Parâmetros de Simulação
                </p>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                {/* Main Result Card */}
                <div className="glassmorphism p-10 rounded-[3rem] shadow-2xl relative overflow-hidden glow-blue-hover transition-all">
                  {/* Background glow */}
                  <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Valor Projetado (Fim do Período)
                    </p>
                    <h3 className="text-6xl font-black text-blue-400 tracking-tighter mb-8">
                      R$ {result.projectedValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-white/[0.06]">
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
                        <p className="text-3xl font-black text-emerald-400">
                          +{result.roi.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          Período
                        </p>
                        <p className="text-3xl font-black text-white">
                          {result.years} <span className="text-lg text-slate-500">anos</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAiAnalyze}
                      disabled={isAiLoading}
                      className="mt-10 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl shadow-2xl shadow-blue-500/20 transition-all font-black uppercase tracking-widest text-xs disabled:opacity-50 group"
                    >
                      {isAiLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                      )}
                      Analisar Cenário com IA Agno
                    </button>
                  </div>
                  <Calculator className="absolute -bottom-10 -right-10 text-white/[0.03] w-64 h-64 rotate-12" />
                </div>

                {/* AI Analysis */}
                {aiAnalysis && (
                  <div className="glassmorphism !border-2 !border-blue-500/20 p-10 rounded-[3rem] shadow-2xl shadow-blue-500/5 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
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
                      <div className="prose prose-invert prose-blue max-w-none text-sm leading-relaxed prose-p:text-slate-300 prose-strong:text-blue-300 prose-li:text-slate-300">
                        <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Benchmarks + Chat */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Benchmark */}
                  <div className="glassmorphism p-8 rounded-[2.5rem] space-y-6 glow-blue-hover transition-all">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg"><TrendingUp size={14} className="text-blue-400" /></div> Benchmark de Mercado
                    </h4>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Região ({selectedRegion})</span>
                          <span className="text-emerald-400">{result.regionCagr?.toFixed(2)}% aa</span>
                        </div>
                        <div className="w-full bg-slate-950/80 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((result.regionCagr / 10) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Média Global DF</span>
                          <span className="text-blue-400">{result.marketCagr?.toFixed(2)}% aa</span>
                        </div>
                        <div className="w-full bg-slate-950/80 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((result.marketCagr / 10) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-slate-950/50 rounded-2xl border border-white/[0.06] flex gap-4 text-xs">
                      <AlertCircle className="text-blue-400 shrink-0" size={20} />
                      <p className="text-slate-400 leading-relaxed">
                        A região de <strong className="text-white">{selectedRegion}</strong> apresenta um prêmio de{' '}
                        <span className={result.diffToMarket >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          R${' '}
                          {Math.abs(result.diffToMarket).toLocaleString('pt-BR', {
                            maximumFractionDigits: 0,
                          })}
                        </span>{' '}
                        frente à média do DF.
                      </p>
                    </div>
                  </div>

                  {/* ========== CHAT IA PREMIUM ========== */}
                  <div className="glassmorphism rounded-[2.5rem] flex flex-col overflow-hidden glow-blue-hover transition-all" style={{ height: '460px' }}>
                    {/* Chat Header */}
                    <div className="p-5 border-b border-white/[0.06] bg-gradient-to-r from-blue-500/5 to-transparent flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <MessageSquare size={16} className="text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">
                            Chat sobre o Cenário
                          </h4>
                          <p className="text-[9px] text-slate-500 font-medium">IA Estrategista</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                        <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Online</span>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar-blue">
                      {aiChat.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <div className="p-4 bg-blue-500/[0.07] rounded-[1.5rem] border border-blue-500/10 mb-4">
                            <Bot size={32} className="text-blue-400/60" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 mb-1">Dúvidas sobre o cenário? 🤔</p>
                          <p className="text-[11px] text-slate-500 mb-5 max-w-[200px] leading-relaxed">
                            Pergunte sobre riscos, comparações e estratégias.
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {SIM_CHIPS.map((chip, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleChipClick(chip)}
                                className="px-3 py-1.5 bg-slate-800/60 hover:bg-blue-500/10 border border-slate-700/50 hover:border-blue-500/30 rounded-full text-[10px] font-medium text-slate-400 hover:text-blue-400 transition-all"
                              >
                                <Zap size={10} className="inline mr-1 -mt-0.5" />{chip}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiChat.map((msg, i) => (
                        <div key={i} className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                              : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600'
                          }`}>
                            {msg.role === 'user' ? <User size={13} className="text-white" /> : <Bot size={13} className="text-blue-400" />}
                          </div>
                          {/* Message Bubble */}
                          <div className={`max-w-[80%] px-4 py-3 text-[12px] font-medium leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-lg shadow-blue-500/10'
                              : 'bg-slate-800/70 text-slate-200 rounded-2xl rounded-bl-sm border border-slate-700/50'
                          }`}>
                            <div className="prose prose-invert prose-sm max-w-none prose-p:m-0 prose-p:text-inherit prose-strong:text-blue-300 prose-li:text-inherit prose-ul:my-1 prose-ol:my-1">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Typing Indicator */}
                      {isAiLoading && (
                        <div className="flex items-end gap-2.5">
                          <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600">
                            <Bot size={13} className="text-blue-400" />
                          </div>
                          <div className="bg-slate-800/70 px-5 py-3.5 rounded-2xl rounded-bl-sm border border-slate-700/50">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-blue-400 typing-dot"></div>
                              <div className="w-2 h-2 rounded-full bg-blue-400 typing-dot"></div>
                              <div className="w-2 h-2 rounded-full bg-blue-400 typing-dot"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleAiChat} className="p-4 border-t border-white/[0.06] bg-slate-950/30">
                      <div className="relative">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Pergunte à IA..."
                          className="w-full bg-slate-900/70 border border-slate-700/50 rounded-2xl py-3.5 pl-5 pr-14 outline-none text-xs focus:border-blue-500/50 focus:bg-slate-900 transition-all font-medium placeholder:text-slate-600"
                        />
                        <button
                          type="submit"
                          disabled={isAiLoading || !chatInput}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl disabled:opacity-30 disabled:bg-slate-700 transition-all"
                        >
                          <Send size={14} />
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
    </div>
  );
}
