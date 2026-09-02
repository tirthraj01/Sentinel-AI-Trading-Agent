import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { AnalysisModal } from "../components/AnalysisModal";
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  Bot,
  ShieldAlert,
} from "lucide-react";

export const AppLayout: React.FC = () => {
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedSymbolForAnalysis, setSelectedSymbolForAnalysis] = useState("NVDA");

  const handleOpenAnalysis = (symbol: string = "NVDA") => {
    setSelectedSymbolForAnalysis(symbol);
    setIsAnalysisModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 flex flex-col">
      {/* Sticky Top Header */}
      <Navbar onOpenAnalysisModal={() => handleOpenAnalysis("NVDA")} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet context={{ onOpenAnalysis: handleOpenAnalysis }} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1015]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around py-2 px-3">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-indigo-400 font-bold" : "text-slate-400"
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/markets"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-indigo-400 font-bold" : "text-slate-400"
            }`
          }
        >
          <TrendingUp className="h-4 w-4" />
          <span>Markets</span>
        </NavLink>
        <NavLink
          to="/positions"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-indigo-400 font-bold" : "text-slate-400"
            }`
          }
        >
          <Layers className="h-4 w-4" />
          <span>Positions</span>
        </NavLink>
        <NavLink
          to="/agent"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-indigo-400 font-bold" : "text-slate-400"
            }`
          }
        >
          <Bot className="h-4 w-4" />
          <span>AI Agent</span>
        </NavLink>
        <NavLink
          to="/risk"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-indigo-400 font-bold" : "text-slate-400"
            }`
          }
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Risk</span>
        </NavLink>
      </nav>

      {/* Global Interactive Analysis Modal */}
      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        initialSymbol={selectedSymbolForAnalysis}
      />
    </div>
  );
};
