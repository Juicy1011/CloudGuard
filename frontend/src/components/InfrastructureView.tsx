"use client";

import React, { useState } from "react";
import { Server, Trash2, Plus, AlertCircle, CheckCircle, ShieldAlert, Eye, EyeOff, Zap, WifiOff, KeyRound, RotateCw, Loader2 } from "lucide-react";
import { createServer, deleteServer, triggerChaos } from "@/lib/api";

interface InfrastructureViewProps {
  servers: any[];
  onRefresh: () => void;
  theme?: "dark" | "light";
}

export default function InfrastructureView({ servers, onRefresh, theme = "dark" }: InfrastructureViewProps) {
  const isLight = theme === "light";
  const [name, setName] = useState("");
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState("root");
  const [authType, setAuthType] = useState<"password" | "key">("password");
  const [password, setPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [serverToDelete, setServerToDelete] = useState<{ id: number; name: string; hostname?: string } | null>(null);
  const [chaosLoadingId, setChaosLoadingId] = useState<string | null>(null);
  
  const [visibleHostnames, setVisibleHostnames] = useState<Set<number>>(new Set());

  const totalServers = servers.length;
  const onlineServers = servers.filter(s => s.last_status === "online").length;
  const offlineServers = totalServers - onlineServers;

  const toggleHostnameVisibility = (id: number) => {
    const next = new Set(visibleHostnames);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setVisibleHostnames(next);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!name || !hostname || !username) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        name,
        hostname,
        port: Number(port),
        username,
      };

      if (authType === "password") {
        payload.password = password || undefined;
      } else {
        payload.private_key = privateKey || undefined;
      }

      await createServer(payload);
      setSuccess(`Server "${name}" enrolled successfully!`);
      
      setName("");
      setHostname("");
      setPort(22);
      setUsername("root");
      setPassword("");
      setPrivateKey("");
      
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to enroll server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serverId: number, serverName: string) => {
    setDeletingId(serverId);
    setError(null);
    setSuccess(null);

    try {
      await deleteServer(serverId);
      setSuccess(`Server "${serverName}" deleted successfully.`);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete server");
    } finally {
      setDeletingId(null);
      setServerToDelete(null);
    }
  };

  const handleChaosToggle = async (serverId: number, mode: string | null) => {
    const actionKey = `${serverId}-${mode || 'reset'}`;
    setChaosLoadingId(actionKey);
    setError(null);
    try {
      await triggerChaos(serverId, mode);
      setSuccess(`Chaos mode '${mode || 'reset'}' applied successfully.`);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to trigger chaos simulation");
    } finally {
      setChaosLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              Infrastructure Inventory
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Fleet Probing
            </span>
          </div>
          <p className={`mt-1 text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Enroll, manage, and monitor all compute nodes across your hybrid infrastructure.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className={`p-5 flex items-center gap-4 rounded-xl border transition-all duration-200 ${
          isLight ? "bg-white border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
        }`}>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
            <Server size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Nodes</p>
            <p className={`text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>{totalServers}</p>
          </div>
        </div>

        <div className={`p-5 flex items-center gap-4 rounded-xl border transition-all duration-200 ${
          isLight ? "bg-white border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
        }`}>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 relative">
            <CheckCircle size={22} />
            {onlineServers > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Online</p>
            <p className={`text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>{onlineServers}</p>
          </div>
        </div>

        <div className={`p-5 flex items-center gap-4 rounded-xl border transition-all duration-200 ${
          isLight ? "bg-white border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
        }`}>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Disrupted / Offline</p>
            <p className={`text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>{offlineServers}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in duration-200">
          <AlertCircle size={18} className="shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in duration-200">
          <CheckCircle size={18} className="shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
            isLight ? "bg-white border-slate-200/80 shadow-sm" : "bg-slate-900/50 border-slate-800/80"
          }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isLight ? "border-slate-200/80 bg-slate-50/50" : "border-slate-800/80 bg-slate-900/80"
            }`}>
              <div className="flex items-center gap-2.5">
                <Server size={18} className="text-blue-500" />
                <h2 className={`text-base font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                  Monitored Host Nodes
                </h2>
              </div>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-md border font-medium ${
                isLight 
                  ? "bg-slate-100 text-slate-700 border-slate-200" 
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}>
                {servers.length} {servers.length === 1 ? "node" : "nodes"}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-semibold tracking-wider uppercase ${
                    isLight 
                      ? "border-slate-200/80 bg-slate-50/80 text-slate-500" 
                      : "border-slate-800/80 bg-slate-950/60 text-slate-400"
                  }`}>
                    <th className="py-3.5 px-5">Server Name</th>
                    <th className="py-3.5 px-5">Hostname / IP</th>
                    <th className="py-3.5 px-5">Port</th>
                    <th className="py-3.5 px-5">SSH User</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${
                  isLight ? "divide-slate-200/70" : "divide-slate-800/60"
                }`}>
                  {servers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 px-6 text-center">
                        <div className="max-w-xs mx-auto space-y-2">
                          <Server className="mx-auto text-slate-400 opacity-40" size={36} />
                          <p className={`font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>No servers enrolled</p>
                          <p className="text-xs text-slate-500">Use the enrollment form to add host nodes to monitoring.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    servers.map((server) => {
                      const isOnline = server.last_status === "online";
                      const isVisible = visibleHostnames.has(server.id);
                      return (
                        <tr key={server.id} className={`transition-colors duration-150 ${
                          isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"
                        }`}>
                          <td className={`py-4 px-5 font-semibold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{server.name}</td>
                          <td className={`py-4 px-5 font-mono text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            <div className="flex items-center gap-2">
                              <span className={`transition-all duration-200 ${isVisible ? "" : "blur-xs select-none"}`}>
                                {server.hostname}
                              </span>
                              <button
                                onClick={() => toggleHostnameVisibility(server.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 active:scale-95"
                                title={isVisible ? "Hide IP address" : "Show IP address"}
                              >
                                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </td>
                          <td className={`py-4 px-5 font-mono text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>{server.port}</td>
                          <td className={`py-4 px-5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>{server.username}</td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                              isOnline 
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                              {server.last_status || "unknown"}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <div className={`flex items-center gap-1 p-1 rounded-lg border ${
                                isLight ? "bg-slate-100/80 border-slate-200" : "bg-slate-900/80 border-slate-800"
                              }`}>
                                <button
                                  onClick={() => handleChaosToggle(server.id, "offline")}
                                  disabled={chaosLoadingId === `${server.id}-offline`}
                                  className={`p-1.5 rounded-md text-xs transition-all active:scale-95 ${
                                    server.status_override === "offline"
                                      ? "bg-rose-500 text-white font-bold shadow-xs"
                                      : (isLight ? "text-slate-500 hover:bg-rose-50 hover:text-rose-600" : "text-slate-400 hover:bg-rose-500/20 hover:text-rose-400")
                                  }`}
                                  title="Simulate ICMP Outage (Offline)"
                                >
                                  {chaosLoadingId === `${server.id}-offline` ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <WifiOff size={13} />
                                  )}
                                </button>

                                <button
                                  onClick={() => handleChaosToggle(server.id, "ssh_fail")}
                                  disabled={chaosLoadingId === `${server.id}-ssh_fail`}
                                  className={`p-1.5 rounded-md text-xs transition-all active:scale-95 ${
                                    server.status_override === "ssh_fail"
                                      ? "bg-amber-500 text-white font-bold shadow-xs"
                                      : (isLight ? "text-slate-500 hover:bg-amber-50 hover:text-amber-600" : "text-slate-400 hover:bg-amber-500/20 hover:text-amber-400")
                                  }`}
                                  title="Simulate SSH Handshake Failure"
                                >
                                  {chaosLoadingId === `${server.id}-ssh_fail` ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <KeyRound size={13} />
                                  )}
                                </button>

                                <button
                                  onClick={() => handleChaosToggle(server.id, "crash")}
                                  disabled={chaosLoadingId === `${server.id}-crash`}
                                  className={`p-1.5 rounded-md text-xs transition-all active:scale-95 ${
                                    server.status_override === "crash"
                                      ? "bg-purple-500 text-white font-bold shadow-xs"
                                      : (isLight ? "text-slate-500 hover:bg-purple-50 hover:text-purple-600" : "text-slate-400 hover:bg-purple-500/20 hover:text-purple-400")
                                  }`}
                                  title="Simulate Container Disruption (Crash)"
                                >
                                  {chaosLoadingId === `${server.id}-crash` ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <Zap size={13} />
                                  )}
                                </button>

                                {server.status_override && (
                                  <button
                                    onClick={() => handleChaosToggle(server.id, null)}
                                    disabled={chaosLoadingId === `${server.id}-reset`}
                                    className={`p-1.5 rounded-md text-xs transition-all active:scale-95 ${
                                      isLight ? "text-emerald-600 hover:bg-emerald-50" : "text-emerald-400 hover:bg-emerald-500/20"
                                    }`}
                                    title="Restore Healthy Telemetry (Reset Chaos)"
                                  >
                                    {chaosLoadingId === `${server.id}-reset` ? (
                                      <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                      <RotateCw size={13} />
                                    )}
                                  </button>
                                )}
                              </div>

                              <button
                                onClick={() => setServerToDelete(server)}
                                disabled={deletingId === server.id}
                                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all duration-150 active:scale-95 disabled:opacity-50"
                                title="Delete server"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className={`rounded-2xl p-6 space-y-6 border transition-all duration-300 ${
            isLight ? "bg-white border-slate-200/80 shadow-sm" : "bg-slate-900/50 border-slate-800/80"
          }`}>
            <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
              <h2 className={`text-base font-semibold flex items-center gap-2 ${
                isLight ? "text-slate-900" : "text-slate-100"
              }`}>
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                  <Plus size={16} />
                </div>
                Enroll New Server
              </h2>
              <p className="text-xs text-slate-500 mt-1">Configure SSH credentials for agentless probing.</p>
            </div>

            <form onSubmit={handleEnroll} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>Server Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Skylab Production"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2 text-sm outline-none transition-all duration-150 ${
                    isLight 
                      ? "bg-slate-50/80 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400" 
                      : "bg-slate-950/80 border border-slate-800 text-slate-200 focus:bg-slate-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600"
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>Hostname / IP *</label>
                  <input
                    type="text"
                    placeholder="e.g. 192.168.1.10"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2 text-sm outline-none transition-all duration-150 ${
                      isLight 
                        ? "bg-slate-50/80 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400" 
                        : "bg-slate-950/80 border border-slate-800 text-slate-200 focus:bg-slate-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600"
                    }`}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>Port *</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-all duration-150 ${
                      isLight 
                        ? "bg-slate-50/80 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                        : "bg-slate-950/80 border border-slate-800 text-slate-200 focus:bg-slate-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>SSH Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2 text-sm outline-none transition-all duration-150 ${
                    isLight 
                      ? "bg-slate-50/80 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                      : "bg-slate-950/80 border border-slate-800 text-slate-200 focus:bg-slate-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>Auth Method</label>
                <div className={`grid grid-cols-2 gap-1 border rounded-xl p-1 ${
                  isLight ? "border-slate-200 bg-slate-100/60" : "border-slate-800 bg-slate-950/60"
                }`}>
                  <button
                    type="button"
                    onClick={() => setAuthType("password")}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                      authType === "password"
                        ? isLight ? "bg-white text-blue-600 shadow-xs" : "bg-slate-800 text-slate-100 shadow-xs"
                        : isLight ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthType("key")}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                      authType === "key"
                        ? isLight ? "bg-white text-blue-600 shadow-xs" : "bg-slate-800 text-slate-100 shadow-xs"
                        : isLight ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    SSH Key
                  </button>
                </div>
              </div>

              {authType === "password" ? (
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>SSH Password</label>
                  <input
                    type="password"
                    placeholder="Enter password (stored encrypted)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2 text-sm outline-none transition-all duration-150 ${
                      isLight 
                        ? "bg-slate-50/80 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400" 
                        : "bg-slate-950/80 border border-slate-800 text-slate-200 focus:bg-slate-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600"
                    }`}
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>Private Key</label>
                  <textarea
                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;..."
                    rows={4}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2 text-xs font-mono outline-none transition-all duration-150 ${
                      isLight 
                        ? "bg-slate-50/80 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400" 
                        : "bg-slate-950/80 border border-slate-800 text-slate-200 focus:bg-slate-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600"
                    }`}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:bg-blue-800/50 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-150 shadow-sm cursor-pointer"
              >
                {loading ? "Enrolling Host..." : "Enroll Server"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {serverToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 border rounded-2xl shadow-2xl transition-all ${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-slate-100"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delete Host Instance?</h3>
                <p className="text-xs text-slate-500 font-mono">{serverToDelete.name} ({serverToDelete.hostname})</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete this host server from your fleet inventory? This will permanently stop monitoring and remove all recorded health telemetry logs for this host.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setServerToDelete(null)}
                disabled={deletingId === serverToDelete.id}
                className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                  isLight
                    ? "border-slate-200 hover:bg-slate-100 text-slate-600"
                    : "border-slate-800 hover:bg-slate-800 text-slate-400"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const s = serverToDelete;
                  setServerToDelete(null);
                  handleDelete(s.id, s.name);
                }}
                disabled={deletingId === serverToDelete.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {deletingId === serverToDelete.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Yes, Delete Server
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}