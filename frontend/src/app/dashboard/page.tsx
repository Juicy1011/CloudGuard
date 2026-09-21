"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StatusCard from "@/components/StatusCard";
import MicroservicesList from "@/components/MicroservicesList";
import InfrastructureView from "@/components/InfrastructureView";
import { fetchServers, fetchServerDetail, fetchNotificationEmails, addNotificationEmail, deleteNotificationEmail, deleteUserAccount, revealServerCredentials, updateUserProfile } from "@/lib/api";
import { getStoredUser, setStoredUser, clearStoredUser, UserSession } from "@/lib/auth";
import { ChevronLeft, AlertCircle, Bell, AlertTriangle, Key, Settings, CheckCircle, RefreshCw, LogOut, Search, X, User as UserIcon, Mail, Plus, Trash2, ShieldCheck, Clock, HardDrive, ArrowRight, Copy, Check, Unlock } from "lucide-react";

export default function DashboardRoute() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab");
      if (urlTab && ["dashboard", "infrastructure", "incidents", "access-control", "settings", "profile"].includes(urlTab)) {
        setActiveTab(urlTab);
      }
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedServer(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url.toString());
    }
  };
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [alertEmails, setAlertEmails] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);

  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  const [profilePasswordRevealed, setProfilePasswordRevealed] = useState(false);
  const [profileCopyTimer, setProfileCopyTimer] = useState<number | null>(null);
  const [copiedProfilePass, setCopiedProfilePass] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername && !editPassword) {
      setProfileError("Please provide a new username or password to update.");
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const payload: { username?: string; password?: string } = {};
      if (editUsername.trim()) payload.username = editUsername.trim();
      if (editPassword) payload.password = editPassword;

      const updatedUser = await updateUserProfile(payload);
      setProfileSuccess("Operator profile updated successfully.");
      
      const newSession = {
        ...user,
        username: updatedUser.username,
        email: updatedUser.email,
        ...(editPassword ? { password: editPassword } : {})
      };
      setStoredUser(newSession, true);
      setUser(newSession);

      setEditUsername("");
      setEditPassword("");
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleToggleRevealProfilePassword = () => {
    if (profilePasswordRevealed) {
      setProfilePasswordRevealed(false);
      setProfileCopyTimer(null);
      return;
    }

    setProfilePasswordRevealed(true);
    setProfileCopyTimer(5);

    const interval = setInterval(() => {
      setProfileCopyTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setProfilePasswordRevealed(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const [revealedCreds, setRevealedCreds] = useState<{ [serverId: number]: number }>({});
  const [decryptedCreds, setDecryptedCreds] = useState<{ [serverId: number]: { password?: string; private_key?: string } }>({});
  const [copiedCreds, setCopiedCreds] = useState<{ [serverId: number]: boolean }>({});

  const handleToggleRevealCred = async (serverId: number) => {
    if (revealedCreds[serverId] !== undefined) {
      setRevealedCreds((prev) => {
        const next = { ...prev };
        delete next[serverId];
        return next;
      });
      return;
    }

    try {
      const res = await revealServerCredentials(serverId);
      setDecryptedCreds((prev) => ({
        ...prev,
        [serverId]: { password: res.password, private_key: res.private_key }
      }));
    } catch (err) {
      console.error("Failed to decrypt credentials:", err);
    }

    setRevealedCreds((prev) => ({ ...prev, [serverId]: 5 }));
    
    const intervalId = setInterval(() => {
      setRevealedCreds((prev) => {
        const current = prev[serverId];
        if (current === undefined || current <= 1) {
          clearInterval(intervalId);
          const next = { ...prev };
          delete next[serverId];
          return next;
        }
        return { ...prev, [serverId]: current - 1 };
      });
    }, 1000);
  };

  const handleCopyCred = (e: React.MouseEvent, serverId: number, val: string) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(val);
    }
    setCopiedCreds((prev) => ({ ...prev, [serverId]: true }));
    setTimeout(() => {
      setCopiedCreds((prev) => ({ ...prev, [serverId]: false }));
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    if (!user || user.is_protected) return;
    setDeleteAccountLoading(true);
    setDeleteAccountError(null);
    try {
      await deleteUserAccount(user.email);
      clearStoredUser();
      router.push("/login");
    } catch (err: any) {
      setDeleteAccountError(err.message || "Failed to delete account");
      setDeleteAccountLoading(false);
    }
  };

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
    if (!storedUser || !storedUser.access_token) {
      clearStoredUser();
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
                  containerCount={selectedServer.containers?.length || 0}
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

        const totalNodes = servers.length;
        const onlineNodes = servers.filter(s => s.last_status === "online").length;
        const offlineServers = totalNodes - onlineNodes;
        
        const exitedContainers = servers.reduce((acc, server) => {
          if (!server.containers) return acc;
          const stopped = server.containers.filter((c: any) => !c.status.toLowerCase().startsWith("up")).length;
          return acc + stopped;
        }, 0);

        const totalOutages = offlineServers + exitedContainers;

        const avgLatency = totalNodes > 0
          ? (servers.reduce((acc, s) => acc + (s.latest_health?.latency || 0), 0) / totalNodes).toFixed(1)
          : "0.0";

        return (
          <>
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                  Infrastructure Overview
                </h1>
                <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  Monitoring real-time health and microservices across host nodes.
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
                    className={`w-full pl-9 pr-8 py-2 rounded-xl text-sm transition-all border focus:outline-none focus:ring-2 focus:ring-blue-500/80 ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm"
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
                  className={`p-2.5 border rounded-xl transition-all shrink-0 active:scale-95 ${
                    isLight 
                      ? "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white shadow-sm" 
                      : "border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-900/60"
                  }`}
                  title="Refresh inventory metrics"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin text-blue-500" : ""} />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className={`p-4 border rounded-2xl transition-all duration-300 shadow-sm ${
                isLight 
                  ? "bg-gradient-to-br from-indigo-50/80 via-white to-white border-indigo-100/80 hover:border-indigo-300" 
                  : "bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-900/40 border-indigo-500/20 backdrop-blur-md hover:border-indigo-500/40"
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? "text-indigo-600/80" : "text-indigo-400/90"}`}>Monitored Hosts</p>
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-bold font-mono ${isLight ? "text-slate-900" : "text-slate-100"}`}>{totalNodes}</span>
                  <div className={`p-2 rounded-xl ${isLight ? "bg-indigo-100 text-indigo-600" : "bg-indigo-500/20 text-indigo-400"}`}>
                    <HardDrive size={18} />
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-2xl transition-all duration-300 shadow-sm ${
                isLight 
                  ? "bg-gradient-to-br from-emerald-50/80 via-white to-white border-emerald-100/80 hover:border-emerald-300" 
                  : "bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-900/40 border-emerald-500/20 backdrop-blur-md hover:border-emerald-500/40"
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? "text-emerald-700/80" : "text-emerald-400/90"}`}>Healthy Nodes</p>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-emerald-500">{onlineNodes}</span>
                  <div className={`p-2 rounded-xl ${isLight ? "bg-emerald-100 text-emerald-600" : "bg-emerald-500/20 text-emerald-400"}`}>
                    <CheckCircle size={18} />
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-2xl transition-all duration-300 shadow-sm ${
                isLight 
                  ? "bg-gradient-to-br from-rose-50/80 via-white to-white border-rose-100/80 hover:border-rose-300" 
                  : "bg-gradient-to-br from-rose-950/30 via-slate-900/60 to-slate-900/40 border-rose-500/20 backdrop-blur-md hover:border-rose-500/40"
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? "text-rose-700/80" : "text-rose-400/90"}`}>Outage Alerts</p>
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-bold font-mono ${totalOutages > 0 ? 'text-rose-500' : isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                    {totalOutages}
                  </span>
                  <div className={`p-2 rounded-xl ${totalOutages > 0 ? (isLight ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-rose-500/20 text-rose-400 animate-pulse") : (isLight ? "bg-slate-100 text-slate-400" : "bg-slate-800 text-slate-600")}`}>
                    <AlertCircle size={18} />
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-2xl transition-all duration-300 shadow-sm ${
                isLight 
                  ? "bg-gradient-to-br from-sky-50/80 via-white to-white border-sky-100/80 hover:border-sky-300" 
                  : "bg-gradient-to-br from-sky-950/30 via-slate-900/60 to-slate-900/40 border-sky-500/20 backdrop-blur-md hover:border-sky-500/40"
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? "text-sky-700/80" : "text-sky-400/90"}`}>Fleet Avg Latency</p>
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-bold font-mono ${isLight ? "text-slate-900" : "text-slate-100"}`}>{avgLatency} <span className="text-xs text-slate-500">ms</span></span>
                  <div className={`p-2 rounded-xl ${isLight ? "bg-sky-100 text-sky-600" : "bg-sky-500/20 text-sky-400"}`}>
                    <Clock size={18} />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-64 rounded-xl ${isLight ? "bg-slate-200" : "bg-slate-800/50"}`} />
                ))}
              </div>
            ) : servers.length === 0 ? (
              <div className={`p-12 border border-dashed rounded-xl text-center space-y-3 ${
                isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900/30"
              }`}>
                <HardDrive size={36} className="mx-auto text-blue-500 opacity-80" />
                <h3 className={`font-semibold text-lg ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  No Monitored Servers Enrolled
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  You don&apos;t have any server hosts enrolled in your account workspace yet. Get started by adding your first server.
                </p>
                <button
                  onClick={() => setActiveTab("infrastructure")}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 mt-2 inline-flex items-center gap-2"
                >
                  <Plus size={16} /> Enroll a Server
                </button>
              </div>
            ) : filteredServers.length === 0 ? (
              <div className={`p-12 border border-dashed rounded-xl text-center space-y-3 ${
                isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900/30"
              }`}>
                <Search size={32} className="mx-auto text-slate-500 opacity-60" />
                <h3 className={`font-semibold text-lg ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  No matching instances found
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
                      containerCount={server.containers?.length || 0}
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
              serverId: server.id,
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
                serverId: server.id,
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
                      onClick={() => {
                        const targetServer = servers.find((s) => s.id === incident.serverId);
                        if (targetServer) {
                          setSelectedServer(targetServer);
                          setActiveTab("dashboard");
                        }
                      }}
                      className={`group border rounded-xl p-5 flex items-start gap-4 transition-all cursor-pointer ${
                        incident.severity === "CRITICAL" 
                          ? (isLight ? "bg-red-50/60 border-red-200 hover:border-red-400 hover:shadow-md" : "bg-red-500/5 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10") 
                          : (isLight ? "bg-amber-50/60 border-amber-200 hover:border-amber-400 hover:shadow-md" : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/10")
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-all group-hover:scale-105 ${
                        incident.severity === "CRITICAL" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        <AlertTriangle size={20} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold tracking-wider px-2 py-0.5 rounded ${
                              incident.severity === "CRITICAL" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                            }`}>
                              {incident.severity}
                            </span>
                            <span className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              Inspect Host & Microservice <ArrowRight size={12} />
                            </span>
                          </div>
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
                {alertEmails.length === 0 ? (
                  <div className={`p-4 border border-dashed rounded-lg text-center text-xs ${
                    isLight ? "border-slate-200 text-slate-500" : "border-slate-800 text-slate-500"
                  }`}>
                    No additional notification recipients added. Click "Add Recipient" above to register extra emails.
                  </div>
                ) : (
                  alertEmails.map((email) => (
                    <div
                      key={email}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/40 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-slate-400" />
                        <span className={`text-sm font-mono ${isLight ? "text-slate-800" : "text-slate-200"}`}>{email}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Active Target
                        </span>
                      </div>

                      <button
                        onClick={() => setEmailToDelete(email)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove email from alert list"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
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

              <div className="pt-6 pb-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  Update Profile Credentials
                </h3>
                
                {profileSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs font-medium">
                    {profileSuccess}
                  </div>
                )}
                
                {profileError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-medium">
                    {profileError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder={user.username}
                      className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        isLight
                          ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500"
                          : "bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        isLight
                          ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500"
                          : "bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={profileLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2"
                  >
                    {profileLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
                    Save Profile Changes
                  </button>
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
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Password hashing algorithm: PBKDF2-SHA256 with salt. Credentials stored securely in PostgreSQL.
                  </p>
                  
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">STATUS: PROTECTED</span>
                    <button
                      onClick={handleToggleRevealProfilePassword}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all duration-300 flex items-center gap-2 ${
                        profilePasswordRevealed
                          ? (isLight ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-amber-500/20 border-amber-500/40 text-amber-300")
                          : (isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20")
                      }`}
                      title="Click to reveal/lock password"
                    >
                      {profilePasswordRevealed ? (
                        <>
                          <Key size={13} className="text-amber-500 animate-pulse" />
                          <span className="font-bold font-mono text-slate-900 dark:text-white">{user.password || "••••••••"}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(user.password || "");
                              setCopiedProfilePass(true);
                              setTimeout(() => setCopiedProfilePass(false), 2000);
                            }}
                            className="p-1 hover:bg-black/10 rounded transition-all"
                            title="Copy to clipboard"
                          >
                            {copiedProfilePass ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                          {profileCopyTimer !== null && (
                            <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                              {profileCopyTimer}s
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <Key size={13} />
                          <span>PASS_AUTH</span>
                        </>
                      )}
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
                      {(() => {
                        const remaining = revealedCreds[server.id];
                        const isRevealed = remaining !== undefined;
                        const isCopied = copiedCreds[server.id];
                        const decrypted = decryptedCreds[server.id];
                        const credText = decrypted ? (decrypted.password || decrypted.private_key || "Vaulted Secret") : (server.private_key || server.password || "••••••••");
                        const labelType = server.private_key ? "PRIVATE_KEY" : "PASSWORD_AUTH";

                        return (
                          <div 
                            onClick={() => handleToggleRevealCred(server.id)}
                            className={`group relative cursor-pointer select-none rounded-xl px-4 py-2 text-xs font-mono transition-all duration-500 border shadow-xs flex items-center gap-2.5 ${
                              isRevealed 
                                ? (isLight ? "bg-amber-50 border-amber-300 text-amber-900 shadow-amber-500/10" : "bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-amber-500/10")
                                : (isLight ? "bg-slate-200/80 hover:bg-slate-300/80 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300")
                            }`}
                            title={isRevealed ? "Click to lock credential" : "Click to reveal credential for 5 seconds"}
                          >
                            {isRevealed ? (
                              <>
                                <Unlock size={14} className="text-amber-500 shrink-0" />
                                <span className="font-bold tracking-wider max-w-[140px] truncate">{credText}</span>
                                
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyCred(e, server.id, credText)}
                                  className={`p-1 rounded transition-colors ${
                                    isLight ? "hover:bg-amber-200 text-amber-800" : "hover:bg-amber-900 text-amber-300"
                                  }`}
                                  title="Copy credential"
                                >
                                  {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                                </button>

                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  {remaining}s
                                </span>
                              </>
                            ) : (
                              <>
                                <Key size={14} className="text-indigo-400 shrink-0 group-hover:rotate-12 transition-transform" />
                                <span className="font-semibold">{labelType}</span>
                              </>
                            )}
                          </div>
                        );
                      })()}
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

            <div className={`p-6 space-y-4 max-w-2xl border rounded-xl transition-all duration-300 ${
              isLight ? "bg-white border-red-200/80 shadow-sm" : "bg-red-950/10 border-red-900/30"
            }`}>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 text-red-500">
                  <AlertTriangle size={18} />
                  Danger Zone: Operator Account
                </h2>
                <p className="text-xs text-slate-500 mt-1">Permanently remove operator access credentials from the PostgreSQL database.</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                    Delete Operator Account
                  </h4>
                  <p className="text-xs text-slate-500">
                    {user.is_protected
                      ? "Primary admin account is protected and cannot be deleted."
                      : "Irreversibly delete account credentials and sign out of session."}
                  </p>
                </div>
                <button
                  onClick={() => setIsDeleteAccountModalOpen(true)}
                  disabled={user.is_protected}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    user.is_protected
                      ? "bg-slate-500/10 text-slate-400 border border-slate-500/20 cursor-not-allowed opacity-60"
                      : "bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-95 cursor-pointer"
                  }`}
                  title={user.is_protected ? "Primary admin account is locked" : "Delete your account"}
                >
                  <Trash2 size={14} />
                  {user.is_protected ? "Protected Account" : "Delete Account"}
                </button>
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
        user={user}
      />
      <main className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </main>

      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 border rounded-2xl shadow-xl transition-all ${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-slate-100"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delete Account Permanently?</h3>
                <p className="text-xs text-slate-500 font-mono">{user.email}</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete your account? This will permanently remove your login credentials from the database and end your active session. This action cannot be undone.
            </p>

            {deleteAccountError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-medium">
                {deleteAccountError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeleteAccountModalOpen(false)}
                disabled={deleteAccountLoading}
                className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                  isLight
                    ? "border-slate-200 hover:bg-slate-100 text-slate-600"
                    : "border-slate-800 hover:bg-slate-800 text-slate-400"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccountLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {deleteAccountLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Yes, Delete Account
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
