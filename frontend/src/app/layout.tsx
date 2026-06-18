import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Sidebar } from "@/components/Sidebar";
import { GlobalChatbot } from "@/components/GlobalChatbot";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { ChatProvider } from "@/context/ChatContext";

// ---------------------------------------------------------------------------
// Fonte — Inter do Google Fonts (carregada via next/font para performance)
// ---------------------------------------------------------------------------

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

// ---------------------------------------------------------------------------
// Metadados SEO
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
    title: "HabitaData DF — Inteligência Imobiliária",
    description:
        "Plataforma analítica para o mercado imobiliário do Distrito Federal. " +
        "Explore valorização histórica, impacto urbano e simulações financeiras com dados reais.",
    keywords: ["imóveis", "Brasília", "DF", "valorização", "CAGR", "mercado imobiliário"],
};

// ---------------------------------------------------------------------------
// Layout raiz
// ---------------------------------------------------------------------------

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR" className={`dark ${inter.variable}`}>
            <body className="antialiased bg-slate-950 text-slate-200 font-sans overflow-hidden">
                <ChatProvider>
                    <AnalyticsProvider>
                        <div className="flex h-screen">
                            {/* Sidebar de navegação fixa à esquerda */}
                            <Sidebar />

                            {/* Conteúdo principal — scrollável */}
                            <main className="flex-1 ml-64 h-full overflow-y-auto bg-slate-950">
                                {children}
                            </main>

                            {/* Chatbot omnipresente — renderizado uma única vez no layout */}
                            <GlobalChatbot />
                        </div>
                    </AnalyticsProvider>
                </ChatProvider>
            </body>
        </html>
    );
}
