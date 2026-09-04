import React from "react";
import { Server, Activity, Cpu, HardDrive, CheckCircle, XCircle } from "lucide-react";
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
  onClick?: (id: number) => void;
  theme?: "dark" | "light";
}

export default function StatusCard({ id, name, hostname, status, cpu, ram, latency, onClick, theme = "dark" }: StatusCardProps) {
  const isOnline = status === "online";
  const isLight = theme === "light";

  return (
    <div 
      onClick={() => onClick?.(id)}
      className={`border rounded-xl p-6 transition-all duration-200 cursor-pointer ${
        isLight 
          ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 text-slate-800" 
          : "bg-slate-800/50 border-slate-700 hover:border-blue-500/50 text-slate-100"
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isOnline 
              ? (isLight ? "bg-blue-100 text-blue-600" : "bg-blue-500/10 text-blue-400")
              : (isLight ? "bg-red-100 text-red-600" : "bg-red-500/10 text-red-400")
          )}>
            <Server size={20} />
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${isLight ? "text-slate-900" : "text-slate-100"}`}>{name}</h3>
            <p className={`text-xs font-medium uppercase tracking-wider ${isLight ? "text-slate-400" : "text-slate-500"}`}>Cloud Instance</p>
          </div>

        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
          isOnline 
            ? (isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/10 text-emerald-400") 
            : (isLight ? "bg-red-100 text-red-700" : "bg-red-500/10 text-red-400")
        )}>
          {isOnline ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {status}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className={`flex justify-between text-xs mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            <span className="flex items-center gap-1"><Cpu size={12} /> CPU Usage</span>
            <span>{cpu}%</span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? "bg-slate-100" : "bg-slate-700"}`}>
            <div 
              className={cn("h-full transition-all", cpu > 80 ? "bg-red-500" : "bg-blue-500")}
              style={{ width: `${cpu}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className={`flex justify-between text-xs mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            <span className="flex items-center gap-1"><Activity size={12} /> RAM Usage</span>
            <span>{ram}%</span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? "bg-slate-100" : "bg-slate-700"}`}>
            <div 
              className={cn("h-full transition-all", ram > 80 ? "bg-red-500" : "bg-blue-500")}
              style={{ width: `${ram}%` }}
            />
          </div>
        </div>

        <div className={`flex items-center justify-between pt-4 border-t ${isLight ? "border-slate-100 text-slate-600" : "border-slate-700/50 text-slate-300"}`}>
          <span className={`text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>Latency</span>
          <span className="text-sm font-medium">{latency} ms</span>
        </div>
      </div>
    </div>
  );
}
