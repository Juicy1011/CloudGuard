import React, { useState } from "react";
import { Box, Layers, PlayCircle, AlertTriangle, Play, Square, RotateCw, Loader2 } from "lucide-react";
import { manageContainer } from "../lib/api";

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
  serverId: number;
  serverStatus: string;
  containers: Container[];
  onActionComplete?: () => void;
  theme?: "dark" | "light";
}

export default function MicroservicesList({ serverId, serverStatus, containers, onActionComplete, theme = "dark" }: MicroservicesListProps) {
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: string | null }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isServerOffline = serverStatus !== "online";
  const isLight = theme === "light";

  const handleAction = async (containerId: string, action: "stop" | "start" | "restart") => {
    setLoadingMap((prev) => ({ ...prev, [containerId]: action }));
    setErrorMessage(null);
    try {
      await manageContainer(serverId, containerId, action);
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to perform action: ${action}`);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [containerId]: null }));
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Layers size={18} />
          <h2 className="text-lg font-semibold text-slate-100">Discovered Microservices</h2>
        </div>
        {isServerOffline && (
          <span className="text-xs text-rose-400 bg-rose-950/20 border border-rose-900/50 px-2.5 py-1 rounded">
            Actions Disabled: Server Offline
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {containers.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center text-slate-500">
          No containers discovered on this host.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {containers.map((container) => {
            const isRunning = container.status.toLowerCase().startsWith("up");
            const activeAction = loadingMap[container.container_id];
            const isPending = !!activeAction;

            return (
              <div 
                key={container.container_id}
                className={`bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center justify-between transition-opacity ${
                  isServerOffline ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-md ${
                    isRunning ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                  }`}>
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
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium min-w-[120px] justify-center ${
                    isRunning 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {isRunning ? <PlayCircle size={14} /> : <AlertTriangle size={14} />}
                    {container.status}
                  </div>

                  <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                    {isRunning ? (
                      <>
                        <button
                          onClick={() => handleAction(container.container_id, "restart")}
                          disabled={isServerOffline || isPending}
                          className="p-1.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-400 hover:text-white"
                          title="Restart Container"
                        >
                          {activeAction === "restart" ? (
                            <Loader2 size={14} className="animate-spin text-blue-400" />
                          ) : (
                            <RotateCw size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(container.container_id, "stop")}
                          disabled={isServerOffline || isPending}
                          className="p-1.5 rounded bg-red-950/20 border border-red-900/50 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-red-400 hover:text-red-300"
                          title="Stop Container"
                        >
                          {activeAction === "stop" ? (
                            <Loader2 size={14} className="animate-spin text-red-400" />
                          ) : (
                            <Square size={14} fill="currentColor" />
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAction(container.container_id, "start")}
                        disabled={isServerOffline || isPending}
                        className="p-1.5 rounded bg-emerald-950/20 border border-emerald-900/50 hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-emerald-400 hover:text-emerald-300"
                        title="Start Container"
                      >
                        {activeAction === "start" ? (
                          <Loader2 size={14} className="animate-spin text-emerald-400" />
                        ) : (
                          <Play size={14} fill="currentColor" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}