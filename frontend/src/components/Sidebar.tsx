import React from "react";
import { LayoutDashboard, Shield, Server, Settings, Bell, LogOut } from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Server, label: "Infrastructure" },
    { icon: Bell, label: "Incidents" },
    { icon: Shield, label: "Access Control" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg italic">CG</div>
        <span className="font-bold text-xl tracking-tight">CloudGuard</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              item.active 
                ? "bg-blue-600/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
