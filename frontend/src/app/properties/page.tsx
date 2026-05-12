'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import { propertiesAPI, aiAPI } from '@/services/api';
import type { ChatMessage, PropertyDetails, PropertyHistoryPoint, PropertyListItem } from '@/types';
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
  MessageSquare
} from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function PropertyExplorer() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('Todas');

  // IA States
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiChat, setAiChat] = useState<ChatMessage[]>([]);
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
    const id = selectedId; // narrow: number | null → number
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

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchSearch = (p.id_imovel?.toString() || '').includes(searchTerm) || 
                          (p.nome_regiao?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchRegion = filterRegion === 'Todas' || p.nome_regiao === filterRegion;
      return matchSearch && matchRegion;
    });
  }, [properties, searchTerm, filterRegion]);

  const regions = useMemo(() => {
    return ['Todas', ...new Set(properties.map(p => p.nome_regiao))];
  }, [properties]);

  const handleAiAnalyze = async () => {
    if (!detailData) return;
    setIsAiLoading(true);
    try {
      const res = await aiAPI.analyze(detailData);
      setAiAnalysis(res.analysis);
    } catch {
      setAiAnalysis('### Análise indisponível\n\nNão consegui conectar ao serviço de análise agora. Os dados do imóvel continuam disponíveis na ficha e no histórico abaixo.');
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
    } catch {
      setAiChat(prev => [
        ...prev,
        {
          role: 'ai',
          text: 'Não consegui conectar ao serviço de análise agora. Tente novamente em alguns instantes ou use os indicadores da ficha para comparar preço, CAGR e histórico.',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 lg:p-12 font-sans overflow-y-auto">
      {/* Header Centralizado */}
      <header className="mb-12 space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 text-emerald-500">
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
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:border-emerald-500/50 outline-none transition-all font-medium"
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
            className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest mb-8 hover:text-emerald-400 transition-colors"
          >
            <ChevronLeft size={16} /> Voltar para a Lista
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
                
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-12">
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
                <div className="bg-slate-900/80 backdrop-blur-3xl border-2 border-emerald-500/20 p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl shadow-2xl shadow-emerald-500/30">
                      <Bot size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic">Análise HabitaData AI</h3>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Agno Agent v2.0 • Powered by Gemini</p>
                    </div>
                  </div>
                  <div className="prose prose-invert prose-emerald max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-emerald-400">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Grid de Dados e Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chat com IA */}
                <div className="flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden">
                  <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-emerald-500" />
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Conversar sobre o Ativo</h4>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {aiChat.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <Bot size={48} className="mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                          Tire suas dúvidas sobre este imóvel.<br />Ex: &quot;Vale a pena comprar para alugar?&quot;
                        </p>
                      </div>
                    )}
                    {aiChat.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                          msg.role === 'user' 
                          ? 'bg-emerald-500 text-slate-950 rounded-br-none' 
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                        }`}>
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-700">
                          <Loader2 size={16} className="animate-spin text-emerald-500" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleAiChat} className="p-4 bg-slate-950/50 border-t border-slate-800">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Pergunte à IA..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-6 pr-14 focus:border-emerald-500/50 outline-none transition-all text-xs font-medium"
                      />
                      <button 
                        type="submit"
                        disabled={isAiLoading || !chatInput}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 disabled:opacity-30"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Gráficos e Histórico */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] h-[450px]">
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Evolução do Ativo (15 Anos)</h4>
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-[10px] font-black uppercase">
                        CAGR: {detailData.cagr_pct.toFixed(2)}%
                      </div>
                    </div>
                    <Plot
                      data={[
                        {
                          x: detailData.history.map((h: PropertyHistoryPoint) => h.ano),
                          y: detailData.history.map((h: PropertyHistoryPoint) => h.valor_estimado),
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

                  {/* Ficha Técnica Rápida (Estilo Card) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-slate-950">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Área Privativa</p>
                       <h5 className="text-2xl font-black">{detailData.metadata.metragem} m²</h5>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Dormitórios</p>
                       <h5 className="text-2xl font-black text-white">{detailData.metadata.quartos} Qts</h5>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ano Entrega</p>
                       <h5 className="text-2xl font-black text-white">{detailData.metadata.ano_entrega}</h5>
                    </div>
                  </div>

                  {/* Tabela de Variação Anual */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                          <th className="px-8 py-6">Ano</th>
                          <th className="px-8 py-6">Valor Nominal</th>
                          <th className="px-8 py-6 text-right">Variação YoY</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.history.slice(-5).reverse().map((h: PropertyHistoryPoint, i: number) => {
                          const yoy = h.variacao_yoy_pct ?? 0;
                          return (
                            <tr key={i} className="border-b border-slate-800/30 hover:bg-white/5 transition-colors">
                              <td className="px-8 py-5 text-sm font-bold text-white">{h.ano}</td>
                              <td className="px-8 py-5 text-sm font-medium text-slate-300">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(h.valor_estimado)}
                              </td>
                              <td className={`px-8 py-5 text-sm font-black text-right ${yoy >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {yoy > 0 ? '+' : ''}{yoy.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProperties.map(p => (
                <div 
                  key={p.id_imovel}
                  onClick={() => setSelectedId(p.id_imovel)}
                  className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/50 transition-all cursor-pointer group hover:bg-slate-900/80 active:scale-95"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-950 rounded-xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <Home size={20} />
                    </div>
                    <span className="px-3 py-1 bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                      #{p.id_imovel}
                    </span>
                  </div>
                  
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{p.nome_regiao}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <Maximize2 size={14} className="text-emerald-500" />
                    <span className="text-xl font-black text-white">{p.metragem} m²</span>
                  </div>

                  <div className="h-px bg-slate-800 w-full mb-6"></div>

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
          )}
          {filteredProperties.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
              <Search size={48} className="text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum ativo corresponde aos filtros aplicados.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
