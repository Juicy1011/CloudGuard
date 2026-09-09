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
    if (!isOnline) return { text: "Offline", class: isLight ? "bg-slate-100 text-slate-400" : "bg-slate-800 text-slate-500" };
    if (ms < 35) return { text: `${ms.toFixed(1)}ms`, class: isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (ms < 85) return { text: `${ms.toFixed(1)}ms`, class: isLight ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    return { text: `${ms.toFixed(1)}ms`, class: isLight ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  };

  const latencyBadge = getLatencyBadge(latency);

  return (
    <div 
      onClick={() => onClick?.(id)}
      className={cn(
        "group relative border rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm",
        isOnline ? "border-t-4 border-t-emerald-500" : "border-t-4 border-t-rose-500",
        isLight
          ? "bg-white border-slate-200/80 hover:shadow-lg hover:border-blue-400/80 text-slate-800"
          : "bg-gradient-to-b from-slate-900/90 to-slate-900/50 border-slate-800/80 backdrop-blur-md hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-500/5 text-slate-100",
        "active:scale-[0.99]"
      )}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm",
            isOnline 
              ? (isLight ? "bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 border border-blue-200/60" : "bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 border border-blue-500/20") 
              : (isLight ? "bg-gradient-to-br from-rose-50 to-red-100 text-rose-600 border border-rose-200/60" : "bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-400 border border-rose-500/20")
          )}>
            <Server size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={cn("font-bold text-base tracking-tight", isLight ? "text-slate-900" : "text-slate-100")}>
                {name}
              </h3>
            </div>
            <p className={cn("text-xs font-mono tracking-tight", isLight ? "text-slate-400" : "text-slate-500")}>
              {hostname}
            </p>
          </div>
        </div>

        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-xs",
          isOnline 
            ? (isLight ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10") 
            : (isLight ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-rose-500/10")
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
          <div className={cn("flex justify-between text-xs font-medium", isLight ? "text-slate-600" : "text-slate-400")}>
            <span className="flex items-center gap-1.5"><Cpu size={13} className="text-cyan-500" /> CPU Utilization</span>
            <span className="font-mono font-semibold">{cpu.toFixed(1)}%</span>
          </div>
          <div className={cn("h-2 w-full rounded-full overflow-hidden p-0.5 border", isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800")}>
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 shadow-sm",
                cpu > 85 ? "bg-gradient-to-r from-amber-500 to-rose-500" : cpu > 60 ? "bg-gradient-to-r from-cyan-500 to-amber-500" : "bg-gradient-to-r from-sky-400 to-blue-600"
              )}
              style={{ width: `${Math.min(100, Math.max(0, cpu))}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className={cn("flex justify-between text-xs font-medium", isLight ? "text-slate-600" : "text-slate-400")}>
            <span className="flex items-center gap-1.5"><Activity size={13} className="text-purple-500" /> Memory Allocation</span>
            <span className="font-mono font-semibold">{ram.toFixed(1)}%</span>
          </div>
          <div className={cn("h-2 w-full rounded-full overflow-hidden p-0.5 border", isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800")}>
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 shadow-sm",
                ram > 85 ? "bg-gradient-to-r from-amber-500 to-rose-500" : ram > 60 ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gradient-to-r from-indigo-500 to-violet-600"
              )}
              style={{ width: `${Math.min(100, Math.max(0, ram))}%` }}
            />
          </div>
        </div>

        <div className={cn("flex items-center justify-between pt-3.5 border-t text-xs", isLight ? "border-slate-100" : "border-slate-800/80")}>
          <div className="flex items-center gap-1.5">
            <Layers size={13} className="text-blue-500" />
            <span className={cn("font-medium", isLight ? "text-slate-600" : "text-slate-400")}>{containerCount} Microservice{containerCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio size={13} className="text-emerald-500" />
            <span className={cn("px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold shadow-xs", latencyBadge.class)}>
              {latencyBadge.text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
