'use client';

/**
 * frontend/src/components/ChatChart.tsx
 * ======================================
 * Renderiza um gráfico Plotly interativo dentro do painel do chatbot,
 * convertendo o ChatChartPayload (schema da IA) para dados Plotly nativos.
 */

import dynamic from 'next/dynamic';
import { BarChart3, TrendingUp, PieChart, ScatterChart, BarChart } from 'lucide-react';
import type { ChatChartPayload } from '@/types';

// Importação dinâmica — padrão do projeto (evita SSR com Plotly)
const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
    loading: () => (
        <div className="h-[220px] w-full bg-slate-900/40 animate-pulse rounded-2xl flex items-center justify-center">
            <div className="text-slate-600 text-xs font-mono">Carregando gráfico...</div>
        </div>
    ),
});

// ---------------------------------------------------------------------------
// Conversão do schema da IA → dados Plotly
// ---------------------------------------------------------------------------

function buildPlotlyData(payload: ChatChartPayload): Plotly.Data[] {
    const { type, series } = payload;

    if (type === 'pie') {
        // Pie usa apenas a primeira série
        const s = series[0];
        if (!s) return [];
        return [{
            type: 'pie',
            labels: s.x,
            values: s.y,
            name: s.name,
            marker: {
                colors: series.map((ser, i) =>
                    ser.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]
                ),
            },
            textinfo: 'label+percent',
            textfont: { color: '#94a3b8', size: 10 },
            hole: 0.35,   // Donut style
        } as Plotly.Data];
    }

    return series.map((s, i): Plotly.Data => {
        const color = s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];

        if (type === 'line') {
            return {
                type: 'scatter',
                mode: 'lines+markers',
                x: s.x,
                y: s.y,
                name: s.name,
                line: { color, width: 2.5, shape: 'spline' },
                marker: { color: '#ffffff', size: 5, line: { color, width: 1.5 } },
            };
        }

        if (type === 'scatter') {
            return {
                type: 'scatter',
                mode: 'markers',
                x: s.x,
                y: s.y,
                name: s.name,
                marker: { color, size: 8, opacity: 0.75 },
            };
        }

        // bar (default)
        return {
            type: 'bar',
            x: s.x,
            y: s.y,
            name: s.name,
            marker: {
                color,
                opacity: 0.85,
                line: { color, width: 0 },
            },
        };
    });
}

function buildPlotlyLayout(payload: ChatChartPayload): Partial<Plotly.Layout> {
    const base: Partial<Plotly.Layout> = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Inter, Arial, sans-serif', color: '#94a3b8', size: 10 },
        margin: { t: 8, b: payload.xAxisTitle ? 44 : 32, l: 44, r: 8 },
        autosize: true,
        showlegend: payload.series.length > 1,
        legend: {
            orientation: 'h',
            y: -0.25,
            font: { color: '#64748b', size: 9 },
        },
        hovermode: 'closest',
    };

    if (payload.type !== 'pie') {
        base.xaxis = {
            gridcolor: 'rgba(30,41,59,0.6)',
            zeroline: false,
            tickfont: { color: '#64748b', size: 9 },
            title: payload.xAxisTitle
                ? { text: payload.xAxisTitle, font: { color: '#64748b', size: 9 } }
                : undefined,
        };
        base.yaxis = {
            gridcolor: 'rgba(30,41,59,0.6)',
            zeroline: false,
            tickfont: { color: '#64748b', size: 9 },
            title: payload.yAxisTitle
                ? { text: payload.yAxisTitle, font: { color: '#64748b', size: 9 } }
                : undefined,
        };
        if (payload.type === 'bar') {
            base.bargap = 0.28;
        }
    }

    return base;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_COLORS = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
];

const CHART_TYPE_LABELS: Record<ChatChartPayload['type'], string> = {
    bar: 'BARRAS',
    line: 'LINHAS',
    scatter: 'DISPERSÃO',
    pie: 'PIZZA',
};

const CHART_TYPE_ICONS: Record<ChatChartPayload['type'], React.ReactNode> = {
    bar: <BarChart3 size={11} />,
    line: <TrendingUp size={11} />,
    scatter: <ScatterChart size={11} />,
    pie: <PieChart size={11} />,
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

interface ChatChartProps {
    payload: ChatChartPayload;
}

export function ChatChart({ payload }: ChatChartProps) {
    const plotData = buildPlotlyData(payload);
    const plotLayout = buildPlotlyLayout(payload);
    const chartHeight = payload.type === 'pie' ? 200 : 220;

    if (!plotData.length) {
        return (
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl text-xs text-slate-500 font-mono">
                ⚠ Dados insuficientes para renderizar o gráfico.
            </div>
        );
    }

    return (
        <div className="w-full rounded-2xl overflow-hidden border border-slate-800/50 bg-slate-950/50 mt-2 mb-1">
            {/* Chart header */}
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                <p className="text-[11px] font-bold text-slate-300 tracking-tight leading-tight max-w-[85%]">
                    {payload.title}
                </p>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/15 rounded text-emerald-400 font-mono shrink-0">
                    {CHART_TYPE_ICONS[payload.type]}
                    <span className="text-[8px] font-black tracking-widest">
                        {CHART_TYPE_LABELS[payload.type]}
                    </span>
                </div>
            </div>

            {/* Plotly chart */}
            <Plot
                data={plotData}
                layout={plotLayout}
                config={{
                    responsive: true,
                    displayModeBar: false,
                    scrollZoom: false,
                }}
                style={{ width: '100%', height: `${chartHeight}px` }}
                useResizeHandler
            />
        </div>
    );
}
