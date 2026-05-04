'use client';

import React from 'react';
import { 
    BookOpen, 
    TrendingUp, 
    Home, 
    MapPin, 
    Shield, 
    School, 
    Train, 
    BarChart, 
    MousePointer2,
    Info,
    HelpCircle
} from 'lucide-react';

const MetricCard = ({ icon: Icon, title, description, formula, impact }: any) => (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {description}
                </p>
                {formula && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 font-mono text-[11px] text-emerald-500/80">
                        <span className="text-slate-500 mr-2">Cálculo:</span> {formula}
                    </div>
                )}
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <Activity className="w-3 h-3" />
                    <span>Impacto na Decisão:</span>
                    <span className="text-emerald-400">{impact}</span>
                </div>
            </div>
        </div>
    </div>
);

const Activity = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

export default function OnboardingPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12 pb-20">
            {/* Hero Section */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                    <BookOpen size={14} /> Guia de Usuário
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">HabitaData DF</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl">
                    Este guia ajudará você a entender as métricas avançadas e como extrair o máximo de inteligência imobiliária da plataforma.
                </p>
            </div>

            {/* Core Concept Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Info className="text-emerald-400" size={20} />
                    <h2 className="text-2xl font-bold text-white">Entendendo as Métricas</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard 
                        icon={TrendingUp}
                        title="CAGR % (Valorização Composta)"
                        description="Representa a taxa de crescimento anual composta de um imóvel ou região. É a métrica definitiva para investidores entenderem a rentabilidade histórica real."
                        formula="((Valor Atual / Valor Inicial) ^ (1 / Anos)) - 1"
                        impact="Alta - Essencial para análise de ROI"
                    />
                    <MetricCard 
                        icon={Home}
                        title="Preço Médio por m²"
                        description="Normaliza o valor dos imóveis permitindo a comparação direta entre ativos de diferentes tamanhos em diferentes regiões do DF."
                        formula="Valor Total / Área Construída"
                        impact="Média - Útil para detectar distorções de mercado"
                    />
                    <MetricCard 
                        icon={Shield}
                        title="Índice de Criminalidade"
                        description="Métrica derivada que analisa a segurança local. Historicamente, regiões com tendência de queda neste índice apresentam valorização acelerada."
                        impact="Direto - Afeta liquidez e demanda residencial"
                    />
                    <MetricCard 
                        icon={MapPin}
                        title="Índice de Desenvolvimento"
                        description="Combina fatores socioeconômicos da região. Quanto mais alto, maior o potencial de serviços e valor agregado ao metro quadrado."
                        impact="Estratégico - Indica maturidade da região"
                    />
                </div>
            </section>

            {/* Infrastructure Section */}
            <section className="space-y-6 bg-slate-900/30 p-8 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-2">
                    <Layers className="text-emerald-400" size={20} />
                    <h2 className="text-2xl font-bold text-white">Impacto Urbano</h2>
                </div>
                <p className="text-slate-400">A plataforma cruza dados de infraestrutura para explicar o comportamento dos preços:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                            <Train size={24} />
                        </div>
                        <h4 className="font-bold text-white">Mobilidade</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Distância ao Metrô</p>
                        <p className="text-sm text-slate-400">Geralmente, imóveis a menos de 1km do metrô valorizam 15% mais rápido.</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                            <School size={24} />
                        </div>
                        <h4 className="font-bold text-white">Educação</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Escolas em 1km</p>
                        <p className="text-sm text-slate-400">Presença de instituições de ensino aumenta a demanda para aluguel familiar.</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                            <BarChart size={24} />
                        </div>
                        <h4 className="font-bold text-white">Correlação</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Metragem vs Preço</p>
                        <p className="text-sm text-slate-400">Analisamos se o aumento da área entrega ganho proporcional de valor.</p>
                    </div>
                </div>
            </section>

            {/* Navigation Guide */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <MousePointer2 className="text-emerald-400" size={20} />
                    <h2 className="text-2xl font-bold text-white">Como Navegar</h2>
                </div>
                
                <div className="space-y-4">
                    <div className="flex gap-4 p-4 border-l-2 border-emerald-500 bg-emerald-500/5">
                        <div className="font-bold text-emerald-400">01.</div>
                        <div>
                            <p className="font-bold text-white">Mapa Interativo (Exploração Espacial)</p>
                            <p className="text-sm text-slate-400">Use o slider temporal no topo para ver como o DF mudou nos últimos 30 anos.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 border-l-2 border-slate-700 hover:border-emerald-500/50 transition-colors">
                        <div className="font-bold text-slate-600">02.</div>
                        <div>
                            <p className="font-bold text-white">Benchmarking Regional</p>
                            <p className="text-sm text-slate-400">Compare o desempenho da sua região favorita contra a média do mercado.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 border-l-2 border-slate-700 hover:border-emerald-500/50 transition-colors">
                        <div className="font-bold text-slate-600">03.</div>
                        <div>
                            <p className="font-bold text-white">Matriz de Correlação</p>
                            <p className="text-sm text-slate-400">Descubra quais fatores (ex: banheiros ou distância ao metrô) mais afetam o preço hoje.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-1 rounded-2xl">
                <div className="bg-slate-950 p-8 rounded-xl text-center space-y-4">
                    <h3 className="text-xl font-bold text-white">Pronto para começar?</h3>
                    <p className="text-slate-400">Sua jornada pela inteligência de dados imobiliários do DF começa agora.</p>
                    <a 
                        href="/" 
                        className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Ir para o Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}

const Layers = ({ className, size }: { className?: string, size?: number }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.3a2 2 0 0 0 0 3.38l9.07 4.12a2 2 0 0 0 1.66 0l9.07-4.12a2 2 0 0 0 0-3.38Z" />
        <path d="m2.1 14.74 9.07 4.12a2 2 0 0 0 1.66 0l9.07-4.12" />
        <path d="m2.1 10.56 9.07 4.12a2 2 0 0 0 1.66 0l9.07-4.12" />
    </svg>
);
