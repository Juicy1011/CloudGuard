"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import StatusCard from "@/components/StatusCard";
import MicroservicesList from "@/components/MicroservicesList";
import { fetchServers, fetchServerDetail, triggerChaos } from "@/lib/api";
import { ChevronLeft } from "lucide-react";

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
            
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">{selectedServer.name}</h1>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Secured Infrastructure Node</p>
            </header>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <StatusCard 
                  id={selectedServer.id}
                  name={selectedServer.name}
                  hostname={selectedServer.hostname}
                  status={selectedServer.last_status}
                  cpu={selectedServer.latest_health?.cpu_percent || 0}
                  ram={selectedServer.latest_health?.memory_percent || 0}
                  latency={selectedServer.latest_health?.latency || 0}
                />

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-2 text-slate-200">Chaos Control Center</h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Simulate real-time cloud failures and evaluate agentless auto-discovery reactions.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Healthy", value: null, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" },
                      { label: "Offline-Ping", value: "offline", color: "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" },
                      { label: "SSH Failure", value: "ssh_fail", color: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" },
                      { label: "Crashed Svc", value: "crash", color: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20" }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={async () => {
                          try {
                            const updated = await triggerChaos(selectedServer.id, opt.value);
                            setSelectedServer((prev: any) => ({ ...prev, status_override: updated.status_override }));
                            await loadData();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-bold uppercase tracking-tighter transition-all ${
                          selectedServer.status_override === opt.value
                            ? "ring-2 ring-blue-500 border-transparent bg-blue-500/20 text-blue-400"
                            : opt.color
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <MicroservicesList containers={selectedServer.containers} />
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



