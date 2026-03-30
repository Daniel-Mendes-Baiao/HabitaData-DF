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
"[project]/frontend/src/app/discovery/regional/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RegionalBenchmarking
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AnalyticsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/AnalyticsContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/services/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$school$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__School$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/school.js [app-client] (ecmascript) <export default as School>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tram$2d$front$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Train$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/tram-front.js [app-client] (ecmascript) <export default as Train>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/ruler.js [app-client] (ecmascript) <export default as Ruler>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
;
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const Plot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/frontend/node_modules/react-plotly.js/react-plotly.js [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/frontend/node_modules/react-plotly.js/react-plotly.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false,
    loading: ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-[500px] w-full bg-slate-900 animate-pulse rounded-3xl"
        }, void 0, false, {
            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
            lineNumber: 14,
            columnNumber: 20
        }, ("TURBOPACK compile-time value", void 0))
});
_c = Plot;
function RegionalBenchmarking() {
    _s();
    const { state, setAnoSelecionado } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AnalyticsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAnalytics"])();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedRegioes, setSelectedRegioes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RegionalBenchmarking.useEffect": ()=>{
            async function fetchData() {
                setLoading(true);
                try {
                    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["analysisAPI"].getRegionalComparison(state.anoSelecionado);
                    const fetchedData = res.data || [];
                    setData(fetchedData);
                    if (selectedRegioes.length === 0 && fetchedData.length > 0) {
                        setSelectedRegioes(fetchedData.slice(0, 2).map({
                            "RegionalBenchmarking.useEffect.fetchData": (d)=>d.nome_regiao
                        }["RegionalBenchmarking.useEffect.fetchData"]));
                    }
                } catch (err) {
                    console.error("Erro ao carregar comparativo regional", err);
                } finally{
                    setLoading(false);
                }
            }
            fetchData();
        }
    }["RegionalBenchmarking.useEffect"], [
        state.anoSelecionado
    ]);
    const radarData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RegionalBenchmarking.useMemo[radarData]": ()=>{
            if (!data.length) return [];
            return selectedRegioes.map({
                "RegionalBenchmarking.useMemo[radarData]": (regName, idx)=>{
                    const reg = data.find({
                        "RegionalBenchmarking.useMemo[radarData].reg": (d)=>d.nome_regiao === regName
                    }["RegionalBenchmarking.useMemo[radarData].reg"]);
                    if (!reg) return null;
                    return {
                        type: 'scatterpolar',
                        r: [
                            Math.min(100, (reg.cagr_pct + 10) * 5),
                            Math.max(0, (10 - reg.distancia_metro_km) * 10),
                            Math.min(100, reg.escolas_1km * 15),
                            Math.max(0, (1 - reg.indice_criminalidade / 100) * 100),
                            Math.min(100, reg.valor_medio_periodo / 20000)
                        ],
                        theta: [
                            'Retorno (CAGR)',
                            'Mobilidade',
                            'Educação',
                            'Segurança',
                            'Valorização'
                        ],
                        fill: 'toself',
                        name: regName,
                        line: {
                            color: idx === 0 ? '#10b981' : idx === 1 ? '#6366f1' : '#f59e0b'
                        }
                    };
                }
            }["RegionalBenchmarking.useMemo[radarData]"]).filter(Boolean);
        }
    }["RegionalBenchmarking.useMemo[radarData]"], [
        data,
        selectedRegioes
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center h-[80vh] gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "animate-spin text-emerald-500",
                    size: 48
                }, void 0, false, {
                    fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                    lineNumber: 67,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-slate-400 font-medium font-mono text-xs uppercase tracking-widest text-center px-4",
                    children: [
                        "Cruzando dados regionais para ",
                        state.anoSelecionado,
                        "..."
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                    lineNumber: 68,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
            lineNumber: 66,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-8 space-y-8 animate-in fade-in duration-700",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-white flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                        className: "text-emerald-500"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                        lineNumber: 78,
                                        columnNumber: 25
                                    }, this),
                                    " Benchmarking Regional"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                lineNumber: 77,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-400 mt-2",
                                children: [
                                    "Comparativo detalhado para o ano de ",
                                    state.anoSelecionado,
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                lineNumber: 80,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                        lineNumber: 76,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4 bg-slate-900/80 p-4 rounded-3xl border border-slate-800 shadow-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 px-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                        size: 16,
                                        className: "text-emerald-500"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                        lineNumber: 87,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap",
                                        children: "Ano:"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                        lineNumber: 88,
                                        columnNumber: 25
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
                                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                lineNumber: 95,
                                                columnNumber: 33
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                        lineNumber: 89,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                lineNumber: 86,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-8 w-px bg-slate-800 mx-2"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                lineNumber: 100,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: data.slice(0, 5).map((reg)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (selectedRegioes.includes(reg.nome_regiao)) {
                                                setSelectedRegioes(selectedRegioes.filter((r)=>r !== reg.nome_regiao));
                                            } else if (selectedRegioes.length < 3) {
                                                setSelectedRegioes([
                                                    ...selectedRegioes,
                                                    reg.nome_regiao
                                                ]);
                                            }
                                        },
                                        className: `px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all ${selectedRegioes.includes(reg.nome_regiao) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'}`,
                                        children: reg.nome_regiao
                                    }, reg.nome_regiao, false, {
                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                        lineNumber: 104,
                                        columnNumber: 29
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                lineNumber: 102,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                        lineNumber: 85,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                lineNumber: 75,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 xl:grid-cols-4 gap-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "xl:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl overflow-hidden min-h-[550px]",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Plot, {
                            data: radarData,
                            layout: {
                                polar: {
                                    radialaxis: {
                                        visible: true,
                                        range: [
                                            0,
                                            100
                                        ],
                                        gridcolor: '#1e293b',
                                        tickfont: {
                                            size: 10
                                        }
                                    },
                                    angularaxis: {
                                        gridcolor: '#1e293b',
                                        linecolor: '#1e293b',
                                        tickfont: {
                                            size: 10
                                        }
                                    },
                                    bgcolor: 'rgba(0,0,0,0)'
                                },
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                showlegend: true,
                                legend: {
                                    orientation: 'h',
                                    y: -0.15
                                },
                                margin: {
                                    t: 40,
                                    b: 40,
                                    l: 40,
                                    r: 40
                                },
                                template: {
                                    layout: {
                                        template: 'plotly_dark'
                                    }
                                },
                                autosize: true
                            },
                            config: {
                                responsive: true,
                                displayModeBar: false
                            },
                            style: {
                                width: '100%',
                                height: '500px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                            lineNumber: 127,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                        lineNumber: 126,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "xl:col-span-2 space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                children: selectedRegioes.map((regName, idx)=>{
                                    const reg = data.find((d)=>d.nome_regiao === regName);
                                    return reg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `p-6 rounded-[2rem] border animate-in slide-in-from-right duration-500 delay-${idx * 100} ${idx === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : idx === 1 ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-amber-500/5 border-amber-500/20'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between items-start mb-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-2xl font-black text-white",
                                                        children: regName
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                        lineNumber: 156,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `w-4 h-4 rounded-full ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-indigo-500' : 'bg-amber-500'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                        lineNumber: 157,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                lineNumber: 155,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-x-8 gap-y-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricItem, {
                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                            lineNumber: 161,
                                                            columnNumber: 59
                                                        }, void 0),
                                                        label: "Valor Médio",
                                                        value: `R$ ${(reg.valor_medio_periodo / 1000).toFixed(1)}k`
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                        lineNumber: 161,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricItem, {
                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                            lineNumber: 162,
                                                            columnNumber: 59
                                                        }, void 0),
                                                        label: "Retorno 5y (CAGR)",
                                                        value: `${reg.cagr_pct.toFixed(2)}%`,
                                                        color: reg.cagr_pct > 0 ? 'text-emerald-400' : 'text-red-400'
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                        lineNumber: 162,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricItem, {
                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                            lineNumber: 163,
                                                            columnNumber: 59
                                                        }, void 0),
                                                        label: "Preço / m²",
                                                        value: `R$ ${reg.valor_m2.toFixed(0)}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                        lineNumber: 163,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricItem, {
                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                            lineNumber: 164,
                                                            columnNumber: 59
                                                        }, void 0),
                                                        label: "Metragem Média",
                                                        value: `${reg.metragem.toFixed(0)} m²`
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                        lineNumber: 164,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricItem, {
                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                            lineNumber: 165,
                                                            columnNumber: 59
                                                        }, void 0),
                                                        label: "Segurança",
                                                        value: `${reg.indice_criminalidade.toFixed(0)}/100`
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                        lineNumber: 165,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricItem, {
                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tram$2d$front$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Train$3e$__["Train"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                            lineNumber: 166,
                                                            columnNumber: 59
                                                        }, void 0),
                                                        label: "Dist. Metrô",
                                                        value: `${reg.distancia_metro_km.toFixed(1)} km`
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                        lineNumber: 166,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricItem, {
                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$school$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__School$3e$__["School"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                            lineNumber: 167,
                                                            columnNumber: 59
                                                        }, void 0),
                                                        label: "Escolas (1km)",
                                                        value: `${reg.escolas_1km.toFixed(1)} un`
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                        lineNumber: 167,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                lineNumber: 160,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, regName, true, {
                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                        lineNumber: 153,
                                        columnNumber: 33
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                lineNumber: 149,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-sm font-bold text-white mb-4 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                size: 16,
                                                className: "text-emerald-500"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                                lineNumber: 176,
                                                columnNumber: 29
                                            }, this),
                                            " Resumo Comparativo (",
                                            state.anoSelecionado,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                        lineNumber: 175,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400 leading-relaxed italic",
                                        children: selectedRegioes.length > 1 ? `Snapshot de ${state.anoSelecionado}: Comparando ${selectedRegioes.join(' vs ')}. ${selectedRegioes[0]} apresenta ${data.find((d)=>d.nome_regiao === selectedRegioes[0])?.valor_m2 > data.find((d)=>d.nome_regiao === selectedRegioes[1])?.valor_m2 ? 'maior valor por m²' : 'melhor custo-benefício'}.` : "Selecione múltiplas regiões acima para uma análise comparativa detalhada."
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                        lineNumber: 178,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                                lineNumber: 174,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                        lineNumber: 148,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                lineNumber: 125,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
        lineNumber: 74,
        columnNumber: 9
    }, this);
}
_s(RegionalBenchmarking, "+IMHOwV5xYH5UEjmbU2HwBRD4DE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AnalyticsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAnalytics"]
    ];
});
_c1 = RegionalBenchmarking;
function MetricItem({ icon, label, value, color = "text-white" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 text-slate-500",
                children: [
                    icon,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] uppercase font-bold tracking-tight",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                        lineNumber: 199,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                lineNumber: 197,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `text-lg font-bold ${color}`,
                children: value
            }, void 0, false, {
                fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
                lineNumber: 201,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/app/discovery/regional/page.tsx",
        lineNumber: 196,
        columnNumber: 9
    }, this);
}
_c2 = MetricItem;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Plot");
__turbopack_context__.k.register(_c1, "RegionalBenchmarking");
__turbopack_context__.k.register(_c2, "MetricItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_src_9e5e23b5._.js.map