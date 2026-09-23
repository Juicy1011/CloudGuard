"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart2, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Download, 
  Cpu, 
  HardDrive, 
  ShieldCheck,
  Zap,
  Server,
  RefreshCw
} from "lucide-react";
import { fetchFleetTrend } from "@/lib/api";

interface AnalyticsViewProps {
  servers: any[];
  incidents: any[];
  theme?: "dark" | "light";
}

interface TrendPoint {
  label: string;
  latency: number;
  cpu: number;
  memory: number;
}

export default function AnalyticsView({ servers, incidents = [], theme = "dark" }: AnalyticsViewProps) {
  const isLight = theme === "light";
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);

  useEffect(() => {
    setTrendLoading(true);
    fetchFleetTrend(timeRange)
      .then((data) => {
        if (Array.isArray(data)) {
          setTrendData(data);
        } else {
          setTrendData([]);
        }
      })
      .catch(() => setTrendData([]))
      .finally(() => setTrendLoading(false));
  }, [timeRange]);

  const totalServers = servers.length;
  const onlineServers = servers.filter((s) => s.last_status === "online").length;
  const slaUptimePercent = totalServers > 0 ? ((onlineServers / totalServers) * 100).toFixed(2) : "100.00";
  const slaValue = parseFloat(slaUptimePercent);

  const avgLatency = totalServers > 0
    ? (
        servers.reduce((acc, s) => acc + (s.latest_health?.latency || 0), 0) / totalServers
      ).toFixed(1)
    : "0.0";

  const totalContainers = servers.reduce((acc, s) => acc + (s.container_count ?? s.containers?.length ?? s.container_logs?.length ?? 0), 0);

  const handleExportCSV = () => {
    if (servers.length === 0) return;

    const headers = ["Server Name", "Hostname", "Port", "Status", "Containers Count", "CPU %", "RAM %", "Latency (ms)", "Last Seen"];
    const rows = servers.map((s) => [
      `"${s.name}"`,
      `"${s.hostname}"`,
      s.port || 22,
      `"${s.last_status || "unknown"}"`,
      s.container_count ?? s.containers?.length ?? s.container_logs?.length ?? 0,
      s.latest_health?.cpu_percent ? s.latest_health.cpu_percent.toFixed(1) : "0.0",
      s.latest_health?.memory_percent ? s.latest_health.memory_percent.toFixed(1) : "0.0",
      s.latest_health?.latency ? s.latest_health.latency.toFixed(1) : "0.0",
      `"${s.last_seen ? new Date(s.last_seen).toISOString() : "N/A"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cloudguard-fleet-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (slaValue / 100) * circumference;

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-2">
            <BarChart2 size={13} /> Fleet Telemetry & SLA Intelligence
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            Analytics & Operations Report
          </h1>
          <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Real-time computed fleet performance metrics, ownership-scoped historical trends, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95 ${
              isLight
                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Download size={15} /> Export CSV Audit Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 border rounded-2xl transition-all duration-300 shadow-sm ${
          isLight ? "bg-white border-slate-200/80" : "bg-slate-900/60 border-slate-800/80 backdrop-blur-md"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              SLA Fleet Availability
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Live Computed
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className={`text-3xl font-black font-mono tracking-tight ${
                slaValue >= 99 ? "text-emerald-500" : slaValue >= 90 ? "text-amber-500" : "text-rose-500"
              }`}>
                {slaUptimePercent}%
              </p>
              <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {onlineServers} of {totalServers} host nodes online
              </p>
            </div>

            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="38" stroke={isLight ? "#e2e8f0" : "#1e293b"} strokeWidth="8" fill="transparent" />
                <circle
                  cx="45"
                  cy="45"
                  r="38"
                  stroke={slaValue >= 99 ? "#10b981" : slaValue >= 90 ? "#f59e0b" : "#f43f5e"}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <ShieldCheck size={18} className={`absolute ${slaValue >= 99 ? "text-emerald-500" : "text-amber-500"}`} />
            </div>
          </div>
        </div>

        <div className={`p-5 border rounded-2xl transition-all duration-300 shadow-sm ${
          isLight ? "bg-white border-slate-200/80" : "bg-slate-900/60 border-slate-800/80 backdrop-blur-md"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Avg Host Ping Latency
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Live Probed
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <p className={`text-3xl font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {avgLatency} <span className="text-sm font-normal text-slate-500">ms</span>
            </p>
            <div className={`p-2.5 rounded-xl ${isLight ? "bg-sky-50 text-sky-600" : "bg-sky-500/10 text-sky-400"}`}>
              <Activity size={18} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Aggregated across active fleet</p>
        </div>

        <div className={`p-5 border rounded-2xl transition-all duration-300 shadow-sm ${
          isLight ? "bg-white border-slate-200/80" : "bg-slate-900/60 border-slate-800/80 backdrop-blur-md"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Active Disruption Alerts
            </span>
            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
              incidents.length > 0 ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            }`}>
              Live State
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <p className={`text-3xl font-bold font-mono ${incidents.length > 0 ? "text-rose-500" : isLight ? "text-slate-900" : "text-white"}`}>
              {incidents.length} <span className="text-sm font-normal text-slate-500">events</span>
            </p>
            <div className={`p-2.5 rounded-xl ${
              incidents.length > 0 ? (isLight ? "bg-rose-50 text-rose-600" : "bg-rose-500/10 text-rose-400") : (isLight ? "bg-emerald-50 text-emerald-600" : "bg-emerald-500/10 text-emerald-400")
            }`}>
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Active host outages and exited containers</p>
        </div>
      </div>

      <div className={`p-6 border rounded-2xl transition-all duration-300 shadow-sm ${
        isLight ? "bg-white border-slate-200/80" : "bg-slate-900/60 border-slate-800/80 backdrop-blur-md"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              Fleet Resource & Latency History Trend
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Ownership-scoped telemetry history aggregated from PostgreSQL database health logs.
            </p>
          </div>

          <div className={`inline-flex p-1 rounded-xl border ${
            isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"
          }`}>
            {(["24h", "7d", "30d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === range
                    ? (isLight ? "bg-white text-blue-600 shadow-xs" : "bg-blue-600 text-white shadow-xs")
                    : (isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white")
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {trendLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
            <RefreshCw size={24} className="animate-spin text-blue-500" />
            <span>Loading live telemetry history...</span>
          </div>
        ) : trendData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm border border-dashed border-slate-700/50 rounded-xl p-6 text-center space-y-2">
            <Activity size={32} className="text-slate-600 mx-auto" />
            <p className={`font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
              Not Enough Telemetry History Yet
            </p>
            <p className="text-xs text-slate-500 max-w-md">
              Trend data accumulates automatically as the monitoring worker logs ping latency and CPU metrics over time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-60 w-full relative flex items-end pt-6">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-slate-500 w-full" />
                <div className="border-b border-slate-500 w-full" />
                <div className="border-b border-slate-500 w-full" />
                <div className="border-b border-slate-500 w-full" />
              </div>

              <div className="w-full h-full flex items-end justify-between gap-2 z-10">
                {trendData.map((pt, idx) => {
                  const maxVal = Math.max(...trendData.map(p => Math.max(p.latency, p.cpu, p.memory)), 100);
                  const latHeight = Math.min(100, Math.max(8, (pt.latency / maxVal) * 100));
                  const cpuHeight = Math.min(100, Math.max(8, (pt.cpu / maxVal) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div 
                          className="w-1.5 sm:w-3 bg-gradient-to-t from-sky-600 to-cyan-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125" 
                          style={{ height: `${latHeight}%` }} 
                        />
                        <div 
                          className="w-1.5 sm:w-3 bg-gradient-to-t from-indigo-600 to-blue-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125" 
                          style={{ height: `${cpuHeight}%` }} 
                        />
                      </div>

                      <span className={`text-[10px] font-mono mt-2 truncate max-w-full ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        {pt.label.includes("T") ? new Date(pt.label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : pt.label}
                      </span>

                      <div className={`absolute bottom-full mb-2 hidden group-hover:flex flex-col p-2.5 rounded-lg border text-xs z-20 shadow-xl pointer-events-none whitespace-nowrap ${
                        isLight ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-950 border-slate-700 text-slate-100"
                      }`}>
                        <span className="font-semibold text-slate-400 mb-1">{pt.label}</span>
                        <span className="text-sky-400">Latency: {pt.latency} ms</span>
                        <span className="text-blue-400">CPU Avg: {pt.cpu}%</span>
                        <span className="text-purple-400">RAM Avg: {pt.memory}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-800/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-cyan-500" />
                <span className={isLight ? "text-slate-600" : "text-slate-400"}>Latency (ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-blue-500" />
                <span className={isLight ? "text-slate-600" : "text-slate-400"}>CPU %</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-indigo-500" />
                <span className={isLight ? "text-slate-600" : "text-slate-400"}>Memory %</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-6 border rounded-2xl transition-all duration-300 shadow-sm ${
        isLight ? "bg-white border-slate-200/80" : "bg-slate-900/60 border-slate-800/80 backdrop-blur-md"
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
            Host Reliability & SLA Breakdown
          </h3>
          <span className={`text-xs font-mono px-3 py-1 rounded-md border ${
            isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-800 text-slate-400"
          }`}>
            Total Nodes: {totalServers}
          </span>
        </div>

        {servers.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-700/50 rounded-xl text-center text-slate-500">
            No host servers enrolled in this workspace inventory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                  isLight ? "border-slate-200 text-slate-400" : "border-slate-800 text-slate-500"
                }`}>
                  <th className="pb-3">Host Node</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Latency</th>
                  <th className="pb-3">SLA Status</th>
                  <th className="pb-3">Containers</th>
                  <th className="pb-3">Last Polled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {servers.map((s) => {
                  const isOnline = s.last_status === "online";
                  return (
                    <tr key={s.id} className={`transition-colors ${isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/30"}`}>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <Server size={18} className={isOnline ? "text-blue-500" : "text-rose-500"} />
                          <div>
                            <p className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>{s.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{s.hostname}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          isOnline
                            ? (isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")
                            : (isLight ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-rose-500/10 text-rose-400 border-rose-500/20")
                        }`}>
                          {isOnline ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          <span className="capitalize">{s.last_status || "unknown"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-xs">
                        {s.latest_health?.latency ? `${s.latest_health.latency.toFixed(1)} ms` : "0.0 ms"}
                      </td>
                      <td className="py-3.5">
                        <span className={`text-xs font-semibold ${isOnline ? "text-emerald-500" : "text-rose-500"}`}>
                          {isOnline ? "SLA Compliant (99.9%)" : "SLA Breach (Outage)"}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-xs">
                        {(s.containers?.length ?? s.container_logs?.length ?? 0)} microservices
                      </td>
                      <td className="py-3.5 text-xs text-slate-500 font-mono">
                        {s.last_seen ? new Date(s.last_seen).toLocaleTimeString() : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`p-6 border rounded-2xl transition-all duration-300 shadow-sm ${
        isLight ? "bg-white border-slate-200/80" : "bg-slate-900/60 border-slate-800/80 backdrop-blur-md"
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>
          Audit & Incident Event Logs
        </h3>

        {incidents.length === 0 ? (
          <div className={`p-8 border border-dashed rounded-xl text-center space-y-2 ${
            isLight ? "border-slate-200 text-slate-500" : "border-slate-800 text-slate-500"
          }`}>
            <CheckCircle2 size={28} className="text-emerald-500 mx-auto" />
            <p className={`font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
              No Active Incidents Recorded
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All monitored servers and microservice containers are operating normally with zero recorded outages.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div 
                key={inc.id}
                className={`p-4 border rounded-xl flex items-start justify-between gap-4 ${
                  inc.severity === "CRITICAL"
                    ? (isLight ? "bg-rose-50/60 border-rose-200" : "bg-rose-500/5 border-rose-500/20")
                    : (isLight ? "bg-amber-50/60 border-amber-200" : "bg-amber-500/5 border-amber-500/20")
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className={inc.severity === "CRITICAL" ? "text-rose-500 shrink-0 mt-0.5" : "text-amber-500 shrink-0 mt-0.5"} />
                  <div>
                    <h4 className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-slate-100"}`}>{inc.serverName}</h4>
                    <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{inc.message}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500 shrink-0">
                  {inc.timestamp ? new Date(inc.timestamp).toLocaleString() : "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
