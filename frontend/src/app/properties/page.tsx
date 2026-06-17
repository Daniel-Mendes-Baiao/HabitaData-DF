'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import { propertiesAPI, aiAPI } from '@/services/api';
import { usePageContext } from '@/hooks/usePageContext';
import { 
  Search, 
  Home, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronLeft,
  MapPin,
  Maximize2,
  Layers,
  Loader2,
  Bot,
  Send,
  Sparkles,
  MessageSquare,
  User,
  Zap
} from 'lucide-react';

// @ts-ignore
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const SUGGESTION_CHIPS = [
  "Vale a pena comprar para alugar?",
  "Qual a tendência de valorização?",
  "Compare com a média do DF",
  "Riscos desse investimento?"
];

export default function PropertyExplorer() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('Todas');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // IA States
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiChat, setAiChat] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Carregar lista inicial
  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await propertiesAPI.list();
        setProperties(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar lista de imóveis", err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  // Carregar detalhes ao selecionar
  useEffect(() => {
    if (!selectedId) return;
    const id = selectedId;
    async function loadDetail() {
      setLoadingDetail(true);
      setAiAnalysis(null);
      setAiChat([]);
      try {
        const res = await propertiesAPI.getDetails(id);
        setDetailData(res);
      } catch (err) {
        console.error("Erro ao carregar detalhes", err);
      } finally {
        setLoadingDetail(false);
      }
    }
    loadDetail();
  }, [selectedId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChat]);

  // Registrar contexto da tela no chatbot global
  usePageContext({
    route: '/properties',
    screenTitle: 'Detalhamento de Ativos',
    activeFilters: {
      busca: searchTerm || undefined,
      regiao: filterRegion !== 'Todas' ? filterRegion : undefined,
    },
    selectedData: detailData ?? undefined,
  });

  // Reset de página quando a busca ou região mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRegion]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchSearch = (p.id_imovel?.toString() || '').includes(searchTerm) || 
                          (p.nome_regiao?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchRegion = filterRegion === 'Todas' || p.nome_regiao === filterRegion;
      return matchSearch && matchRegion;
    });
  }, [properties, searchTerm, filterRegion]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  }, [filteredProperties]);

  const regions = useMemo(() => {
    return ['Todas', ...new Set(properties.map(p => p.nome_regiao))];
  }, [properties]);

  const handleAiAnalyze = async () => {
    if (!detailData) return;
    setIsAiLoading(true);
    try {
      const res = await aiAPI.analyze(detailData);
      setAiAnalysis(res.analysis);
    } catch (err) {
      console.error("Erro na análise IA", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput || !detailData) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setAiChat(prev => [...prev, {role: 'user', text: userMsg}]);
    
    setIsAiLoading(true);
    try {
      const res = await aiAPI.analyze(detailData, userMsg);
      setAiChat(prev => [...prev, {role: 'ai', text: res.analysis}]);
    } catch (err) {
      console.error("Erro no chat IA", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleChipClick = (text: string) => {
    setChatInput(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 lg:p-12 font-sans overflow-y-auto relative">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/[0.03] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Header Centralizado */}
        <header className="mb-12 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/5">
              <Layers size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Portfólio de Ativos</h1>
              <p className="text-slate-400 font-medium">Navegue pela base histórica e analise o desempenho individual de cada unidade.</p>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por ID ou Região..."
                className="w-full glassmorphism !bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:border-emerald-500/50 outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500/50 text-sm font-bold uppercase tracking-wider"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </header>

        {selectedId ? (
          /* VISÃO DE DETALHE */
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button 
              onClick={() => { setSelectedId(null); setDetailData(null); }}
              className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest mb-8 hover:text-emerald-400 transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para a Lista
            </button>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processando Metadados do Ativo...</p>
              </div>
            ) : detailData && (
              <div className="space-y-12 pb-20">
                {/* Header do Detalhe com Botão de IA */}
                <div className="flex flex-wrap items-start justify-between gap-8">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                          ID: {detailData.metadata.id_imovel}
                        </span>
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={12} /> {detailData.metadata.nome_regiao}
                        </span>
                      </div>
                      <h2 className="text-6xl font-black text-white tracking-tighter">Análise Estrutural</h2>
                    </div>
                    
                    <button 
                      onClick={handleAiAnalyze}
                      disabled={isAiLoading}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[1.5rem] shadow-2xl shadow-emerald-500/20 transition-all font-black uppercase tracking-widest text-xs disabled:opacity-50 group"
                    >
                      {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />}
                      Análise Profunda com IA Agno
                    </button>
                  </div>
                  
                  <div className="glassmorphism p-8 rounded-[2.5rem] flex items-center gap-12 glow-emerald-hover transition-all">
                     <div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valor Atual</p>
                       <p className="text-3xl font-black text-emerald-400">
                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(detailData.history[detailData.history.length-1]?.valor_estimado || 0)}
                       </p>
                     </div>
                     <div className="w-px h-12 bg-slate-800"></div>
                     <div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valorização Total</p>
                       <div className={`text-3xl font-black flex items-center gap-1 ${detailData.total_appreciation_pct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                         {detailData.total_appreciation_pct >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                         {detailData.total_appreciation_pct?.toFixed(1)}%
                       </div>
                     </div>
                  </div>
                </div>

                {/* Seção de Análise IA (se houver) */}
                {aiAnalysis && (
                  <div className="glassmorphism !border-2 !border-emerald-500/20 p-10 rounded-[3rem] shadow-2xl shadow-emerald-500/5 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                    {/* Glow background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-2xl shadow-emerald-500/30">
                          <Bot size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white uppercase italic">Análise HabitaData AI</h3>
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Agno Agent v2.0 • Powered by Gemini</p>
                        </div>
                      </div>
                      <div className="prose prose-invert prose-emerald max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-emerald-400 prose-li:text-slate-300">
                        <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid de Dados e Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* ========== CHAT COM IA PREMIUM ========== */}
                  <div className="flex flex-col h-[650px] glassmorphism rounded-[2.5rem] overflow-hidden glow-emerald-hover transition-all">
                    {/* Chat Header */}
                    <div className="p-5 border-b border-white/[0.06] bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <MessageSquare size={16} className="text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">Chat sobre o Ativo</h4>
                          <p className="text-[9px] text-slate-500 font-medium">Pergunte qualquer coisa à IA</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Online</span>
                      </div>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                      {aiChat.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                          <div className="p-5 bg-emerald-500/[0.07] rounded-[1.5rem] border border-emerald-500/10 mb-5">
                            <Bot size={36} className="text-emerald-500/60" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 mb-1">Olá! 👋</p>
                          <p className="text-xs text-slate-500 mb-6 max-w-[220px] leading-relaxed">
                            Tire suas dúvidas sobre este imóvel com a inteligência artificial.
                          </p>
                          {/* Suggestion Chips */}
                          <div className="flex flex-wrap gap-2 justify-center">
                            {SUGGESTION_CHIPS.map((chip, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleChipClick(chip)}
                                className="px-3 py-1.5 bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-700/50 hover:border-emerald-500/30 rounded-full text-[10px] font-medium text-slate-400 hover:text-emerald-400 transition-all"
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
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                              : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600'
                          }`}>
                            {msg.role === 'user' ? <User size={13} className="text-white" /> : <Bot size={13} className="text-emerald-400" />}
                          </div>
                          {/* Message Bubble */}
                          <div className={`max-w-[80%] px-4 py-3 text-[12px] font-medium leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl rounded-br-sm shadow-lg shadow-emerald-500/10' 
                            : 'bg-slate-800/70 text-slate-200 rounded-2xl rounded-bl-sm border border-slate-700/50'
                          }`}>
                            <div className="prose prose-invert prose-sm max-w-none prose-p:m-0 prose-p:text-inherit prose-strong:text-emerald-300 prose-li:text-inherit prose-ul:my-1 prose-ol:my-1">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Typing Indicator */}
                      {isAiLoading && (
                        <div className="flex items-end gap-2.5">
                          <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600">
                            <Bot size={13} className="text-emerald-400" />
                          </div>
                          <div className="bg-slate-800/70 px-5 py-3.5 rounded-2xl rounded-bl-sm border border-slate-700/50">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 typing-dot"></div>
                              <div className="w-2 h-2 rounded-full bg-emerald-400 typing-dot"></div>
                              <div className="w-2 h-2 rounded-full bg-emerald-400 typing-dot"></div>
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
                          className="w-full bg-slate-900/70 border border-slate-700/50 rounded-2xl py-3.5 pl-5 pr-14 focus:border-emerald-500/50 focus:bg-slate-900 outline-none transition-all text-xs font-medium placeholder:text-slate-600"
                        />
                        <button 
                          type="submit"
                          disabled={isAiLoading || !chatInput}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl disabled:opacity-30 disabled:bg-slate-700 transition-all"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Gráficos e Histórico */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="glassmorphism p-8 rounded-[2.5rem] h-[450px]">
                      <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Evolução do Ativo (15 Anos)</h4>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-[10px] font-black uppercase">
                          CAGR: {detailData.cagr_pct.toFixed(2)}%
                        </div>
                      </div>
                      <Plot
                        data={[
                          {
                            x: detailData.history.map((h: any) => h.ano),
                            y: detailData.history.map((h: any) => h.valor_estimado),
                            type: 'scatter',
                            mode: 'lines+markers',
                            line: { color: '#10b981', width: 4, shape: 'spline' },
                            marker: { color: '#ffffff', size: 8, line: { color: '#10b981', width: 2 } },
                            fill: 'tozeroy',
                            fillcolor: 'rgba(16, 185, 129, 0.05)',
                            name: 'Valor Estimado'
                          },
                        ]}
                        layout={{
                          autosize: true,
                          margin: { t: 0, r: 0, l: 60, b: 40 },
                          paper_bgcolor: 'transparent',
                          plot_bgcolor: 'transparent',
                          font: { color: '#94a3b8', family: 'Inter, sans-serif' },
                          xaxis: { gridcolor: '#1e293b', tickmode: 'linear', dtick: 2 },
                          yaxis: { gridcolor: '#1e293b', tickprefix: 'R$ ' },
                          hovermode: 'x unified'
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '80%' }}
                        config={{ displayModeBar: false }}
                      />
                    </div>

                    {/* Ficha Técnica Rápida */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/10">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Área Privativa</p>
                         <h5 className="text-2xl font-black">{detailData.metadata.metragem} m²</h5>
                      </div>
                      <div className="glassmorphism p-8 rounded-[2.5rem] glow-emerald-hover transition-all">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Dormitórios</p>
                         <h5 className="text-2xl font-black text-white">{detailData.metadata.quartos} Qts</h5>
                      </div>
                      <div className="glassmorphism p-8 rounded-[2.5rem] glow-emerald-hover transition-all">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ano Entrega</p>
                         <h5 className="text-2xl font-black text-white">{detailData.metadata.ano_entrega}</h5>
                      </div>
                    </div>

                    {/* Tabela de Variação Anual */}
                    <div className="glassmorphism rounded-[2.5rem] overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/[0.06] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            <th className="px-8 py-6">Ano</th>
                            <th className="px-8 py-6">Valor Nominal</th>
                            <th className="px-8 py-6 text-right">Variação YoY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailData.history.slice(-5).reverse().map((h: any, i: number) => (
                            <tr key={i} className="border-b border-white/[0.03] hover:bg-white/5 transition-colors">
                              <td className="px-8 py-5 text-sm font-bold text-white">{h.ano}</td>
                              <td className="px-8 py-5 text-sm font-medium text-slate-300">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(h.valor_estimado)}
                              </td>
                              <td className={`px-8 py-5 text-sm font-black text-right ${h.variacao_yoy_pct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {h.variacao_yoy_pct > 0 ? '+' : ''}{h.variacao_yoy_pct?.toFixed(2)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* LISTAGEM DE IMÓVEIS */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sincronizando Base de Ativos...</p>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProperties.map(p => (
                    <div 
                      key={p.id_imovel}
                      onClick={() => setSelectedId(p.id_imovel)}
                      className="glassmorphism p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all cursor-pointer group active:scale-[0.97] glow-emerald-hover"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-slate-950/80 rounded-xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                          <Home size={20} />
                        </div>
                        <span className="px-3 py-1 bg-slate-950/80 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                          #{p.id_imovel}
                        </span>
                      </div>
                      
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{p.nome_regiao}</h3>
                      <div className="flex items-center gap-2 mb-6">
                        <Maximize2 size={14} className="text-emerald-500" />
                        <span className="text-xl font-black text-white">{p.metragem} m²</span>
                      </div>

                      <div className="h-px bg-white/[0.06] w-full mb-6"></div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Avaliação Última</p>
                          <p className="text-lg font-black text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.ultimo_valor || 0)}
                          </p>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronLeft size={16} className="rotate-180" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controles de Paginação Premium */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-6 pt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/30 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-800 transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Página <strong className="text-emerald-400">{currentPage}</strong> de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/30 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-800 transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </div>
            )}
            {filteredProperties.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 glassmorphism !border-dashed rounded-[3rem]">
                <Search size={48} className="text-slate-700 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum ativo corresponde aos filtros aplicados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
