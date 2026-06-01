import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HabitaData DF - Dashboard e Analytics",
  description: "Plataforma avançada de análise imobiliária e inteligência urbana.",
};

import { Sidebar } from "@/components/Sidebar";
import { AnalyticsProvider } from "@/context/AnalyticsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-slate-950 text-slate-200 overflow-hidden">
        <AnalyticsProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 h-full overflow-y-auto bg-slate-950">
              {children}
            </main>
          </div>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
