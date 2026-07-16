import React from "react";
import { Box, Layers, PlayCircle } from "lucide-react";

interface Container {
  container_id: string;
  name: string;
  image: string;
  status: string;
  ports: string;
  cpu_percent: number;
  memory_percent: number;
}

interface MicroservicesListProps {
  containers: Container[];
}

export default function MicroservicesList({ containers }: MicroservicesListProps) {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 text-slate-400 mb-4">
        <Layers size={18} />
        <h2 className="text-lg font-semibold text-slate-100">Discovered Microservices</h2>
      </div>
      
      {containers.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center text-slate-500">
          No containers discovered on this host.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {containers.map((container) => (
            <div 
              key={container.container_id}
              className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                  <Box size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-100">{container.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{container.image}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right min-w-[70px]">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">CPU</p>
                  <p className={`text-sm font-semibold font-mono ${
                    container.cpu_percent > 10 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {container.cpu_percent.toFixed(1)}%
                  </p>
                </div>

                <div className="text-right min-w-[70px]">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Memory</p>
                  <p className={`text-sm font-semibold font-mono ${
                    container.memory_percent > 30 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {container.memory_percent.toFixed(1)}%
                  </p>
                </div>

                <div className="text-right min-w-[120px] hidden md:block">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Network Ports</p>
                  <p className="text-sm text-slate-300 font-mono truncate max-w-[120px]">{container.ports || "N/A"}</p>
                </div>
                
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-md text-xs font-medium min-w-[100px] justify-center">
                  <PlayCircle size={14} />
                  {container.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
