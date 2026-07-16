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
}

export default function StatusCard({ id, name, hostname, status, cpu, ram, latency, onClick }: StatusCardProps) {
  const isOnline = status === "online";

  return (
    <div 
      onClick={() => onClick?.(id)}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isOnline ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
          )}>
            <Server size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Cloud Instance</p>
          </div>

        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
          isOnline ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        )}>
          {isOnline ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {status}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1"><Cpu size={12} /> CPU Usage</span>
            <span>{cpu}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", cpu > 80 ? "bg-red-500" : "bg-blue-500")}
              style={{ width: `${cpu}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1"><Activity size={12} /> RAM Usage</span>
            <span>{ram}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", ram > 80 ? "bg-red-500" : "bg-blue-500")}
              style={{ width: `${ram}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <span className="text-xs text-slate-500">Latency</span>
          <span className="text-sm font-medium text-slate-300">{latency} ms</span>
        </div>
      </div>
    </div>
  );
}
