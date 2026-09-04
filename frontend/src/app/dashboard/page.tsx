"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StatusCard from "@/components/StatusCard";
import MicroservicesList from "@/components/MicroservicesList";
import InfrastructureView from "@/components/InfrastructureView";
import { fetchServers, fetchServerDetail, fetchNotificationEmails, addNotificationEmail, deleteNotificationEmail } from "@/lib/api";
import { getStoredUser, clearStoredUser, UserSession } from "@/lib/auth";
import { ChevronLeft, AlertCircle, Bell, AlertTriangle, Key, Settings, CheckCircle, RefreshCw, LogOut, Search, X, User as UserIcon, Mail, Plus, Trash2, ShieldCheck, Clock, HardDrive } from "lucide-react";

export default function DashboardRoute() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [alertEmails, setAlertEmails] = useState<string[]>(["trueyours1@gmail.com"]);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("cloudguard_theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }

    fetchNotificationEmails()
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setAlertEmails(data.map((item: any) => item.email));
        }
      })
      .catch((err) => console.error("Failed to load notification emails:", err));
  }, []);

  const reloadNotificationEmails = async () => {
    try {
      const data = await fetchNotificationEmails();
      if (Array.isArray(data)) {
        setAlertEmails(data.map((item: any) => item.email));
      }
    } catch (err) {
      console.error("Failed to reload notification emails:", err);
    }
  };

  const handleAddAlertEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim()) return;
    const email = newEmailInput.trim().toLowerCase();
    if (alertEmails.includes(email)) {
      setEmailNotice("Email already added to alerts list.");
      return;
    }
    try {
      await addNotificationEmail(email);
      setNewEmailInput("");
      setEmailNotice("Recipient email added successfully!");
      await reloadNotificationEmails();
      setTimeout(() => setEmailNotice(null), 3000);
    } catch (err: any) {
      setEmailNotice(err.message || "Failed to add recipient email.");
    }
  };

  const handleRemoveAlertEmail = async (emailToRemove: string) => {
    try {
      await deleteNotificationEmail(emailToRemove);
      await reloadNotificationEmails();
    } catch (err: any) {
      console.error("Failed to remove email:", err);
    }
  };

  const isLight = theme === "light";
  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("cloudguard_theme", next);
      return next;
    });
  };

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.replace("/login");
    } else {
      setUser(storedUser);
      setCheckingAuth(false);
    }
  }, [router]);

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
    if (!user) return;
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user, selectedServer?.id]);

  const handleSignOut = () => {
    clearStoredUser();
    setUser(null);
    router.push("/login");
  };

  if (checkingAuth || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedServer(null);
  };

  const isUnreachable = selectedServer && selectedServer.last_status !== "online";

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        if (selectedServer) {
          return (
            <div>
              <button 
                onClick={() => setSelectedServer(null)}
                className={`flex items-center gap-2 mb-6 transition-colors ${
                  isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                }`}
              >
                <ChevronLeft size={20} /> Back to Overview
              </button>
              
              <header className="mb-6">
                <h1 className={`text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                  {selectedServer.name}
                </h1>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Secured Infrastructure Node</p>
              </header>

              {isUnreachable && (
                <div className="mb-8 flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                  <AlertCircle size={20} className="shrink-0" />
                  <div>
                    <p className="font-bold text-sm uppercase tracking-tight">Infrastructure Connection Lost</p>
                    <p className="text-xs opacity-80">Displaying last known metrics from the edge database. Telemetry will resume automatically upon reconnection.</p>
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
                  theme={theme}
                />
                
                <div className="lg:col-span-2">
                  <MicroservicesList 
                    serverId={selectedServer.id}
                    serverStatus={selectedServer.last_status}
                    containers={selectedServer.containers} 
                    onActionComplete={loadData}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          );
        }

        const filteredServers = servers.filter((server) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          const matchesName = server.name?.toLowerCase().includes(q);
          const matchesHost = server.hostname?.toLowerCase().includes(q);
          const matchesStatus = server.last_status?.toLowerCase().includes(q);
          const matchesContainer = server.containers?.some((c: any) =>
            c.name?.toLowerCase().includes(q) || c.image?.toLowerCase().includes(q)
          );
          return matchesName || matchesHost || matchesStatus || matchesContainer;
        });

        return (
          <>
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                  Infrastructure Overview
                </h1>
                <p className={isLight ? "text-slate-500" : "text-slate-400"}>
                  Monitoring real-time health of discovered host nodes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-72">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search instances or microservices..."
                    className={`w-full pl-9 pr-8 py-2 rounded-lg text-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                        : "bg-slate-900/60 border-slate-800 text-slate-100 placeholder:text-slate-500"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full ${
                        isLight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-slate-800 text-slate-500"
                      }`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button 
                  onClick={loadData} 
                  className={`p-2 border rounded-lg transition-colors shrink-0 ${
                    isLight 
                      ? "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
                      : "border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                  title="Refresh inventory metrics"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </header>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-64 rounded-xl ${isLight ? "bg-slate-200" : "bg-slate-800/50"}`} />
                ))}
              </div>
            ) : filteredServers.length === 0 ? (
              <div className={`p-12 border border-dashed rounded-xl text-center space-y-3 ${
                isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900/30"
              }`}>
                <Search size={32} className="mx-auto text-slate-500 opacity-60" />
                <h3 className={`font-semibold text-lg ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  No instances found
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  No host nodes or microservices match your search query &quot;{searchQuery}&quot;. Try adjusting your filters.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors mt-2"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {searchQuery && (
                  <p className="text-xs text-slate-500 font-medium">
                    Showing {filteredServers.length} of {servers.length} instances matching &quot;{searchQuery}&quot;
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServers.map((server) => (
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
                      theme={theme}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case "infrastructure":
        return <InfrastructureView servers={servers} onRefresh={loadData} theme={theme} />;

      case "incidents":
        const incidents: any[] = [];
        servers.forEach(server => {
          if (server.last_status !== "online") {
            incidents.push({
              id: `server-${server.id}`,
              type: "server",
              severity: "CRITICAL",
              title: `Host Down: ${server.name}`,
              message: `Server failed ICMP ping or SSH handshake. Host is reported as '${server.last_status}'.`,
              time: server.last_seen ? new Date(server.last_seen).toLocaleTimeString() : "Just now"
            });
          }
          server.containers?.forEach((c: any) => {
            if (!c.status.toLowerCase().startsWith("up")) {
              incidents.push({
                id: `container-${server.id}-${c.container_id}`,
                type: "container",
                severity: "WARNING",
                title: `Microservice Stopped: ${c.name} on ${server.name}`,
                message: `Container state returned: '${c.status}'. Telemetry reporting 0.0% usage.`,
                time: "Real-time trigger"
              });
            }
          });
        });

        return (
          <div className="space-y-6">
            <header className="mb-8">
              <h1 className={`text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Incident Manager
              </h1>
              <p className={isLight ? "text-slate-500" : "text-slate-400"}>
                Track and triage active service disruptions and configure real-time notification recipients.
              </p>
            </header>

            <div className={`p-6 border rounded-xl transition-all duration-300 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}>
                  <Bell size={18} className="text-amber-500" />
                  Active System Disruptions ({incidents.length})
                </h2>
              </div>

              {incidents.length === 0 ? (
                <div className={`p-12 border border-dashed rounded-xl text-center space-y-2 ${
                  isLight ? "border-slate-200 text-slate-500" : "border-slate-800 text-slate-500"
                }`}>
                  <CheckCircle size={32} className="text-emerald-500 mx-auto" />
                  <p className={`font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    All systems operational
                  </p>
                  <p className="text-xs text-slate-500">No active incidents detected in the fleet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div 
                      key={incident.id} 
                      className={`border rounded-lg p-5 flex items-start gap-4 transition-colors ${
                        incident.severity === "CRITICAL" 
                          ? "bg-red-500/5 border-red-500/20" 
                          : "bg-amber-500/5 border-amber-500/20"
                      }`}
                    >
                      <div className={`p-2.5 rounded-md ${
                        incident.severity === "CRITICAL" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        <AlertTriangle size={20} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold tracking-wider px-2 py-0.5 rounded ${
                            incident.severity === "CRITICAL" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {incident.severity}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{incident.time}</span>
                        </div>
                        <h4 className={`font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>{incident.title}</h4>
                        <p className={`text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>{incident.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-6 border rounded-xl transition-all duration-300 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
            }`}>
              <div className="mb-6">
                <h2 className={`text-lg font-semibold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}>
                  <Mail size={18} className="text-blue-500" />
                  Incident Alert Recipients (SMTP Notification List)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Specify the email addresses that will receive instant incident reports when host or microservice disruptions occur.
                </p>
              </div>

              {emailNotice && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs font-medium">
                  {emailNotice}
                </div>
              )}

              <form onSubmit={handleAddAlertEmail} className="flex gap-3 mb-6">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="Enter alert recipient email (e.g. operator@company.com)..."
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                      : "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
                >
                  <Plus size={16} /> Add Recipient
                </button>
              </form>

              <div className="space-y-2">
                {alertEmails.map((email) => {
                  const isPrimary = email.toLowerCase() === "trueyours1@gmail.com";
                  return (
                    <div
                      key={email}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/40 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-slate-400" />
                        <span className={`text-sm font-mono ${isLight ? "text-slate-800" : "text-slate-200"}`}>{email}</span>
                        {isPrimary ? (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            Primary Recipient (Locked)
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Active Target
                          </span>
                        )}
                      </div>

                      {!isPrimary && (
                        <button
                          onClick={() => setEmailToDelete(email)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Remove email from alert list"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {emailToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                  <div className={`max-w-md w-full p-6 rounded-xl border shadow-xl space-y-4 ${
                    isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-slate-100"
                  }`}>
                    <div className="flex items-center gap-3 text-amber-500">
                      <AlertTriangle size={24} />
                      <h3 className="text-lg font-bold">Remove Recipient Email?</h3>
                    </div>
                    <p className={`text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      Are you sure you want to remove <strong className="font-mono text-blue-500">{emailToDelete}</strong> from the automated SMTP incident alert notification list?
                    </p>
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => setEmailToDelete(null)}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                          isLight
                            ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                            : "border-slate-700 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          const target = emailToDelete;
                          setEmailToDelete(null);
                          await handleRemoveAlertEmail(target);
                        }}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                      >
                        Confirm Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6 max-w-4xl">
            <header className="mb-8">
              <h1 className={`text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Operator Profile
              </h1>
              <p className={isLight ? "text-slate-500" : "text-slate-400"}>
                View account credentials, authentication metrics, and active session properties.
              </p>
            </header>

            <div className={`p-6 border rounded-xl transition-all duration-300 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
            }`}>
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0">
                  {user.username ? user.username.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <h2 className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                      {user.username}
                    </h2>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      System Operator
                    </span>
                  </div>
                  <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>{user.email}</p>
                  <p className="text-xs font-mono text-slate-500 pt-1">Account Identifier: UID-{user.id || "001"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className={`p-4 border rounded-lg ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/40 border-slate-800"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <h4 className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      Security & Password
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Password hashing algorithm: PBKDF2-SHA256 with salt. Credentials stored securely in PostgreSQL.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">STATUS: PROTECTED</span>
                    <button
                      onClick={() => router.push("/login")}
                      className="text-xs font-semibold text-blue-500 hover:underline"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>

                <div className={`p-4 border rounded-lg ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/40 border-slate-800"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={18} className="text-indigo-500" />
                    <h4 className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      Active Session State
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Persistent token authentication active across browser reloads.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">SCOPE: LOCAL_STORAGE</span>
                    <button
                      onClick={handleSignOut}
                      className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1"
                    >
                      <LogOut size={12} /> Terminate Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "access":
        return (
          <div className="space-y-6">
            <header className="mb-8">
              <h1 className={`text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Access Control Vault
              </h1>
              <p className={isLight ? "text-slate-500" : "text-slate-400"}>
                Manage and rotate SSH credentials and server identity certificates securely.
              </p>
            </header>

            <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
            }`}>
              <div className={`p-6 border-b flex items-center justify-between ${
                isLight ? "border-slate-200" : "border-slate-800"
              }`}>
                <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                  Stored Credentials (Encrypted)
                </h2>
                <span className="text-xs text-indigo-500 font-semibold tracking-wider uppercase">Fernet Secure</span>
              </div>
              <div className="p-6 space-y-4">
                {servers.map((server) => (
                  <div key={server.id} className={`border rounded-lg p-4 flex items-center justify-between ${
                    isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950/40"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-md ${
                        isLight ? "bg-slate-200 text-slate-700" : "bg-slate-800 text-slate-400"
                      }`}>
                        <Key size={18} />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                          {server.name} SSH Credential
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">Scope: {server.username}@{server.hostname}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right text-xs">
                        <span className="text-slate-500">Status</span>
                        <p className="font-medium text-emerald-500">Vaulted & Secure</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-mono ${
                        isLight ? "bg-slate-200 text-slate-700" : "bg-slate-800 text-slate-400"
                      }`}>
                        {server.private_key ? "PRIVATE_KEY" : "PASSWORD_AUTH"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <header className="mb-8">
              <h1 className={`text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                System Settings
              </h1>
              <p className={isLight ? "text-slate-500" : "text-slate-400"}>
                Configure CloudGuard monitoring agent settings and presentation parameters.
              </p>
            </header>

            <div className={`p-6 space-y-6 max-w-2xl border rounded-xl transition-all duration-300 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-800"
            }`}>
              <div>
                <h2 className={`text-lg font-semibold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}>
                  <Settings size={18} className="text-blue-500" />
                  Observability Settings
                </h2>
                <p className="text-xs text-slate-500 mt-1">Manage network polling frequency, timeouts, and diagnostic configurations.</p>
              </div>

              <div className={`space-y-4 divide-y ${
                isLight ? "divide-slate-200" : "divide-slate-800/60"
              }`}>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      Demo Mode Override
                    </h4>
                    <p className="text-xs text-slate-500">Emulate telemetries locally without establishing genuine SSH tunnels.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                    ACTIVE (DEMO_MODE=true)
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      Worker Polling Rate
                    </h4>
                    <p className="text-xs text-slate-500">Frequency of ICMP and SSH probing cycles in seconds.</p>
                  </div>
                  <span className={`text-sm font-semibold font-mono ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    5 seconds
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      Connection Timeout
                    </h4>
                    <p className="text-xs text-slate-500">Maximum duration permitted for remote SSH socket handshakes.</p>
                  </div>
                  <span className={`text-sm font-semibold font-mono ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    10.0 seconds
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                      Active Session
                    </h4>
                    <p className="text-xs text-slate-500">Logged in as {user.username} ({user.email}).</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
    }`}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        theme={theme}
        onThemeToggle={toggleTheme}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </main>
    </div>
  );
}
