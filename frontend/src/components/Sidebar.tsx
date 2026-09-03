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
  ChevronLeft,
  ChevronRight,
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

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile,
}) => {
  return (
    <aside
      className={`terminal-sidebar border-r border-cyan-500/10 flex flex-col justify-between p-3.5 transition-all duration-300 relative select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Primary Navigation List */}
      <div className="space-y-6">
        {/* Collapse Button (Desktop Only) */}
        {onToggleCollapse && (
          <div className="hidden md:flex justify-end pb-1">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Terminal Core
            </p>
          )}
          <nav className="space-y-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isCollapsed ? "justify-center px-2" : "justify-between px-3"
                    } py-2 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-cyan-500/12 text-cyan-200 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.10)]"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
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
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              AI & Risk Protection
            </p>
          )}
          <nav className="space-y-1">
            {navItems.slice(4).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isCollapsed ? "justify-center px-2" : "justify-between px-3"
                    } py-2 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-cyan-500/12 text-cyan-200 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.10)]"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold">
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
      {!isCollapsed ? (
        <div className="rounded-2xl border border-white/10 bg-[#12141A]/90 p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Paper Safeguard</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Trades are executed in Alpaca paper sandbox. Live capital is strictly locked.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Sentinel Core v1.0</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center p-2" title="Paper Safeguard Active">
          <Shield className="h-4 w-4 text-emerald-400" />
        </div>
      )}
    </aside>
  );
};
