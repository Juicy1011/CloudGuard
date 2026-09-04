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
        <div className={`flex items-center gap-2 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
          <Layers size={18} />
          <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            Discovered Microservices
          </h2>
        </div>
        {isServerOffline && (
          <span className={`text-xs px-2.5 py-1 rounded border ${
            isLight
              ? "text-rose-600 bg-rose-50 border-rose-200 font-medium"
              : "text-rose-400 bg-rose-950/20 border-rose-900/50"
          }`}>
            Actions Disabled: Server Offline
          </span>
        )}
      </div>

      {errorMessage && (
        <div className={`p-3 border rounded-lg text-sm flex items-center gap-2 ${
          isLight
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-red-950/30 border-red-900/50 text-red-400"
        }`}>
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {containers.length === 0 ? (
        <div className={`p-8 border border-dashed rounded-xl text-center text-slate-500 ${
          isLight ? "border-slate-300 bg-white" : "border-slate-700 bg-slate-900/20"
        }`}>
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
                className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${
                  isLight 
                    ? "bg-white border-slate-200 shadow-sm text-slate-800" 
                    : "bg-slate-900/50 border-slate-800 text-slate-100"
                } ${isServerOffline ? "opacity-75" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-md ${
                    isRunning 
                      ? (isLight ? "bg-blue-100 text-blue-600" : "bg-blue-500/10 text-blue-400") 
                      : (isLight ? "bg-red-100 text-red-600" : "bg-red-500/10 text-red-400")
                  }`}>
                    <Box size={20} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>{container.name}</h4>
                    <p className={`text-xs font-mono ${isLight ? "text-slate-400" : "text-slate-500"}`}>{container.image}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right min-w-[70px]">
                    <p className={`text-xs uppercase tracking-wider mb-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>CPU</p>
                    <p className={`text-sm font-semibold font-mono ${
                      container.cpu_percent > 10 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {container.cpu_percent.toFixed(1)}%
                    </p>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <p className={`text-xs uppercase tracking-wider mb-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Memory</p>
                    <p className={`text-sm font-semibold font-mono ${
                      container.memory_percent > 30 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {container.memory_percent.toFixed(1)}%
                    </p>
                  </div>

                  <div className="text-right min-w-[120px] hidden md:block">
                    <p className={`text-xs uppercase tracking-wider mb-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>Network Ports</p>
                    <p className={`text-sm font-mono truncate max-w-[120px] ${isLight ? "text-slate-600" : "text-slate-300"}`}>{container.ports || "N/A"}</p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium min-w-[120px] justify-center ${
                    isRunning 
                      ? (isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/10 text-emerald-400")
                      : (isLight ? "bg-rose-100 text-rose-700" : "bg-rose-500/10 text-rose-400")
                  }`}>
                    {isRunning ? <PlayCircle size={14} /> : <AlertTriangle size={14} />}
                    {container.status}
                  </div>

                  <div className={`flex items-center gap-2 border-l pl-4 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                    {isRunning ? (
                      <>
                        <button
                          onClick={() => handleAction(container.container_id, "restart")}
                          disabled={isServerOffline || isPending}
                          className={`p-1.5 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                            isLight
                              ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                          }`}
                          title="Restart Container"
                        >
                          {activeAction === "restart" ? (
                            <Loader2 size={14} className="animate-spin text-blue-500" />
                          ) : (
                            <RotateCw size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(container.container_id, "stop")}
                          disabled={isServerOffline || isPending}
                          className={`p-1.5 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                            isLight
                              ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
                              : "bg-red-950/20 border-red-900/50 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                          }`}
                          title="Stop Container"
                        >
                          {activeAction === "stop" ? (
                            <Loader2 size={14} className="animate-spin text-red-500" />
                          ) : (
                            <Square size={14} fill="currentColor" />
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAction(container.container_id, "start")}
                        disabled={isServerOffline || isPending}
                        className={`p-1.5 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                          isLight
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                            : "bg-emerald-950/20 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/30 hover:text-emerald-300"
                        }`}
                        title="Start Container"
                      >
                        {activeAction === "start" ? (
                          <Loader2 size={14} className="animate-spin text-emerald-500" />
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