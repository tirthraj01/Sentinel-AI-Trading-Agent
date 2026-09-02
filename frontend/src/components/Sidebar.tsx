import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Layers,
  Bot,
  ShieldAlert,
  History,
  Workflow,
  Settings,
  Shield,
} from "lucide-react";

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard },
  { name: "Markets", to: "/markets", icon: TrendingUp },
  { name: "Portfolio", to: "/portfolio", icon: PieChart },
  { name: "Positions", to: "/positions", icon: Layers, badge: "5" },
  { name: "AI Agent", to: "/agent", icon: Bot, badge: "AI" },
  { name: "Risk Engine", to: "/risk", icon: ShieldAlert },
  { name: "Trade History", to: "/trades", icon: History },
  { name: "Agent Activity", to: "/activity", icon: Workflow },
  { name: "Settings", to: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-white/10 bg-[#0A0B0E]/60 backdrop-blur-xl flex flex-col justify-between p-4 hidden md:flex shrink-0">
      {/* Primary Navigation List */}
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Terminal Core
          </p>
          <nav className="space-y-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            AI & Risk Protection
          </p>
          <nav className="space-y-1">
            {navItems.slice(4).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] font-semibold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Footer Info / Safeguard notice */}
      <div className="rounded-2xl border border-white/10 bg-[#12141A]/90 p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-white">Paper Safeguard</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          AI trades are sandboxed in Alpaca Paper Trading. Live execution is blocked by hardware assertions.
        </p>
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
          <span>Hackathon v1.0</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online
          </span>
        </div>
      </div>
    </aside>
  );
};
