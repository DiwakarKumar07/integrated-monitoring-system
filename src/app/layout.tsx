import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusPulse | Unified Monitoring & Observability Dashboard",
  description: "Unified cloud & local infrastructure monitoring dashboard for Prometheus, Grafana, Loki, and Tempo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased dark bg-[#070b14] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
