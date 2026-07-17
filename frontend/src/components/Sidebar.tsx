"use client";

import React, { useState } from "react";
import { LayoutDashboard, Shield, Server, Settings, Bell, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Server, label: "Infrastructure" },
    { icon: Bell, label: "Incidents" },
    { icon: Shield, label: "Access Control" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <aside className={`border-r border-slate-800 flex flex-col p-4 transition-all duration-300 ease-in-out ${
      isCollapsed ? "w-20" : "w-64"
    }`}>
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg italic shrink-0">
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
          className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              item.active 
                ? "bg-blue-600/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800">
        <button 
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
