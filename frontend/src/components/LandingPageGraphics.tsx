"use client";

import React from "react";
import { Server, Cpu, Database, Activity, Shield, Cloud, Terminal, CheckCircle2, Zap } from "lucide-react";

export function CloudPipelineGraphic({ isLight }: { isLight: boolean }) {
  return (
    <div className={`relative w-full rounded-3xl p-6 sm:p-8 overflow-hidden border transition-all ${
      isLight 
        ? "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-indigo-900/50 shadow-2xl text-white" 
        : "bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-900 border-indigo-500/20 shadow-2xl text-white"
    }`}>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-400/20 text-blue-400">
            <Zap size={13} className="text-blue-400 animate-pulse" /> Agentless Telemetry Stream
          </div>
          <h4 className="text-2xl font-bold tracking-tight text-white">
            Real-Time Data Pipeline Architecture
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            High-frequency ICMP echo probes and SSH command pipelines stream raw CPU, RAM, disk, and Docker metrics directly into PostgreSQL without third-party agents.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-xs font-medium text-slate-200">5s Worker Loop</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-xs font-medium text-slate-200">AES-128 Fernet</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 relative flex justify-center items-center">
          <svg className="w-full h-auto max-h-[280px]" viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>

            <rect x="30" y="40" width="120" height="90" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
            <rect x="40" y="55" width="100" height="15" rx="4" fill="#1e293b" />
            <circle cx="52" cy="62.5" r="3" fill="#10b981" />
            <rect x="40" y="78" width="100" height="15" rx="4" fill="#1e293b" />
            <circle cx="52" cy="85.5" r="3" fill="#3b82f6" />
            <rect x="40" y="101" width="100" height="15" rx="4" fill="#1e293b" />
            <circle cx="52" cy="108.5" r="3" fill="#a855f7" />
            <text x="90" y="22" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="bold">Remote Hosts</text>

            <rect x="30" y="180" width="120" height="90" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
            <path d="M50 215 C65 200 85 200 100 215 C115 200 130 215 130 235 L50 235 Z" fill="#3b82f6" fillOpacity="0.2" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="90" y="260" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="bold">Cloud Instances</text>

            <path d="M150 85 C220 85, 230 160, 270 160" stroke="url(#pipeGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M150 225 C220 225, 230 160, 270 160" stroke="url(#pipeGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />

            <circle cx="200" cy="100" r="4" fill="#60a5fa">
              <animate attributeName="cx" values="150;270" dur="2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="85;160" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="210" r="4" fill="#c084fc">
              <animate attributeName="cx" values="150;270" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="225;160" dur="2.2s" repeatCount="indefinite" />
            </circle>

            <rect x="270" y="125" width="70" height="70" rx="16" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
            <circle cx="305" cy="160" r="18" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" />
            <path d="M298 160 L312 160 M305 153 L305 167" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <text x="305" y="212" fill="#a5b4fc" fontSize="10" textAnchor="middle" fontWeight="bold">SSH Engine</text>

            <path d="M340 160 L440 160" stroke="url(#pipeGrad)" strokeWidth="6" strokeLinecap="round" />
            <circle cx="390" cy="160" r="4" fill="#38bdf8">
              <animate attributeName="cx" values="340;440" dur="1.5s" repeatCount="indefinite" />
            </circle>

            <rect x="440" y="40" width="130" height="230" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <rect x="455" y="55" width="100" height="40" rx="8" fill="#1e293b" />
            <rect x="465" y="67" width="40" height="6" rx="3" fill="#3b82f6" />
            <rect x="465" y="78" width="65" height="5" rx="2.5" fill="#10b981" />
            
            <rect x="455" y="105" width="100" height="65" rx="8" fill="#1e293b" />
            <path d="M465 155 L480 135 L495 145 L515 120 L545 155" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
            
            <rect x="455" y="180" width="100" height="75" rx="8" fill="#1e293b" />
            <rect x="465" y="195" width="80" height="12" rx="4" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1" />
            <rect x="465" y="215" width="80" height="12" rx="4" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1" />
            <text x="505" y="290" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="bold">Live Dashboard</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function CloudVectorTopologyGraphic({ isLight }: { isLight: boolean }) {
  return (
    <div className={`relative w-full rounded-3xl p-6 sm:p-8 overflow-hidden border transition-all ${
      isLight 
        ? "bg-slate-50/80 border-slate-200/80 shadow-md" 
        : "bg-slate-900/50 border-slate-800/80 backdrop-blur-md shadow-lg"
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-2">
            <Shield size={13} /> Network Topology
          </div>
          <h4 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
            Unified Node Connectivity Matrix
          </h4>
        </div>
        <span className={`text-xs font-mono px-3 py-1.5 rounded-lg border ${
          isLight ? "bg-white border-slate-200 text-slate-600" : "bg-slate-950 border-slate-800 text-slate-400"
        }`}>
          Protocol: ICMP + SSH (Port 22)
        </span>
      </div>

      <div className="w-full overflow-hidden flex justify-center py-4">
        <svg className="w-full max-w-[700px] h-auto" viewBox="0 0 700 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M120 70 L350 120 M120 170 L350 120 M580 70 L350 120 M580 170 L350 120" 
            stroke={isLight ? "#cbd5e1" : "#334155"} strokeWidth="2" strokeDasharray="6 6" />

          <circle cx="350" cy="120" r="45" fill={isLight ? "#eff6ff" : "#1e1b4b"} stroke="#3b82f6" strokeWidth="2.5" />
          <path d="M335 115 C342 105 358 105 365 115 C372 105 382 115 378 130 L322 130 C318 115 328 105 335 115 Z" 
            fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
          <text x="350" y="180" fill={isLight ? "#334155" : "#cbd5e1"} fontSize="11" textAnchor="middle" fontWeight="bold">CloudGuard Monitoring Hub</text>

          <g transform="translate(60, 45)">
            <rect x="0" y="0" width="90" height="50" rx="10" fill={isLight ? "#ffffff" : "#0f172a"} stroke={isLight ? "#cbd5e1" : "#1e293b"} strokeWidth="2" />
            <rect x="12" y="12" width="66" height="26" rx="4" fill={isLight ? "#f1f5f9" : "#1e293b"} />
            <circle cx="22" cy="25" r="3" fill="#10b981" />
            <text x="45" y="110" fill={isLight ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="middle" fontWeight="semibold">Workstation A</text>
          </g>

          <g transform="translate(60, 145)">
            <rect x="0" y="0" width="90" height="50" rx="10" fill={isLight ? "#ffffff" : "#0f172a"} stroke={isLight ? "#cbd5e1" : "#1e293b"} strokeWidth="2" />
            <rect x="15" y="10" width="60" height="10" rx="3" fill="#3b82f6" fillOpacity="0.3" />
            <rect x="15" y="25" width="60" height="10" rx="3" fill="#a855f7" fillOpacity="0.3" />
            <text x="45" y="110" fill={isLight ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="middle" fontWeight="semibold">Database Node</text>
          </g>

          <g transform="translate(550, 45)">
            <rect x="0" y="0" width="90" height="50" rx="10" fill={isLight ? "#ffffff" : "#0f172a"} stroke={isLight ? "#cbd5e1" : "#1e293b"} strokeWidth="2" />
            <rect x="12" y="12" width="66" height="26" rx="4" fill={isLight ? "#f1f5f9" : "#1e293b"} />
            <circle cx="22" cy="25" r="3" fill="#3b82f6" />
            <text x="45" y="110" fill={isLight ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="middle" fontWeight="semibold">App Instance</text>
          </g>

          <g transform="translate(550, 145)">
            <rect x="0" y="0" width="90" height="50" rx="10" fill={isLight ? "#ffffff" : "#0f172a"} stroke={isLight ? "#cbd5e1" : "#1e293b"} strokeWidth="2" />
            <rect x="15" y="10" width="60" height="10" rx="3" fill="#10b981" fillOpacity="0.3" />
            <rect x="15" y="25" width="60" height="10" rx="3" fill="#f59e0b" fillOpacity="0.3" />
            <text x="45" y="110" fill={isLight ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="middle" fontWeight="semibold">Cache Cluster</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
