import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HabitaData DF - Dashboard e Analytics",
  description: "Plataforma avançada de análise imobiliária e inteligência urbana.",
};

import { Sidebar } from "@/components/Sidebar";
import { GlobalChatbot } from "@/components/GlobalChatbot";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { ChatProvider } from "@/context/ChatContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-slate-950 text-slate-200 overflow-hidden">
        <ChatProvider>
          <AnalyticsProvider>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 ml-64 h-full overflow-y-auto bg-slate-950">
                {children}
              </main>
              <GlobalChatbot />
            </div>
          </AnalyticsProvider>
        </ChatProvider>
      </body>
    </html>
  );
}
