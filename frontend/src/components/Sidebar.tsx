"use client";

import React, { useState } from "react";
import { LayoutDashboard, Shield, Server, Bell, LogOut, ChevronLeft, ChevronRight, Sun, Moon, User as UserIcon, Settings } from "lucide-react";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: { username: string; email: string } | null;
}

export default function Sidebar({
  activeTab = "dashboard",
  onTabChange,
  theme = "dark",
  onThemeToggle,
  onSignOut,
  collapsed,
  onToggleCollapse,
  user
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  const isLight = theme === "light";

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "infrastructure", icon: Server, label: "Infrastructure" },
    { id: "incidents", icon: Bell, label: "Incidents" },
    { id: "access", icon: Shield, label: "Access Control" },
  ];

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  return (
    <aside className={`border-r flex flex-col p-4 transition-all duration-300 ease-in-out ${
      isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-100"
    } ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-base italic text-white shrink-0 shadow-md shadow-blue-500/20">
            CG
          </div>
          {!isCollapsed && (
            <span className={`font-bold text-xl tracking-tight bg-gradient-to-r ${
              isLight ? "from-slate-900 via-blue-900 to-indigo-900" : "from-white via-slate-100 to-blue-200"
            } bg-clip-text text-transparent`}>
              CloudGuard
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`p-1.5 rounded-lg border transition-all ${
            isLight
              ? "border-slate-200 hover:bg-slate-100 text-slate-600"
              : "border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? (isLight 
                      ? "bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent text-blue-600 font-semibold border-l-4 border-blue-600 shadow-sm" 
                      : "bg-gradient-to-r from-blue-600/25 via-indigo-600/15 to-transparent text-blue-400 font-semibold border-l-4 border-blue-500 shadow-sm")
                  : (isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200")
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={20} className={`shrink-0 ${
                isActive ? (isLight ? "text-blue-600" : "text-blue-400") : ""
              }`} />
              {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`pt-4 border-t space-y-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
        {onThemeToggle && (
          <button
            onClick={onThemeToggle}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              isLight
                ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? (isLight ? "Switch to Dark Mode" : "Switch to Light Mode") : undefined}
          >
            {isLight ? <Moon size={18} className="shrink-0 text-slate-700" /> : <Sun size={18} className="shrink-0 text-amber-400" />}
            {!isCollapsed && (
              <span className="font-medium text-xs tracking-wide uppercase truncate">
                {isLight ? "Dark Mode" : "Light Mode"}
              </span>
            )}
          </button>
        )}

        <div className="relative">
          {menuOpen && (
            <div className={`absolute bottom-full left-0 mb-2 w-56 rounded-2xl border p-3 shadow-xl z-50 transition-all ${
              isLight 
                ? "bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md shadow-slate-300/50" 
                : "bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md shadow-slate-950/80"
            }`}>
              <div className="px-3 py-2 border-b mb-2 border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500 mb-0.5">Active Session</p>
                <p className="font-bold text-xs truncate">{user?.username || "Admin Operator"}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || "admin@cloudguard.io"}</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    onTabChange?.("profile");
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isLight ? "hover:bg-slate-100 text-slate-700" : "hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <UserIcon size={14} className="text-orange-500" />
                  View Operator Profile
                </button>

                <button
                  onClick={() => {
                    onTabChange?.("settings");
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isLight ? "hover:bg-slate-100 text-slate-700" : "hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <Settings size={14} className="text-blue-500" />
                  Account Settings
                </button>

                {onSignOut && (
                  <button
                    onClick={() => {
                      onSignOut();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out Operator
                  </button>
                )}
              </div>
            </div>
          )}

          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${
              activeTab === "profile" || menuOpen
                ? (isLight ? "bg-blue-50 border-blue-300 shadow-xs" : "bg-blue-950/30 border-blue-500/40 shadow-xs")
                : (isLight 
                    ? "bg-slate-100/80 border-slate-200/80 hover:bg-slate-200/60" 
                    : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90")
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? user?.username || "Operator Profile" : undefined}
          >
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm shrink-0">
              {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0 pr-1">
                <p className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                  {user?.username || "Admin Operator"}
                </p>
                <p className={`text-[11px] truncate ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                  {user?.email || "admin@cloudguard.io"}
                </p>
              </div>
            )}

            {!isCollapsed && onSignOut && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSignOut();
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight 
                    ? "hover:bg-red-100 text-slate-400 hover:text-rose-600" 
                    : "hover:bg-red-950/40 text-slate-500 hover:text-rose-400"
                }`}
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
