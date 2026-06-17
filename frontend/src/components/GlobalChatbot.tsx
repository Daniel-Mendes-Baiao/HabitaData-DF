'use client';

/**
 * frontend/src/components/GlobalChatbot.tsx
 * ==========================================
 * Componente do chatbot omnipresente do HabitaData AI.
 * Renderizado uma única vez no layout raiz — disponível em TODAS as telas.
 */

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '@/context/ChatContext';
import { ChatChart } from '@/components/ChatChart';
import type { MessageSegment, GlobalChatMessage, ChatChartPayload } from '@/types';
import {
    Bot,
    X,
    Send,
    Trash2,
    MapPin,
    ChevronDown,
    Sparkles,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Parser de mensagens: texto puro + blocos ~~~chart
// ---------------------------------------------------------------------------

/**
 * Divide o texto de uma mensagem AI em segmentos alternados de
 * texto Markdown e payloads de gráfico.
 * Qualquer JSON inválido dentro de ~~~chart é tratado como texto (fallback seguro).
 */
function parseMessageSegments(text: string): MessageSegment[] {
    // Suporta ~~~chart\n{...}\n~~~ com ou sem \r
    const CHART_REGEX = /~~~chart\r?\n([\s\S]*?)\r?\n~~~/g;
    const segments: MessageSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = CHART_REGEX.exec(text)) !== null) {
        // Texto antes do bloco de gráfico
        if (match.index > lastIndex) {
            const before = text.slice(lastIndex, match.index).trim();
            if (before) segments.push({ type: 'text', content: before });
        }

        // Parsear o JSON do bloco ~~~chart
        try {
            const payload = JSON.parse(match[1]) as ChatChartPayload;
            // Validação mínima de schema
            if (payload.type && Array.isArray(payload.series)) {
                segments.push({ type: 'chart', payload });
            } else {
                segments.push({ type: 'text', content: match[0] });
            }
        } catch {
            // JSON inválido → exibir bloco como texto (não crasha)
            segments.push({ type: 'text', content: match[0] });
        }

        lastIndex = match.index + match[0].length;
    }

    // Texto após o último bloco
    if (lastIndex < text.length) {
        const remaining = text.slice(lastIndex).trim();
        if (remaining) segments.push({ type: 'text', content: remaining });
    }

    // Se nenhum segmento foi criado, retorna o texto inteiro
    if (segments.length === 0) {
        segments.push({ type: 'text', content: text });
    }

    return segments;
}

// ---------------------------------------------------------------------------
// Sub-componente de renderização de mensagem (texto + gráficos intercalados)
// ---------------------------------------------------------------------------

function MessageContent({ msg }: { msg: GlobalChatMessage }) {
    // Mensagens do usuário: apenas texto plano
    if (msg.role === 'user') {
        return <p>{msg.text}</p>;
    }

    const segments = parseMessageSegments(msg.text);

    return (
        <div className="space-y-2 w-full">
            {segments.map((seg, i) => {
                if (seg.type === 'chart') {
                    return <ChatChart key={i} payload={seg.payload} />;
                }
                if (!seg.content.trim()) return null;
                return (
                    <div
                        key={i}
                        className="prose prose-invert prose-xs max-w-none
                            prose-p:my-1.5 prose-p:text-slate-300
                            prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
                            prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1.5
                            prose-strong:text-emerald-300 prose-strong:font-bold
                            prose-ul:my-1.5 prose-li:my-0.5 prose-li:text-slate-300
                            prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1 prose-code:rounded
                        "
                    >
                        <ReactMarkdown>{seg.content}</ReactMarkdown>
                    </div>
                );
            })}
        </div>
    );
}

