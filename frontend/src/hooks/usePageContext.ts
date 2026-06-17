'use client';

/**
 * frontend/src/hooks/usePageContext.ts
 * =====================================
 * Hook que cada página usa para registrar seu contexto no ChatContext global.
 * Isso garante que o chatbot saiba exatamente em qual tela o usuário está,
 * quais filtros estão ativos e quais dados estão selecionados.
 *
 * @example
 * // Em qualquer page.tsx:
 * usePageContext({
 *   route: '/properties',
 *   screenTitle: 'Detalhamento de Ativos',
 *   selectedData: selectedProperty,
 * });
 */

import { useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import type { PageContext } from '@/types';

export function usePageContext(ctx: PageContext) {
    const { setPageContext } = useChat();

    useEffect(() => {
        setPageContext(ctx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(ctx)]);
}
