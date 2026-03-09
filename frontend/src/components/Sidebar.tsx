'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/context/AnalyticsContext';
import {
    Map as MapIcon,
    BarChart3,
    Compass,
    Search,
    TrendingUp,
    Layers,
    Activity,
    ChevronRight,
    Zap
} from 'lucide-react';

const ANALYSIS_VARS = [
    { id: 'metragem', label: 'Metragem (m²)' },
    { id: 'cagr_pct', label: 'Valorização (CAGR %)' },
    { id: 'distancia_metro_km', label: 'Dist. Metrô (km)' },
    { id: 'indice_criminalidade', label: 'Criminalidade' },
    { id: 'escolas_1km', label: 'Infra (Escolas)' },
    { id: 'valor_medio_periodo', label: 'Preço Médio' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { state, setAnoInicio, setAnoFim, setVariableX, setVariableY } = useAnalytics();

    const navItems = [
        { href: '/', label: 'Exploração Espacial', icon: MapIcon },
        { href: '/discovery/regional', label: 'Benchmarking Regional', icon: Activity },
        { href: '/discovery/temporal', label: 'Índices de Crescimento', icon: Zap },
        { href: '/discovery/correlations', label: 'Matriz de Correlação', icon: BarChart3 },
        { href: '/market', label: 'Dinâmica de Mercado', icon: TrendingUp },
        { href: '/regions', label: 'Performance Regional', icon: BarChart3 },
        { href: '/properties', label: 'Detalhamento de Ativos', icon: Search },
        { href: '/simulator', label: 'Simulador Financeiro', icon: Compass },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    HabitaData <span className="text-emerald-400">DF</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-semibold">Discovery Engine v2</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-4 ml-2">Navegação</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === item.href
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                                {pathname === item.href && <ChevronRight size={14} className="ml-auto" />}
                            </Link>
                        ))}
                    </nav>
                </div>

            </div>

            <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
                DATA ENGINE ACTIVE
            </div>
        </aside>
    );
}
