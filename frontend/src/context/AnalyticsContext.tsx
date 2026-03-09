'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AnalyticsState {
    anoSelecionado: number;
    variableX: string;
    variableY: string;
    variableColor: string;
    variableSize: string;
}

interface AnalyticsContextType {
    state: AnalyticsState;
    setAnoSelecionado: (val: number) => void;
    setVariableX: (val: string) => void;
    setVariableY: (val: string) => void;
    setVariableColor: (val: string) => void;
    setVariableSize: (val: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AnalyticsState>({
        anoSelecionado: 2021,
        variableX: 'metragem',
        variableY: 'cagr_pct',
        variableColor: 'nome_regiao',
        variableSize: 'valor_medio_periodo',
    });

    const setAnoSelecionado = (val: number) => setState(s => ({ ...s, anoSelecionado: val }));
    const setVariableX = (val: string) => setState(s => ({ ...s, variableX: val }));
    const setVariableY = (val: string) => setState(s => ({ ...s, variableY: val }));
    const setVariableColor = (val: string) => setState(s => ({ ...s, variableColor: val }));
    const setVariableSize = (val: string) => setState(s => ({ ...s, variableSize: val }));

    return (
        <AnalyticsContext.Provider value={{
            state,
            setAnoSelecionado,
            setVariableX,
            setVariableY,
            setVariableColor,
            setVariableSize
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export function useAnalytics() {
    const context = useContext(AnalyticsContext);
    if (context === undefined) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
}
