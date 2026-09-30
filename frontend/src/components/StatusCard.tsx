import React from "react";
import { Server, Activity, Cpu, CheckCircle2, AlertTriangle, Radio, Layers } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatusCardProps {
  id: number;
  name: string;
  hostname: string;
  status: string;
  cpu: number;
  ram: number;
  latency: number;
  containerCount?: number;
  onClick?: (id: number) => void;
  theme?: "dark" | "light";
}

export default function StatusCard({
  id,
  name,
  hostname,
  status,
  cpu,
  ram,
  latency,
  containerCount = 0,
  onClick,
  theme = "dark"
}: StatusCardProps) {
  const isOnline = status === "online";
  const isLight = theme === "light";

  const getLatencyBadge = (ms: number) => {
    if (!isOnline) return { text: "Offline", class: isLight ? "bg-slate-200 text-slate-600 border-slate-300" : "bg-slate-800 text-slate-500" };
    if (ms < 35) return { text: `${ms.toFixed(1)}ms`, class: isLight ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (ms < 85) return { text: `${ms.toFixed(1)}ms`, class: isLight ? "bg-amber-100 text-amber-800 border-amber-300 font-bold" : "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    return { text: `${ms.toFixed(1)}ms`, class: isLight ? "bg-rose-100 text-rose-800 border-rose-300 font-bold" : "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  };

  const latencyBadge = getLatencyBadge(latency);

  return (
    <div 
      onClick={() => onClick?.(id)}
      className={cn(
        "group relative border rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm",
        isOnline ? "border-t-4 border-t-emerald-500" : "border-t-4 border-t-rose-500",
        isLight
          ? "bg-white border-slate-300/80 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500 text-slate-900"
          : "bg-gradient-to-b from-slate-900/90 to-slate-900/50 border-slate-800/80 backdrop-blur-md hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-500/5 text-slate-100",
        "active:scale-[0.99]"
      )}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm",
            isOnline 
              ? (isLight ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20" : "bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 border border-blue-500/20") 
              : (isLight ? "bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md shadow-rose-500/20" : "bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-400 border border-rose-500/20")
          )}>
            <Server size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={cn("font-bold text-base tracking-tight", isLight ? "text-slate-900" : "text-slate-100")}>
                {name}
              </h3>
            </div>
            <p className={cn("text-xs font-mono font-semibold tracking-tight", isLight ? "text-slate-500" : "text-slate-500")}>
              {hostname}
            </p>
          </div>
        </div>

        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all shadow-xs",
          isOnline 
            ? (isLight ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10") 
            : (isLight ? "bg-rose-100 text-rose-800 border-rose-300 shadow-sm" : "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-rose-500/10")
        )}>
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="capitalize">{status}</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12} />
              <span className="capitalize">{status}</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <div className={cn("flex justify-between text-xs font-semibold", isLight ? "text-slate-700" : "text-slate-400")}>
            <span className="flex items-center gap-1.5"><Cpu size={14} className={isLight ? "text-blue-600" : "text-cyan-500"} /> CPU Utilization</span>
            <span className={cn("font-mono font-bold text-sm", isLight ? "text-slate-900" : "text-slate-100")}>{cpu.toFixed(1)}%</span>
          </div>
          <div className={cn("h-2.5 w-full rounded-full overflow-hidden p-0.5 border", isLight ? "bg-slate-200/80 border-slate-300" : "bg-slate-950 border-slate-800")}>
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 shadow-sm",
                cpu > 85 ? "bg-gradient-to-r from-amber-500 to-rose-600" : cpu > 60 ? "bg-gradient-to-r from-blue-500 to-amber-500" : "bg-gradient-to-r from-blue-500 to-indigo-600"
              )}
              style={{ width: `${Math.min(100, Math.max(0, cpu))}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className={cn("flex justify-between text-xs font-semibold", isLight ? "text-slate-700" : "text-slate-400")}>
            <span className="flex items-center gap-1.5"><Activity size={14} className={isLight ? "text-purple-600" : "text-purple-500"} /> Memory Allocation</span>
            <span className={cn("font-mono font-bold text-sm", isLight ? "text-slate-900" : "text-slate-100")}>{ram.toFixed(1)}%</span>
          </div>
          <div className={cn("h-2.5 w-full rounded-full overflow-hidden p-0.5 border", isLight ? "bg-slate-200/80 border-slate-300" : "bg-slate-950 border-slate-800")}>
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 shadow-sm",
                ram > 85 ? "bg-gradient-to-r from-amber-500 to-rose-600" : ram > 60 ? "bg-gradient-to-r from-purple-500 to-indigo-600" : "bg-gradient-to-r from-indigo-500 to-purple-600"
              )}
              style={{ width: `${Math.min(100, Math.max(0, ram))}%` }}
            />
          </div>
        </div>

        <div className={cn("flex items-center justify-between pt-3.5 border-t text-xs", isLight ? "border-slate-200" : "border-slate-800/80")}>
          <div className="flex items-center gap-1.5">
            <Layers size={14} className={isLight ? "text-blue-600" : "text-blue-500"} />
            <span className={cn("font-bold", isLight ? "text-slate-800" : "text-slate-400")}>{containerCount} Microservice{containerCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio size={14} className={isLight ? "text-emerald-600" : "text-emerald-500"} />
            <span className={cn("px-2.5 py-0.5 rounded-md border text-[11px] font-mono font-extrabold shadow-xs", latencyBadge.class)}>
              {latencyBadge.text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
