"use client";

import React, { useState } from "react";
import { LayoutDashboard, Shield, Server, Settings, Bell, LogOut, ChevronLeft, ChevronRight, Sun, Moon, User } from "lucide-react";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  activeTab = "dashboard",
  onTabChange,
  theme = "dark",
  onThemeToggle,
  onSignOut,
  collapsed,
  onToggleCollapse
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  const isLight = theme === "light";

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "infrastructure", icon: Server, label: "Infrastructure" },
    { id: "incidents", icon: Bell, label: "Incidents" },
    { id: "access", icon: Shield, label: "Access Control" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "settings", icon: Settings, label: "Settings" },
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
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg italic text-white shrink-0">
            CG
          </div>
          {!isCollapsed && (
            <span className={`font-bold text-xl tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              CloudGuard
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`p-1.5 rounded-lg border transition-colors ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? (isLight ? "bg-blue-50 text-blue-600 font-semibold" : "bg-blue-600/10 text-blue-400 font-semibold")
                  : (isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200")
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`pt-4 border-t space-y-2 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
        {onThemeToggle && (
          <button
            onClick={onThemeToggle}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isLight
                ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? (isLight ? "Switch to Dark Mode" : "Switch to Light Mode") : undefined}
          >
            {isLight ? <Moon size={20} className="shrink-0 text-slate-700" /> : <Sun size={20} className="shrink-0 text-amber-400" />}
            {!isCollapsed && (
              <span className="font-medium truncate">
                {isLight ? "Dark Mode" : "Light Mode"}
              </span>
            )}
          </button>
        )}

        <button 
          onClick={onSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium truncate">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
