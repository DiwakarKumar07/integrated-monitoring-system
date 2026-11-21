"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ServiceItem {
  name: string;
  category: "core" | "metrics" | "logs" | "tracing" | "exporters";
  description: string;
  port: string;
  link: string;
  accent: string;
  badge: string;
  icon: string;
  status: "active" | "standby";
}

interface WebProbeItem {
  name: string;
  url: string;
  method: string;
  expectedStatus: string;
  latency: string;
  category: "external" | "local";
  description: string;
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isLiveStreamPaused, setIsLiveStreamPaused] = useState(false);
  const [logs, setLogs] = useState<Array<{ id: number; time: string; level: string; msg: string; source: string }>>([]);

  // Time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " UTC"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulated live probe stream
  useEffect(() => {
    if (isLiveStreamPaused) return;

    const sampleLogs = [
      { level: "INFO", source: "blackbox", msg: "Probe https://www.google.com HTTP 200 OK (14.2ms)" },
      { level: "INFO", source: "blackbox", msg: "Probe https://github.com HTTP 200 OK (26.8ms)" },
      { level: "INFO", source: "blackbox", msg: "Probe https://www.cloudflare.com HTTP 200 OK (9.4ms)" },
      { level: "INFO", source: "prometheus", msg: "Scrape job 'node_exporter' successful (target: localhost:9100)" },
      { level: "INFO", source: "loki", msg: "Stream ingestion batch verified, 1.4k log lines committed" },
      { level: "INFO", source: "blackbox", msg: "Local endpoint probe http://localhost:3000 alive (1.1ms)" },
      { level: "DEBUG", source: "tempo", msg: "Trace span pipeline healthy, buffer usage: 12%" },
    ];

    const initial = sampleLogs.slice(0, 4).map((l, idx) => ({
      id: Date.now() + idx,
      time: new Date().toLocaleTimeString(),
      ...l,
    }));
    setLogs(initial);

    const logInterval = setInterval(() => {
      const randomLog = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
      setLogs((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          ...randomLog,
        },
        ...prev.slice(0, 7),
      ]);
    }, 3800);

    return () => clearInterval(logInterval);
  }, [isLiveStreamPaused]);

  // Dynamic URL configuration helper
  const getServiceUrl = (envVar: string, localhostUrl: string): string => {
    const val = typeof process !== "undefined" ? process.env[envVar] : undefined;
    return val && val.trim() !== "" ? val : localhostUrl;
  };

  const services: ServiceItem[] = [
    {
      name: "Grafana",
      category: "core",
      description: "Visual dashboards, query analysis, and alerting management",
      port: "3001",
      link: getServiceUrl("NEXT_PUBLIC_GRAFANA_URL", "http://localhost:3001"),
      accent: "from-blue-500/20 via-indigo-500/10 to-transparent",
      badge: "Dashboard UI",
      icon: "grafana",
      status: "active",
    },
    {
      name: "Prometheus",
      category: "metrics",
      description: "Time-series database, metrics scraper, and rule evaluator",
      port: "9090",
      link: getServiceUrl("NEXT_PUBLIC_PROMETHEUS_URL", "http://localhost:9090"),
      accent: "from-amber-500/20 via-orange-500/10 to-transparent",
      badge: "Metrics Engine",
      icon: "prometheus",
      status: "active",
    },
    {
      name: "Loki",
      category: "logs",
      description: "Horizontally scalable, multi-tenant log aggregation system",
      port: "3100",
      link: getServiceUrl("NEXT_PUBLIC_LOKI_URL", "http://localhost:3100"),
      accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
      badge: "Log Storage",
      icon: "loki",
      status: "active",
    },
    {
      name: "Tempo",
      category: "tracing",
      description: "High-volume distributed tracing engine compatible with Jaeger",
      port: "3200",
      link: getServiceUrl("NEXT_PUBLIC_TEMPO_URL", "http://localhost:3200"),
      accent: "from-purple-500/20 via-violet-500/10 to-transparent",
      badge: "Distributed Tracing",
      icon: "tempo",
      status: "active",
    },
    {
      name: "Alertmanager",
      category: "core",
      description: "Deduplication, grouping, and dispatching of system alerts",
      port: "9093",
      link: getServiceUrl("NEXT_PUBLIC_ALERTMANAGER_URL", "http://localhost:9093"),
      accent: "from-rose-500/20 via-pink-500/10 to-transparent",
      badge: "Alert Router",
      icon: "alertmanager",
      status: "active",
    },
    {
      name: "Promtail",
      category: "logs",
      description: "Log shipper agent targeting system logs and forwarding to Loki",
      port: "9080",
      link: "http://localhost:9080",
      accent: "from-cyan-500/20 via-teal-500/10 to-transparent",
      badge: "Log Shipper",
      icon: "promtail",
      status: "active",
    },
    {
      name: "Node Exporter",
      category: "exporters",
      description: "Hardware and OS metrics collector for Linux/Unix instances",
      port: "9100",
      link: "http://localhost:9100",
      accent: "from-yellow-500/20 via-amber-500/10 to-transparent",
      badge: "Host Telemetry",
      icon: "node_exporter",
      status: "active",
    },
    {
      name: "Blackbox Exporter",
      category: "exporters",
      description: "Endpoint probing over HTTP, HTTPS, DNS, TCP, and ICMP protocols",
      port: "9115",
      link: "http://localhost:9115",
      accent: "from-sky-500/20 via-blue-500/10 to-transparent",
      badge: "Probe Engine",
      icon: "blackbox",
      status: "active",
    },
  ];

  const webProbes: WebProbeItem[] = [
    {
      name: "Google Global Probe",
      url: "https://www.google.com",
      method: "HTTPS GET",
      expectedStatus: "200 OK",
      latency: "14ms",
      category: "external",
      description: "External DNS & latency reference check",
    },
    {
      name: "GitHub Edge",
      url: "https://github.com",
      method: "HTTPS GET",
      expectedStatus: "200 OK",
      latency: "28ms",
      category: "external",
      description: "Code repository & API gateway availability",
    },
    {
      name: "Cloudflare Anycast",
      url: "https://www.cloudflare.com",
      method: "HTTPS GET",
      expectedStatus: "200 OK",
      latency: "9ms",
      category: "external",
      description: "Edge CDN & global network health check",
    },
    {
      name: "Local Web App",
      url: "http://localhost:3000",
      method: "HTTP GET",
      expectedStatus: "200 OK",
      latency: "1.2ms",
      category: "local",
      description: "NexusPulse Next.js frontend application",
    },
    {
      name: "Local Service API",
      url: "http://localhost:8080",
      method: "HTTP GET",
      expectedStatus: "200 OK",
      latency: "1.8ms",
      category: "local",
      description: "Internal backend microservice & API proxy",
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.port.includes(searchQuery);

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "core") return matchesSearch && (s.category === "core" || s.category === "metrics");
    if (selectedFilter === "logs") return matchesSearch && (s.category === "logs" || s.category === "tracing");
    if (selectedFilter === "exporters") return matchesSearch && s.category === "exporters";
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 p-[1.5px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                NexusPulse
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Observability
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Unified Infrastructure & Telemetry Hub
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Badge */}
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden md:inline">Cluster Health:</span>
            <span>All Systems Normal</span>
          </div>

          {/* Clock Ticker */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{currentTime || "00:00:00 UTC"}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <div className="space-y-4 text-center sm:text-left sm:flex sm:items-end sm:justify-between border-b border-slate-800/60 pb-8">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Localhost Environment</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono">8 Active Services</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              System Observability & Monitoring
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Launch telemetry dashboards, inspect distributed traces, monitor cluster health, and verify probe endpoints in real-time.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2 justify-center sm:justify-end">
            <button
              onClick={() => {
                const sampleUrls = services.map(s => s.link).join("\n");
                copyToClipboard(sampleUrls);
              }}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copiedUrl ? "Copied All URLs!" : "Copy Endpoint List"}</span>
            </button>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-slate-950 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              <span>Open Main Grafana</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick KPI Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <span className="text-xs font-medium text-slate-400">Total Uptime</span>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-baseline space-x-2">
              <span>99.98%</span>
              <span className="text-[11px] font-semibold text-emerald-400">Healthy</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <span className="text-xs font-medium text-slate-400">Active Core Services</span>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1 flex items-baseline space-x-2">
              <span>8 / 8</span>
              <span className="text-[11px] font-semibold text-slate-400">Online</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <span className="text-xs font-medium text-slate-400">Average Probe Latency</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 flex items-baseline space-x-2">
              <span>13.8 ms</span>
              <span className="text-[11px] font-semibold text-emerald-500">Fast</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <span className="text-xs font-medium text-slate-400">Tracked Web Targets</span>
            <div className="text-xl sm:text-2xl font-bold text-purple-400 mt-1 flex items-baseline space-x-2">
              <span>5 Endpoints</span>
              <span className="text-[11px] font-semibold text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Category Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 overflow-x-auto text-xs">
            {[
              { id: "all", label: "All Services" },
              { id: "core", label: "Core & Metrics" },
              { id: "logs", label: "Logs & Tracing" },
              { id: "exporters", label: "Exporters & Probes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedFilter === tab.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or ports..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Services Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Telemetry & Infrastructure Services</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                {filteredServices.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-cyan-500/40 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.accent} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none`} />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all">
                          {service.icon === "grafana" && (
                            <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                            </svg>
                          )}
                          {service.icon === "prometheus" && (
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            </svg>
                          )}
                          {service.icon === "loki" && (
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          {service.icon === "tempo" && (
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                          {service.icon === "alertmanager" && (
                            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          )}
                          {service.icon === "promtail" && (
                            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          )}
                          {service.icon === "node_exporter" && (
                            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                          )}
                          {service.icon === "blackbox" && (
                            <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                            {service.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                            {service.badge}
                          </span>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800/90 text-cyan-400 border border-slate-700">
                        :{service.port}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-normal min-h-[36px]">
                      {service.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 mt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <button
                      onClick={() => copyToClipboard(service.link)}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                      title="Copy URL"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{copiedUrl === service.link ? "Copied" : "Copy"}</span>
                    </button>

                    <a
                      href={service.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold text-slate-200 transition-all group-hover:shadow-md"
                    >
                      <span>Launch</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Monitored Target Endpoints Section (Probes) */}
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Monitored Web Targets & Health Probes</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HTTP / TCP Probing
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target endpoints tracked via Blackbox Exporter & Prometheus (Localhost & standard test targets)
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>All Probes Passing (5/5)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {webProbes.map((probe) => (
              <div
                key={probe.name}
                className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-100 flex items-center space-x-1.5">
                        <span>{probe.name}</span>
                        {probe.category === "local" ? (
                          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-500/20 font-mono">
                            LOCAL
                          </span>
                        ) : (
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-500/20 font-mono">
                            WEB
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{probe.description}</p>
                    </div>
                    <span className="text-xs font-mono font-medium text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {probe.expectedStatus}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 break-all flex items-center justify-between">
                    <span className="truncate pr-2">{probe.url}</span>
                    <button
                      onClick={() => copyToClipboard(probe.url)}
                      className="text-slate-500 hover:text-cyan-400 flex-shrink-0"
                      title="Copy URL"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/40">
                  <span className="text-slate-400 text-[11px]">
                    Method: <span className="text-slate-300 font-mono">{probe.method}</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400">
                      Ping: <span className="text-emerald-400 font-mono font-semibold">{probe.latency}</span>
                    </span>
                    <a
                      href={probe.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center space-x-0.5 font-medium"
                    >
                      <span>Visit</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Logs Stream & Quick Command Reference */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-800/60">
          {/* Live Telemetry Feed (2 Cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-950/80 border border-slate-800/90 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-sm text-white font-mono">Live Telemetry & Scrape Stream</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsLiveStreamPaused(!isLiveStreamPaused)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 transition-colors"
                >
                  {isLiveStreamPaused ? "▶ Resume Stream" : "⏸ Pause Stream"}
                </button>
              </div>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 font-mono text-xs pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/50 flex items-start space-x-2 text-[11px] hover:bg-slate-900 transition-colors"
                >
                  <span className="text-slate-500 whitespace-nowrap">{log.time}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold whitespace-nowrap ${
                      log.level === "INFO"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {log.source}
                  </span>
                  <span className="text-slate-300 flex-1 break-words">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Docker Compose Quick Controls */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800/90 p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Local Stack Operations</span>
              </h3>
              <p className="text-xs text-slate-400">
                Quick commands to start or check your monitoring stack containers:
              </p>

              <div className="space-y-2">
                {[
                  { cmd: "docker compose up -d", label: "Start all services" },
                  { cmd: "docker compose ps", label: "Check container status" },
                  { cmd: "docker compose logs -f", label: "Follow live logs" },
                ].map((item) => (
                  <div
                    key={item.cmd}
                    onClick={() => copyToClipboard(item.cmd)}
                    className="group p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-xs text-cyan-300 group-hover:text-cyan-200">
                        {item.cmd}
                      </div>
                      <div className="text-[10px] text-slate-500">{item.label}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 transition-colors">
                      {copiedUrl === item.cmd ? "Copied!" : "Click to copy"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Stack: Docker Engine</span>
              <span className="text-emerald-400 font-semibold">Ready for deployment</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 px-4 sm:px-8 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="font-bold text-slate-200">NexusPulse</span>
            <span>&copy; {new Date().getFullYear()} Observability Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400 text-xs">
            <span className="hover:text-cyan-400 transition-colors">Metrics: Prometheus</span>
            <span className="hover:text-cyan-400 transition-colors">Visualization: Grafana</span>
            <span className="hover:text-cyan-400 transition-colors">Logs: Loki</span>
            <span className="hover:text-cyan-400 transition-colors">Tracing: Tempo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
