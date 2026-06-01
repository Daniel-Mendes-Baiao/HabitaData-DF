'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Compass,
    Search,
    Activity,
    ChevronRight,
    BookOpen,
    Target,
    Server,
    Wifi,
    WifiOff
} from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();
    const [apiConnected, setApiConnected] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkConnection() {
            try {
                const response = await fetch('http://127.0.0.1:8000/');
                if (response.ok) {
                    setApiConnected(true);
                } else {
                    setApiConnected(false);
                }
            } catch (err) {
                setApiConnected(false);
            }
        }
        checkConnection();
        const interval = setInterval(checkConnection, 15000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { href: '/onboarding', label: 'Guia de Uso & Métricas', icon: BookOpen },
        { href: '/', label: 'Dashboard Central', icon: Activity },
        { href: '/analysis/regional', label: 'Análise por Região', icon: Target },
        { href: '/properties', label: 'Detalhamento de Ativos', icon: Search },
        { href: '/simulator', label: 'Simulador Financeiro', icon: Compass },
    ];

    return (
        <aside className="w-64 bg-slate-950/40 border-r border-slate-900/60 text-slate-400 flex flex-col h-screen fixed backdrop-blur-xl z-20">
            <div className="p-6 border-b border-slate-900/60 bg-slate-950/20">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative flex flex-col">
                        <h1 className="text-xl font-black text-white flex items-center gap-2">
                            HabitaData <span className="text-emerald-400 font-mono tracking-tight bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">DF</span>
                        </h1>
                        <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500 mt-1.5 font-bold font-mono">Discovery Engine v2.4</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                <div>
                    <p className="text-[9px] uppercase font-black text-slate-600 mb-3 ml-3 tracking-widest font-mono">Navegação</p>
                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                                            : 'hover:bg-slate-900/50 hover:text-slate-200 border border-transparent hover:border-slate-800/40 text-slate-400'
                                    }`}
                                >
                                    {/* Left active accent bar */}
                                    {isActive && (
                                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r shadow-[0_0_10px_rgba(16,185,129,1)]" />
                                    )}
                                    <item.icon size={16} className={`${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    {item.label}
                                    {isActive && <ChevronRight size={12} className="ml-auto animate-pulse" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* API Status and Engine Footer */}
            <div className="p-4 border-t border-slate-900/60 bg-slate-950/20 space-y-3">
                <div className="flex items-center justify-between px-2 text-[10px] font-bold font-mono">
                    <span className="text-slate-500 flex items-center gap-1.5 uppercase">
                        <Server size={10} /> API Server
                    </span>
                    {apiConnected === null ? (
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse"></span>
                            ...
                        </span>
                    ) : apiConnected ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                            <Wifi size={10} className="animate-pulse" />
                            <span className="uppercase">Online</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-rose-500">
                            <WifiOff size={10} />
                            <span className="uppercase">Offline</span>
                        </span>
                    )}
                </div>
                <div className="text-[9px] text-slate-600 text-center font-mono font-bold tracking-wider py-1 bg-slate-950/50 border border-slate-900 rounded-lg">
                    CORE ENGINE ACTIVE
                </div>
            </div>
        </aside>
    );
}