export function GlobalChatbot() {
    const { messages, isOpen, isLoading, pageContext, sendMessage, toggleChat, clearHistory } = useChat();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll ao final ao receber novas mensagens
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isLoading]);

    // Focar o input ao abrir o painel
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;
        const text = inputValue;
        setInputValue('');
        await sendMessage(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* ----------------------------------------------------------------
                Painel do Chatbot (slide-in da direita)
            ---------------------------------------------------------------- */}
            <div
                className={`fixed bottom-0 right-0 z-50 flex flex-col transition-all duration-500 ease-in-out ${
                    isOpen
                        ? 'w-[440px] h-[calc(100vh-0px)] opacity-100 translate-x-0'
                        : 'w-[440px] h-[calc(100vh-0px)] opacity-0 translate-x-full pointer-events-none'
                }`}
                style={{
                    background: 'rgba(2, 6, 23, 0.96)',
                    backdropFilter: 'blur(24px) saturate(140%)',
                    borderLeft: '1px solid rgba(16, 185, 129, 0.12)',
                    boxShadow: '-20px 0 80px rgba(0,0,0,0.6)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-900/80 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/25 flex items-center justify-center">
                                <Bot size={18} className="text-emerald-400" />
                            </div>
                            {/* Online indicator */}
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white tracking-tight">HabitaData AI</p>
                            <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">
                                Especialista DF
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                            <button
                                id="chatbot-clear-history"
                                onClick={clearHistory}
                                title="Limpar conversa"
                                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                        <button
                            id="chatbot-toggle-close"
                            onClick={toggleChat}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition-all duration-200"
                        >
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>

                {/* Context badge — tela atual */}
                <div className="px-5 py-2.5 border-b border-slate-900/40 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 border border-slate-800/50 rounded-lg">
                        <MapPin size={11} className="text-emerald-400 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-400 truncate font-mono">
                            {pageContext.screenTitle}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono shrink-0">
                            {pageContext.route}
                        </span>
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {/* Welcome message when empty */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-6 py-8 text-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Sparkles size={28} className="text-emerald-400" />
                                </div>
                            </div>
                            <div className="space-y-2 max-w-[280px]">
                                <p className="text-white font-black text-base tracking-tight">
                                    Como posso ajudar?
                                </p>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                    Sou especialista em dados imobiliários do DF. Pergunte sobre regiões, imóveis, valorização ou tendências de mercado.
                                </p>
                            </div>
                            {/* Suggested prompts */}
                            <div className="w-full space-y-2">
                                {getSuggestedPrompts(pageContext.route).map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(prompt)}
                                        className="w-full text-left px-4 py-2.5 text-xs text-slate-300 bg-slate-900/60 border border-slate-800/50 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-300 transition-all duration-200 font-medium"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Conversation messages */}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            {msg.role === 'ai' && (
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                                    <Bot size={13} className="text-emerald-400" />
                                </div>
                            )}

                            {/* Bubble */}
                            <div
                                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'max-w-[85%] bg-emerald-500/15 border border-emerald-500/20 text-slate-200 rounded-tr-sm'
                                        : 'w-full bg-slate-900/70 border border-slate-800/50 text-slate-300 rounded-tl-sm'
                                }`}
                            >
                                <MessageContent msg={msg} />
                                <p className="text-[9px] text-slate-600 mt-2 font-mono">
                                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                                <Bot size={13} className="text-emerald-400" />
                            </div>
                            <div className="bg-slate-900/70 border border-slate-800/50 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                                <span className="typing-dot w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                <span className="typing-dot w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                <span className="typing-dot w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-slate-900/80 shrink-0">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                id="chatbot-input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Pergunte sobre o mercado imobiliário do DF..."
                                disabled={isLoading}
                                rows={1}
                                className="w-full resize-none bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/40 focus:bg-slate-900/80 transition-all duration-200 custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ maxHeight: '120px', overflowY: 'auto' }}
                                onInput={(e) => {
                                    const el = e.target as HTMLTextAreaElement;
                                    el.style.height = 'auto';
                                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                                }}
                            />
                        </div>
                        <button
                            id="chatbot-send-button"
                            onClick={handleSend}
                            disabled={isLoading || !inputValue.trim()}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none shrink-0"
                        >
                            <Send size={15} />
                        </button>
                    </div>
                    <p className="text-[9px] text-slate-700 text-center mt-2 font-mono">
                        Enter para enviar • Shift+Enter para nova linha
                    </p>
                </div>
            </div>

            {/* ----------------------------------------------------------------
                Botão flutuante (FAB) — sempre visível
            ---------------------------------------------------------------- */}
            <button
                id="chatbot-fab-button"
                onClick={toggleChat}
                aria-label={isOpen ? 'Fechar HabitaData AI' : 'Abrir HabitaData AI'}
                className={`fixed bottom-6 right-6 z-50 group transition-all duration-500 ${
                    isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
                }`}
            >
                {/* Glow rings */}
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/30 blur-lg group-hover:blur-xl group-hover:bg-emerald-500/40 transition-all duration-300 animate-pulse" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 group-hover:border-emerald-500/60 transition-all duration-300" />

                {/* Button content */}
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex flex-col items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:scale-110 transition-all duration-300">
                    <Bot size={22} className="text-white" />
                    {/* Notification dot when there are messages */}
                    {messages.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 flex items-center justify-center">
                            <span className="text-[8px] font-black text-slate-950">
                                {messages.length > 9 ? '9+' : messages.length}
                            </span>
                        </span>
                    )}
                </div>

                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 pointer-events-none whitespace-nowrap">
                    <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white shadow-xl">
                        HabitaData AI
                        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-800" />
                    </div>
                </div>
            </button>

            {/* Backdrop semi-transparente quando o chat está aberto (mobile feel) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-500"
                    onClick={toggleChat}
                />
            )}
        </>
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSuggestedPrompts(route: string): string[] {
    const prompts: Record<string, string[]> = {
        '/': [
            'Quais são as regiões com maior CAGR atualmente?',
            'Como está o mercado imobiliário do DF em geral?',
            'Qual é a tendência de preços para os próximos anos?',
        ],
        '/analysis/regional': [
            'Qual região tem a melhor relação risco/retorno?',
            'Compare Lago Sul com Águas Claras em termos de valorização.',
            'Quais fatores urbanos mais impactam o preço na análise atual?',
        ],
        '/properties': [
            'Explique o CAGR do ativo selecionado.',
            'Quais ativos têm maior potencial de valorização?',
            'Como interpretar a valorização histórica deste imóvel?',
        ],
        '/simulator': [
            'Como interpretar os resultados do simulador?',
            'Qual o impacto da taxa Selic nos investimentos imobiliários?',
            'Compare rentabilidade imobiliária com renda fixa.',
        ],
        '/onboarding': [
            'Como usar o HabitaData para tomar decisões?',
            'O que significa CAGR no contexto imobiliário?',
            'Como são calculados os preços no sistema?',
        ],
    };

    return prompts[route] ?? prompts['/'];
}
