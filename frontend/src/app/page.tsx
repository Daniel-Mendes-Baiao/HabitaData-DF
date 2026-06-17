'use client';

import { useAnalytics } from '@/context/AnalyticsContext';
import { usePageContext } from '@/hooks/usePageContext';
import { 
  TrendingUp, 
  Map as MapIcon, 
  Search, 
  Zap, 
  Shield, 
  ChevronRight,
  BarChart3,
  Globe,
  Database
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const { state } = useAnalytics();

  usePageContext({
    route: '/',
    screenTitle: 'Dashboard Central',
    activeFilters: { anoSelecionado: state.anoSelecionado },
  });

  const stats = [
    { label: 'Valorização Média', value: '5.8%', icon: <TrendingUp className="text-emerald-400 w-5 h-5" />, trend: '+0.4%', trendType: 'positive' },
    { label: 'Preço Médio m²', value: 'R$ 8.420', icon: <Zap className="text-amber-400 w-5 h-5" />, trend: '+2.1%', trendType: 'positive' },
    { label: 'Índice de Segurança', value: '88/100', icon: <Shield className="text-sky-400 w-5 h-5" />, trend: 'Estável', trendType: 'neutral' },
    { label: 'Volume de Dados', value: '45k+', icon: <Database className="text-purple-400 w-5 h-5" />, trend: 'Atualizado', trendType: 'neutral' },
  ];

  return (
    <div className="p-12 space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="space-y-4 relative">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] rounded-full border border-emerald-500/15">
            Discovery Engine v2.4
          </span>
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
          Central de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Inteligência</span><br />
          Imobiliária DF
        </h1>
        <p className="text-base text-slate-400 max-w-2xl leading-relaxed font-medium">
          Bem-vindo ao HabitaData. Utilize as ferramentas laterais para explorar o mercado, 
          analisar tendências temporais e simular cenários financeiros com dados reais.
        </p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glassmorphism p-8 rounded-[2.5rem] glow-emerald-hover transition-all duration-500 hover:scale-[1.02] cursor-default relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800/60 rounded-2xl group-hover:scale-110 group-hover:border-emerald-500/20 transition-all duration-300">
                {stat.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                stat.trendType === 'positive'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/30'
              }`}>{stat.trend}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">{stat.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Link href="/analysis/regional" className="group">
          <div className="h-full bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border border-slate-800/80 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] hover:border-emerald-500/30">
            {/* Hover card glow decoration */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative z-10 space-y-5">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-all duration-300">
                <BarChart3 size={28} />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight leading-none pt-2">Análise Regional</h2>
              <p className="text-slate-400 font-medium max-w-sm text-sm leading-relaxed">
                Compare o desempenho entre diferentes regiões administrativas e descubra insights automáticos.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 group-hover:text-emerald-300 font-bold text-xs uppercase tracking-widest pt-4">
                Começar agora <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <Globe className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12 transition-transform duration-1000 group-hover:rotate-45" />
          </div>
        </Link>

        <Link href="/properties" className="group">
          <div className="h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(59,130,246,0.12)] hover:border-blue-500/30">
            {/* Hover card glow decoration */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative z-10 space-y-5">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-all duration-300">
                <Search size={28} />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight leading-none pt-2">Ativos & Filtros</h2>
              <p className="text-slate-400 font-medium max-w-sm text-sm leading-relaxed">
                Navegue pela lista completa de ativos imobiliários com filtros avançados e detalhamento técnico.
              </p>
              <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300 font-bold text-xs uppercase tracking-widest pt-4">
                Explorar ativos <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer Info */}
      <footer className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest font-mono">
          © 2026 HabitaData DF • Engine de Inteligência v2.4
        </p>
        <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
          <span className="hover:text-emerald-400 cursor-pointer transition-colors">Termos de Uso</span>
          <span className="hover:text-emerald-400 cursor-pointer transition-colors">Documentação API</span>
          <span className="hover:text-emerald-400 cursor-pointer transition-colors">Suporte Técnico</span>
        </div>
      </footer>
    </div>
  );
}
