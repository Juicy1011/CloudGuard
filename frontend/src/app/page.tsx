"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import StatusCard from "@/components/StatusCard";
import MicroservicesList from "@/components/MicroservicesList";
import { fetchServers, fetchServerDetail } from "@/lib/api";
import { ChevronLeft, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const serverList = await fetchServers();
      const detailedServers = await Promise.all(
        serverList.map((s: any) => fetchServerDetail(s.id))
      );
      setServers(detailedServers);
      
      if (selectedServer) {
        const updatedSelected = detailedServers.find(s => s.id === selectedServer.id);
        if (updatedSelected) setSelectedServer(updatedSelected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [selectedServer?.id]);

  const isUnreachable = selectedServer && selectedServer.last_status !== "online";

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {selectedServer ? (
          <div>
            <button 
              onClick={() => setSelectedServer(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft size={20} /> Back to Overview
            </button>
            
            <header className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">{selectedServer.name}</h1>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Secured Infrastructure Node</p>
            </header>

            {isUnreachable && (
              <div className="mb-8 flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <AlertCircle size={20} className="shrink-0" />
                <div>
                  <p className="font-bold text-sm uppercase tracking-tight">Infrastructure Connection Lost</p>
                  <p className="text-xs text-amber-400/70">Displaying last known metrics from the edge database. Telemetry will resume automatically upon reconnection.</p>
                </div>
              </div>
            )}


            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 ${isUnreachable ? 'opacity-50 grayscale contrast-75' : ''}`}>
              <StatusCard 
                id={selectedServer.id}
                name={selectedServer.name}
                hostname={selectedServer.hostname}
                status={selectedServer.last_status}
                cpu={selectedServer.latest_health?.cpu_percent || 0}
                ram={selectedServer.latest_health?.memory_percent || 0}
                latency={selectedServer.latest_health?.latency || 0}
              />
              
              <div className="lg:col-span-2">
                <MicroservicesList 
                  serverId={selectedServer.id}
                  serverStatus={selectedServer.last_status}
                  containers={selectedServer.containers} 
                  onActionComplete={loadData}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Infrastructure Overview</h1>
              <p className="text-slate-400">Monitoring real-time health of discovered host nodes.</p>
            </header>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-800/50 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server) => (
                  <StatusCard 
                    key={server.id} 
                    id={server.id}
                    name={server.name}
                    hostname={server.hostname}
                    status={server.last_status}
                    cpu={server.latest_health?.cpu_percent || 0}
                    ram={server.latest_health?.memory_percent || 0}
                    latency={server.latest_health?.latency || 0}
                    onClick={() => setSelectedServer(server)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
