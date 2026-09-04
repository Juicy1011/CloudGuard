"use client";

import React, { useState } from "react";
import { LayoutDashboard, Shield, Server, Settings, Bell, LogOut, ChevronLeft, ChevronRight, Sun, Moon, User } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
  onSignOut?: () => void;
}

export default function Sidebar({ activeTab, onTabChange, theme = "dark", onThemeToggle, onSignOut }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
    { icon: Server, label: "Infrastructure", id: "infrastructure" },
    { icon: Bell, label: "Incidents", id: "incidents" },
    { icon: Shield, label: "Access Control", id: "access" },
    { icon: User, label: "Profile", id: "profile" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];

  const isLight = theme === "light";

  return (
    <aside className={`border-r flex flex-col p-4 transition-all duration-300 ease-in-out ${
      isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-100"
    } ${
      isCollapsed ? "w-20" : "w-64"
    }`}>
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg italic shrink-0 text-white">
            CG
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight">
              CloudGuard
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
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
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? (isLight ? "bg-blue-50 text-blue-600 font-semibold" : "bg-blue-600/10 text-blue-400 font-semibold")
                  : (isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200")
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
                ? "text-slate-700 hover:bg-slate-100" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? (isLight ? "Switch to Dark Mode" : "Switch to Light Mode") : undefined}
          >
            {isLight ? <Moon size={20} className="shrink-0 text-indigo-600" /> : <Sun size={20} className="shrink-0 text-amber-400" />}
            {!isCollapsed && (
              <span className="font-medium truncate">
                {isLight ? "Dark Mode" : "Light Mode"}
              </span>
            )}
          </button>
        )}

        <button 
          onClick={onSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors ${
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
