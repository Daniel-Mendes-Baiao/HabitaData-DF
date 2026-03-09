'use client';

import { useState, useMemo, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ColumnLayer, ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import Map from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAnalytics } from '@/context/AnalyticsContext';
import { geospatialAPI } from '@/services/api';
import { Loader2, Layers, Map as MapIcon, Calendar, TrendingUp, Shield, DollarSign } from 'lucide-react';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: -47.8828,
  latitude: -15.7942,
  zoom: 11,
  pitch: 45,
  bearing: 0
};

type MapMode = 'valuation' | 'crime' | 'infra' | 'mobility' | 'price';

export default function UrbanMap() {
  const { state, setAnoSelecionado } = useAnalytics();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<MapMode>('valuation');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await geospatialAPI.getRegions3D(state.anoSelecionado);
        setData(res || []);
      } catch (err) {
        console.error("Erro ao carregar dados do mapa", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [state.anoSelecionado]);

  const layers = useMemo(() => {
    if (data.length === 0) return [];

    const valuationLayer = new ColumnLayer({
      id: 'valuation-layer',
      data,
      diskResolution: 12,
      radius: 250,
      extruded: true,
      pickable: true,
      getPosition: (d: any) => [d.longitude, d.latitude],
      getFillColor: (d: any) => d.cagr_medio_pct > 5 ? [16, 185, 129, 200] : [244, 63, 94, 200],
      getElevation: (d: any) => Math.max(0, d.cagr_medio_pct * 100),
      visible: mode === 'valuation'
    });

    const priceLayer = new ColumnLayer({
      id: 'price-layer',
      data,
      radius: 300,
      extruded: true,
      pickable: true,
      getPosition: (d: any) => [d.longitude, d.latitude],
      getFillColor: [99, 102, 241, 200],
      getElevation: (d: any) => (d.valor_m2_medio || 0) * 0.1,
      visible: mode === 'price'
    });

    const infraLayer = new ScatterplotLayer({
      id: 'infra-layer',
      data,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: (d: any) => [d.longitude, d.latitude],
      getRadius: (d: any) => (d.score_infra || 0) * 10,
      getFillColor: [245, 158, 11, 200],
      visible: mode === 'infra'
    });

    const crimeLayer = new HeatmapLayer({
      id: 'crime-heatmap',
      data,
      getPosition: (d: any) => [d.longitude, d.latitude],
      getWeight: (d: any) => d.indice_criminalidade || 0,
      radiusPixels: 60,
      intensity: 1,
      threshold: 0.05,
      visible: mode === 'crime'
    });

    const mobilityLayer = new HeatmapLayer({
      id: 'mobility-heatmap',
      data,
      getPosition: (d: any) => [d.longitude, d.latitude],
      getWeight: (d: any) => (10 - (d.distancia_metro_km || 10)),
      radiusPixels: 40,
      visible: mode === 'mobility'
    });

    return [valuationLayer, priceLayer, infraLayer, crimeLayer, mobilityLayer];
  }, [data, mode]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest text-center px-4">Recuperando Snapshot de {state.anoSelecionado}...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 overflow-hidden relative animate-in fade-in duration-1000">
      <div className="absolute inset-0 w-full h-full">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          style={{ position: 'relative' }}
          layers={layers as any}
          getTooltip={({ object }: any) =>
            object && `Região: ${object.nome_regiao}\nRetorno (CAGR): ${object.cagr_medio_pct?.toFixed(2)}%\nInfra Score: ${object.score_infra?.toFixed(2)}\nDist. Metrô: ${object.distancia_metro_km?.toFixed(1)}km`
          }
        >
          <Map mapLib={maplibregl as any} mapStyle={MAP_STYLE} />
        </DeckGL>
      </div>

      <div className="absolute top-8 left-8 z-10 space-y-4">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-2 rounded-2xl flex flex-col gap-1 shadow-2xl">
          <ModeButton active={mode === 'valuation'} onClick={() => setMode('valuation')} icon={<TrendingUp size={16} />} label="Valorização (CAGR)" />
          <ModeButton active={mode === 'price'} onClick={() => setMode('price')} icon={<DollarSign size={16} />} label="Preço m²" />
          <ModeButton active={mode === 'infra'} onClick={() => setMode('infra')} icon={<Layers size={16} />} label="Infraestrutura" />
          <ModeButton active={mode === 'crime'} onClick={() => setMode('crime')} icon={<Shield size={16} />} label="Criminalidade" />
          <ModeButton active={mode === 'mobility'} onClick={() => setMode('mobility')} icon={<MapIcon size={16} />} label="Mobilidade" />
        </div>

        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center gap-4">
          <Calendar size={16} className="text-emerald-500" />
          <div className="flex items-center gap-3">
            <label className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Exibindo Ano:</label>
            <select
              value={state.anoSelecionado}
              onChange={(e) => setAnoSelecionado(Number(e.target.value))}
              className="bg-transparent text-sm text-white outline-none font-bold cursor-pointer hover:text-emerald-400 transition-colors"
            >
              {Array.from({ length: 16 }, (_, i) => 2010 + i).map(year => (
                <option key={year} value={year} className="bg-slate-900 text-white">{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${active
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
