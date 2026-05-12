'use client';

import { 
  TrendingUp, 
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
  const stats = [
    { label: 'Valorização Média', value: '5.5%', icon: <TrendingUp className="text-emerald-500" />, trend: 'IVG-R' },
    { label: 'Preço Médio m²', value: 'R$ 10.552', icon: <Zap className="text-amber-500" />, trend: '2024' },
    { label: 'Índice de Segurança', value: '74/100', icon: <Shield className="text-blue-500" />, trend: 'SSP-DF' },
    { label: 'Volume de Dados', value: '45.8k', icon: <Database className="text-purple-500" />, trend: 'Integrado' },
  ];

  const sources = [
    {
      name: 'Kaggle Imóveis DF',
      detail: 'aluguel, área, quartos, tipo e bairro',
      href: 'https://www.kaggle.com/datasets/matheusnbrega/preo-do-aluguel-de-imveis-no-distrito-federal',
    },
    {
      name: 'Banco Central IVG-R',
      detail: 'série histórica de valorização imobiliária',
      href: 'https://dadosabertos.bcb.gov.br/dataset/21340-indice-de-valores-de-garantia-de-imoveis-residenciais-financiados-ivg-r',
    },
    {
      name: 'SSP-DF Crimes CCP',
      detail: 'criminalidade por Região Administrativa',
      href: 'https://dados.df.gov.br/dataset/crimes-contra-o-patrimonio-ccp',
    },
    {
      name: 'IPEDF, Geoportal, INEP, CNES e OSM',
      detail: 'RAs, desenvolvimento, infraestrutura e serviços',
      href: 'https://www.ipe.df.gov.br/pdad',
    },
  ];

  return (
    <div className="p-12 space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">
            Discovery Engine v2
          </span>
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter leading-tight">
          Central de <span className="text-emerald-500">Inteligência</span><br />
          Imobiliária DF
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed font-medium">
          Bem-vindo ao HabitaData. Utilize as ferramentas laterais para explorar o mercado, 
          analisar tendências temporais e simular cenários financeiros com dados reais.
        </p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-950 rounded-2xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-white">Fontes integradas</h2>
          <p className="text-sm text-slate-500 mt-1">
            Bases públicas usadas para substituir os indicadores simulados por dados rastreáveis.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sources.map((source) => (
            <a
              key={source.name}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/60 transition-colors"
            >
              <p className="text-sm font-black text-white">{source.name}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{source.detail}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Link href="/analysis/regional" className="group">
          <div className="h-full bg-gradient-to-br from-emerald-600 to-emerald-900 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden transition-all hover:scale-[1.02]">
            <div className="relative z-10 space-y-4">
              <BarChart3 size={48} className="text-white/80" />
              <h2 className="text-4xl font-black text-white tracking-tight">Análise Regional</h2>
              <p className="text-emerald-100/80 font-medium max-w-sm">
                Compare o desempenho entre diferentes regiões administrativas e descubra insights automáticos.
              </p>
              <div className="flex items-center gap-2 text-white font-bold text-sm pt-4">
                Começar agora <ChevronRight size={16} />
              </div>
            </div>
            <Globe className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12" />
          </div>
        </Link>

        <Link href="/properties" className="group">
          <div className="h-full bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden transition-all hover:border-emerald-500/50 hover:scale-[1.02]">
            <div className="relative z-10 space-y-4">
              <Search size={48} className="text-emerald-500" />
              <h2 className="text-4xl font-black text-white tracking-tight">Ativos & Filtros</h2>
              <p className="text-slate-400 font-medium max-w-sm">
                Navegue pela lista completa de ativos imobiliários com filtros avançados e detalhamento técnico.
              </p>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm pt-4">
                Explorar ativos <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer Info */}
      <footer className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          © 2026 HabitaData DF • Engine de Inteligência v2.4
        </p>
        <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
          <span className="hover:text-emerald-500 cursor-pointer transition-colors">Termos de Uso</span>
          <span className="hover:text-emerald-500 cursor-pointer transition-colors">Documentação API</span>
          <span className="hover:text-emerald-500 cursor-pointer transition-colors">Suporte Técnico</span>
        </div>
      </footer>
    </div>
  );
}
