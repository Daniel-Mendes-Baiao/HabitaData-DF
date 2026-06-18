'use client';

/**
 * frontend/src/hooks/usePageContext.ts
 * =====================================
 * Hook que cada página usa para registrar seu contexto no ChatContext global.
 *
 * Garante que o chatbot saiba exatamente em qual tela o usuário está,
 * quais filtros estão ativos e quais dados estão selecionados — permitindo
 * respostas contextualizadas sem que o usuário precise repetir o contexto.
 *
 * @example
 * // Em qualquer page.tsx:
 * usePageContext({
 *   route: '/properties',
 *   screenTitle: 'Detalhamento de Ativos',
 *   activeFilters: { regiao: 'Águas Claras' },
 *   selectedData: selectedProperty,
 * });
 */

import { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import type { PageContext } from '@/types';

export function usePageContext(ctx: PageContext) {
    const { setPageContext } = useChat();
    // Usar ref para serialização evita re-renders infinitos sem eslint-disable
    const serialized = JSON.stringify(ctx);
    const prevRef = useRef<string>('');

    useEffect(() => {
        if (serialized !== prevRef.current) {
            prevRef.current = serialized;
            setPageContext(ctx);
        }
    // ctx muda a referência a cada render, então comparamos pelo valor serializado
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serialized]);
}
