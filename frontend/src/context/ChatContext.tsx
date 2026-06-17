'use client';

/**
 * frontend/src/context/ChatContext.tsx
 * =====================================
 * Contexto global do chatbot HabitaData AI.
 * Gerencia o histórico de mensagens, estado do painel e o pageContext atual.
 */

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { chatAPI } from '@/services/api';
import type { GlobalChatMessage, PageContext } from '@/types';

// ---------------------------------------------------------------------------
// Tipos do contexto
// ---------------------------------------------------------------------------

interface ChatContextType {
    /** Histórico completo da conversa */
    messages: GlobalChatMessage[];
    /** Se o painel do chatbot está aberto */
    isOpen: boolean;
    /** Se está aguardando resposta do backend */
    isLoading: boolean;
    /** Contexto da tela atual (atualizado por cada página) */
    pageContext: PageContext;
    /** Envia uma mensagem e recebe a resposta da IA */
    sendMessage: (text: string) => Promise<void>;
    /** Abre/fecha o painel do chatbot */
    toggleChat: () => void;
    /** Atualiza o contexto da tela (chamado por cada página via hook) */
    setPageContext: (ctx: PageContext) => void;
    /** Limpa o histórico da conversa */
    clearHistory: () => void;
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DEFAULT_PAGE_CONTEXT: PageContext = {
    route: '/',
    screenTitle: 'Dashboard Central',
};

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pageContext, setPageContextState] = useState<PageContext>(DEFAULT_PAGE_CONTEXT);

    const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

    const setPageContext = useCallback((ctx: PageContext) => {
        setPageContextState(ctx);
    }, []);

    const clearHistory = useCallback(() => {
        setMessages([]);
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        // Adiciona a mensagem do usuário imediatamente
        const userMessage: GlobalChatMessage = {
            id: generateId(),
            role: 'user',
            text: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Envia ao backend com o contexto da tela e histórico recente
            const historyPayload = messages.slice(-10).map(m => ({
                role: m.role,
                text: m.text,
            }));

            const response = await chatAPI.sendMessage(
                text.trim(),
                pageContext,
                historyPayload,
            );

            const aiMessage: GlobalChatMessage = {
                id: generateId(),
                role: 'ai',
                text: response.reply,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: GlobalChatMessage = {
                id: generateId(),
                role: 'ai',
                text: '❌ Não foi possível conectar ao servidor. Verifique se a API está rodando em `http://127.0.0.1:8000`.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages, pageContext]);

    return (
        <ChatContext.Provider value={{
            messages,
            isOpen,
            isLoading,
            pageContext,
            sendMessage,
            toggleChat,
            setPageContext,
            clearHistory,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hook público
// ---------------------------------------------------------------------------

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
