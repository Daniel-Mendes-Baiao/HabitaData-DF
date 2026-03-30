(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/src/services/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analysisAPI",
    ()=>analysisAPI,
    "default",
    ()=>__TURBOPACK__default__export__,
    "geospatialAPI",
    ()=>geospatialAPI,
    "marketAPI",
    ()=>marketAPI,
    "propertiesAPI",
    ()=>propertiesAPI,
    "regionsAPI",
    ()=>regionsAPI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});
const marketAPI = {
    getEvolution: async (regiao_id)=>{
        const res = await api.get('/market/evolution', {
            params: {
                regiao_id
            }
        });
        return res.data;
    },
    getGrowth: async (regiao_id)=>{
        const res = await api.get('/market/growth', {
            params: {
                regiao_id
            }
        });
        return res.data;
    },
    getPriceDistribution: async (ano = 2021)=>{
        const res = await api.get('/market/price_distribution', {
            params: {
                ano
            }
        });
        return res.data;
    }
};
const regionsAPI = {
    getRanking: async (ano = 2021)=>{
        const res = await api.get('/regions/ranking', {
            params: {
                ano
            }
        });
        return res.data;
    },
    getAveragePrice: async (ano = 2025)=>{
        const res = await api.get('/regions/average_price', {
            params: {
                ano
            }
        });
        return res.data;
    },
    getAppreciation: async (ano = 2021)=>{
        const res = await api.get('/regions/appreciation', {
            params: {
                ano
            }
        });
        return res.data;
    }
};
const propertiesAPI = {
    getDetails: async (imovel_id)=>{
        const res = await api.get(`/properties/${imovel_id}`);
        return res.data;
    },
    getTopAppreciated: async (limit = 10)=>{
        const res = await api.get('/properties/top/appreciated', {
            params: {
                limit
            }
        });
        return res.data;
    }
};
const geospatialAPI = {
    getRegions3D: async (ano = 2021)=>{
        const res = await api.get('/geospatial/map/regions3d', {
            params: {
                ano
            }
        });
        return res.data;
    },
    getInfrastructureImpact: async (ano = 2021)=>{
        const res = await api.get('/geospatial/urban_factors/infrastructure', {
            params: {
                ano
            }
        });
        return res.data;
    }
};
const analysisAPI = {
    getMultivariate: async (ano = 2021)=>{
        const res = await api.get('/analysis/multivariate', {
            params: {
                ano
            }
        });
        return res.data;
    },
    getCorrelationMatrix: async (ano = 2021)=>{
        const res = await api.get('/analysis/correlation-matrix', {
            params: {
                ano
            }
        });
        return res.data;
    },
    getFactorsImpact: async (ano = 2021)=>{
        const res = await api.get('/analysis/factors-impact', {
            params: {
                ano
            }
        });
        return res.data;
    },
    getRegionalComparison: async (ano = 2021)=>{
        const res = await api.get('/analysis/regional-comparison', {
            params: {
                ano
            }
        });
        return res.data;
    },
    getGrowthIndices: async (regioes)=>{
        const res = await api.get('/analysis/growth-indices', {
            params: {
                regioes
            }
        });
        return res.data;
    }
};
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UrbanMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$react$2f$dist$2f$esm$2f$deckgl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@deck.gl/react/dist/esm/deckgl.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$layers$2f$dist$2f$esm$2f$column$2d$layer$2f$column$2d$layer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ColumnLayer$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/@deck.gl/layers/dist/esm/column-layer/column-layer.js [app-client] (ecmascript) <export default as ColumnLayer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$layers$2f$dist$2f$esm$2f$scatterplot$2d$layer$2f$scatterplot$2d$layer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ScatterplotLayer$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/@deck.gl/layers/dist/esm/scatterplot-layer/scatterplot-layer.js [app-client] (ecmascript) <export default as ScatterplotLayer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$aggregation$2d$layers$2f$dist$2f$esm$2f$heatmap$2d$layer$2f$heatmap$2d$layer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeatmapLayer$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/@deck.gl/aggregation-layers/dist/esm/heatmap-layer/heatmap-layer.js [app-client] (ecmascript) <export default as HeatmapLayer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$map$2d$gl$2f$dist$2f$esm$2f$exports$2d$maplibre$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/react-map-gl/dist/esm/exports-maplibre.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/maplibre-gl/dist/maplibre-gl.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AnalyticsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/AnalyticsContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/services/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/map.js [app-client] (ecmascript) <export default as Map>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const INITIAL_VIEW_STATE = {
    longitude: -47.8828,
    latitude: -15.7942,
    zoom: 11,
    pitch: 45,
    bearing: 0
};
function UrbanMap() {
    _s();
    const { state, setAnoSelecionado } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AnalyticsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAnalytics"])();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('valuation');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UrbanMap.useEffect": ()=>{
            async function loadData() {
                setLoading(true);
                try {
                    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["geospatialAPI"].getRegions3D(state.anoSelecionado);
                    setData(res || []);
                } catch (err) {
                    console.error("Erro ao carregar dados do mapa", err);
                } finally{
                    setLoading(false);
                }
            }
            loadData();
        }
    }["UrbanMap.useEffect"], [
        state.anoSelecionado
    ]);
    const layers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "UrbanMap.useMemo[layers]": ()=>{
            if (data.length === 0) return [];
            const valuationLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$layers$2f$dist$2f$esm$2f$column$2d$layer$2f$column$2d$layer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ColumnLayer$3e$__["ColumnLayer"]({
                id: 'valuation-layer',
                data,
                diskResolution: 12,
                radius: 250,
                extruded: true,
                pickable: true,
                getPosition: {
                    "UrbanMap.useMemo[layers]": (d)=>[
                            d.longitude,
                            d.latitude
                        ]
                }["UrbanMap.useMemo[layers]"],
                getFillColor: {
                    "UrbanMap.useMemo[layers]": (d)=>d.cagr_medio_pct > 5 ? [
                            16,
                            185,
                            129,
                            200
                        ] : [
                            244,
                            63,
                            94,
                            200
                        ]
                }["UrbanMap.useMemo[layers]"],
                getElevation: {
                    "UrbanMap.useMemo[layers]": (d)=>Math.max(0, d.cagr_medio_pct * 100)
                }["UrbanMap.useMemo[layers]"],
                visible: mode === 'valuation'
            });
            const priceLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$layers$2f$dist$2f$esm$2f$column$2d$layer$2f$column$2d$layer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ColumnLayer$3e$__["ColumnLayer"]({
                id: 'price-layer',
                data,
                radius: 300,
                extruded: true,
                pickable: true,
                getPosition: {
                    "UrbanMap.useMemo[layers]": (d)=>[
                            d.longitude,
                            d.latitude
                        ]
                }["UrbanMap.useMemo[layers]"],
                getFillColor: [
                    99,
                    102,
                    241,
                    200
                ],
                getElevation: {
                    "UrbanMap.useMemo[layers]": (d)=>(d.valor_m2_medio || 0) * 0.1
                }["UrbanMap.useMemo[layers]"],
                visible: mode === 'price'
            });
            const infraLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$layers$2f$dist$2f$esm$2f$scatterplot$2d$layer$2f$scatterplot$2d$layer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ScatterplotLayer$3e$__["ScatterplotLayer"]({
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
                getPosition: {
                    "UrbanMap.useMemo[layers]": (d)=>[
                            d.longitude,
                            d.latitude
                        ]
                }["UrbanMap.useMemo[layers]"],
                getRadius: {
                    "UrbanMap.useMemo[layers]": (d)=>(d.score_infra || 0) * 10
                }["UrbanMap.useMemo[layers]"],
                getFillColor: [
                    245,
                    158,
                    11,
                    200
                ],
                visible: mode === 'infra'
            });
            const crimeLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$aggregation$2d$layers$2f$dist$2f$esm$2f$heatmap$2d$layer$2f$heatmap$2d$layer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeatmapLayer$3e$__["HeatmapLayer"]({
                id: 'crime-heatmap',
                data,
                getPosition: {
                    "UrbanMap.useMemo[layers]": (d)=>[
                            d.longitude,
                            d.latitude
                        ]
                }["UrbanMap.useMemo[layers]"],
                getWeight: {
                    "UrbanMap.useMemo[layers]": (d)=>d.indice_criminalidade || 0
                }["UrbanMap.useMemo[layers]"],
                radiusPixels: 60,
                intensity: 1,
                threshold: 0.05,
                visible: mode === 'crime'
            });
            const mobilityLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$aggregation$2d$layers$2f$dist$2f$esm$2f$heatmap$2d$layer$2f$heatmap$2d$layer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeatmapLayer$3e$__["HeatmapLayer"]({
                id: 'mobility-heatmap',
                data,
                getPosition: {
                    "UrbanMap.useMemo[layers]": (d)=>[
                            d.longitude,
                            d.latitude
                        ]
                }["UrbanMap.useMemo[layers]"],
                getWeight: {
                    "UrbanMap.useMemo[layers]": (d)=>10 - (d.distancia_metro_km || 10)
                }["UrbanMap.useMemo[layers]"],
                radiusPixels: 40,
                visible: mode === 'mobility'
            });
            return [
                valuationLayer,
                priceLayer,
                infraLayer,
                crimeLayer,
                mobilityLayer
            ];
        }
    }["UrbanMap.useMemo[layers]"], [
        data,
        mode
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center h-screen bg-slate-950 gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "animate-spin text-emerald-500",
                    size: 48
                }, void 0, false, {
                    fileName: "[project]/frontend/src/app/page.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-slate-400 font-medium font-mono text-xs uppercase tracking-widest text-center px-4",
                    children: [
                        "Recuperando Snapshot de ",
                        state.anoSelecionado,
                        "..."
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/app/page.tsx",
                    lineNumber: 119,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/src/app/page.tsx",
            lineNumber: 117,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-full min-h-screen bg-slate-950 overflow-hidden relative animate-in fade-in duration-1000",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 w-full h-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$deck$2e$gl$2f$react$2f$dist$2f$esm$2f$deckgl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    initialViewState: INITIAL_VIEW_STATE,
                    controller: true,
                    style: {
                        position: 'relative'
                    },
                    layers: layers,
                    getTooltip: ({ object })=>object && `Região: ${object.nome_regiao}\nRetorno (CAGR): ${object.cagr_medio_pct?.toFixed(2)}%\nInfra Score: ${object.score_infra?.toFixed(2)}\nDist. Metrô: ${object.distancia_metro_km?.toFixed(1)}km`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$map$2d$gl$2f$dist$2f$esm$2f$exports$2d$maplibre$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"], {
                        mapLib: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
                        mapStyle: MAP_STYLE
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/app/page.tsx",
                        lineNumber: 136,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/frontend/src/app/page.tsx",
                    lineNumber: 127,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/src/app/page.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-8 left-8 z-10 space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-2 rounded-2xl flex flex-col gap-1 shadow-2xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ModeButton, {
                                active: mode === 'valuation',
                                onClick: ()=>setMode('valuation'),
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/page.tsx",
                                    lineNumber: 142,
                                    columnNumber: 96
                                }, void 0),
                                label: "Valorização (CAGR)"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/page.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ModeButton, {
                                active: mode === 'price',
                                onClick: ()=>setMode('price'),
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/page.tsx",
                                    lineNumber: 143,
                                    columnNumber: 88
                                }, void 0),
                                label: "Preço m²"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/page.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ModeButton, {
                                active: mode === 'infra',
                                onClick: ()=>setMode('infra'),
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/page.tsx",
                                    lineNumber: 144,
                                    columnNumber: 88
                                }, void 0),
                                label: "Infraestrutura"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/page.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ModeButton, {
                                active: mode === 'crime',
                                onClick: ()=>setMode('crime'),
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/page.tsx",
                                    lineNumber: 145,
                                    columnNumber: 88
                                }, void 0),
                                label: "Criminalidade"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/page.tsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ModeButton, {
                                active: mode === 'mobility',
                                onClick: ()=>setMode('mobility'),
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/page.tsx",
                                    lineNumber: 146,
                                    columnNumber: 94
                                }, void 0),
                                label: "Mobilidade"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/page.tsx",
                                lineNumber: 146,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/app/page.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                size: 16,
                                className: "text-emerald-500"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/page.tsx",
                                lineNumber: 150,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap",
                                        children: "Exibindo Ano:"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/app/page.tsx",
                                        lineNumber: 152,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: state.anoSelecionado,
                                        onChange: (e)=>setAnoSelecionado(Number(e.target.value)),
                                        className: "bg-transparent text-sm text-white outline-none font-bold cursor-pointer hover:text-emerald-400 transition-colors",
                                        children: Array.from({
                                            length: 16
                                        }, (_, i)=>2010 + i).map((year)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: year,
                                                className: "bg-slate-900 text-white",
                                                children: year
                                            }, year, false, {
                                                fileName: "[project]/frontend/src/app/page.tsx",
                                                lineNumber: 159,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/app/page.tsx",
                                        lineNumber: 153,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/app/page.tsx",
                                lineNumber: 151,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/app/page.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/app/page.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/app/page.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
}
_s(UrbanMap, "CPFHCS3mJsYHpzbPhcIseEYmTjI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AnalyticsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAnalytics"]
    ];
});
_c = UrbanMap;
function ModeButton({ active, onClick, icon, label }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`,
        children: [
            icon,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/frontend/src/app/page.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/app/page.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
_c1 = ModeButton;
var _c, _c1;
__turbopack_context__.k.register(_c, "UrbanMap");
__turbopack_context__.k.register(_c1, "ModeButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_src_59f97812._.js.map