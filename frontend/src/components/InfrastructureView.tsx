"use client";

import React, { useState } from "react";
import { Server, Trash2, Plus, AlertCircle, CheckCircle, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { createServer, deleteServer } from "@/lib/api";

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
    if (!confirm(`Are you sure you want to delete server "${serverName}"? This will stop monitoring.`)) {
      return;
    }

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
    }
  };

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className={`text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
          Infrastructure Inventory
        </h1>
        <p className={isLight ? "text-slate-500" : "text-slate-400"}>
          Enroll, manage, and inspect all host nodes in the fleet.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-5 flex items-center gap-4 rounded-xl border transition-all duration-300 ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
        }`}>
          <div className="p-3 bg-blue-600/10 text-blue-500 rounded-lg">
            <Server size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Nodes</p>
            <p className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>{totalServers}</p>
          </div>
        </div>

        <div className={`p-5 flex items-center gap-4 rounded-xl border transition-all duration-300 ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
        }`}>
          <div className="p-3 bg-emerald-600/10 text-emerald-500 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Online</p>
            <p className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>{onlineServers}</p>
          </div>
        </div>

        <div className={`p-5 flex items-center gap-4 rounded-xl border transition-all duration-300 ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
        }`}>
          <div className="p-3 bg-red-600/10 text-red-500 rounded-lg">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Disrupted/Offline</p>
            <p className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>{offlineServers}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-3 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-lg flex items-center gap-3 text-sm">
          <CheckCircle size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-xl overflow-hidden border transition-all duration-300 ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
          }`}>
            <div className={`p-6 border-b flex items-center justify-between ${
              isLight ? "border-slate-200" : "border-slate-800"
            }`}>
              <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Monitored Host Nodes
              </h2>
              <span className="text-xs text-slate-500 font-mono">Real-time inventory</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                    isLight 
                      ? "border-slate-200 bg-slate-50 text-slate-600" 
                      : "border-slate-800 bg-slate-950/40 text-slate-400"
                  }`}>
                    <th className="p-4">Server Name</th>
                    <th className="p-4">Hostname / IP</th>
                    <th className="p-4">Port</th>
                    <th className="p-4">SSH User</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${
                  isLight ? "divide-slate-200" : "divide-slate-800/60"
                }`}>
                  {servers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No servers currently enrolled. Use the form to add a host.
                      </td>
                    </tr>
                  ) : (
                    servers.map((server) => {
                      const isOnline = server.last_status === "online";
                      const isVisible = visibleHostnames.has(server.id);
                      return (
                        <tr key={server.id} className={`transition-colors ${
                          isLight ? "hover:bg-slate-50" : "hover:bg-slate-900/20"
                        }`}>
                          <td className={`p-4 font-semibold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{server.name}</td>
                          <td className={`p-4 font-mono text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            <div className="flex items-center gap-2">
                              <span className={`transition-all duration-200 ${isVisible ? "" : "blur-xs select-none"}`}>
                                {server.hostname}
                              </span>
                              <button
                                onClick={() => toggleHostnameVisibility(server.id)}
                                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-0.5"
                                title={isVisible ? "Hide IP address" : "Show IP address"}
                              >
                                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </td>
                          <td className={`p-4 font-mono text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>{server.port}</td>
                          <td className={isLight ? "p-4 text-slate-700" : "p-4 text-slate-300"}>{server.username}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                              isOnline ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            }`}>
                              {server.last_status || "unknown"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDelete(server.id, server.name)}
                              disabled={deletingId === server.id}
                              className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              title="Delete server"
                            >
                              <Trash2 size={16} />
                            </button>
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
          <div className={`rounded-xl p-6 space-y-6 border transition-all duration-300 ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
          }`}>
            <div>
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${
                isLight ? "text-slate-900" : "text-slate-100"
              }`}>
                <Plus size={18} className="text-blue-500" />
                Enroll New Server
              </h2>
              <p className="text-xs text-slate-500 mt-1">Configure SSH access credentials for CloudGuard agentless probing.</p>
            </div>

            <form onSubmit={handleEnroll} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>Server Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Skylab Production"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-400" 
                      : "bg-slate-950 border border-slate-800 text-slate-200 focus:border-blue-500 placeholder:text-slate-600"
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>Hostname / IP *</label>
                  <input
                    type="text"
                    placeholder="e.g. 192.168.1.10"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                      isLight 
                        ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-400" 
                        : "bg-slate-950 border border-slate-800 text-slate-200 focus:border-blue-500 placeholder:text-slate-600"
                    }`}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>Port *</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                      isLight 
                        ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500" 
                        : "bg-slate-950 border border-slate-800 text-slate-200 focus:border-blue-500"
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>SSH Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500" 
                      : "bg-slate-950 border border-slate-800 text-slate-200 focus:border-blue-500"
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>Auth Method</label>
                <div className={`grid grid-cols-2 gap-2 border rounded-lg p-1 ${
                  isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950"
                }`}>
                  <button
                    type="button"
                    onClick={() => setAuthType("password")}
                    className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                      authType === "password"
                        ? isLight ? "bg-white text-blue-600 shadow-sm" : "bg-slate-800 text-slate-100"
                        : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthType("key")}
                    className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                      authType === "key"
                        ? isLight ? "bg-white text-blue-600 shadow-sm" : "bg-slate-800 text-slate-100"
                        : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    SSH Key
                  </button>
                </div>
              </div>

              {authType === "password" ? (
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>SSH Password</label>
                  <input
                    type="password"
                    placeholder="Enter password (stored encrypted)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                      isLight 
                        ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-400" 
                        : "bg-slate-950 border border-slate-800 text-slate-200 focus:border-blue-500 placeholder:text-slate-600"
                    }`}
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>Private Key</label>
                  <textarea
                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;..."
                    rows={4}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-mono outline-none transition-colors ${
                      isLight 
                        ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-400" 
                        : "bg-slate-950 border border-slate-800 text-slate-200 focus:border-blue-500 placeholder:text-slate-600"
                    }`}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
              >
                {loading ? "Enrolling Host..." : "Enroll Server"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}