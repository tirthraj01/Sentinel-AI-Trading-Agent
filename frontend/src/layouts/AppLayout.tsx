import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { AnalysisModal } from "../components/AnalysisModal";
import { AskSentinelChat } from "../components/AskSentinelChat";
import { BackendHealthBanner } from "../components/BackendHealthBanner";
import { KeyboardShortcutsModal } from "../components/KeyboardShortcutsModal";
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  Bot,
  ShieldAlert,
  X,
} from "lucide-react";

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedSymbolForAnalysis, setSelectedSymbolForAnalysis] = useState("NVDA");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const handleOpenAnalysis = (symbol: string = "NVDA") => {
    setSelectedSymbolForAnalysis(symbol);
    setIsAnalysisModalOpen(true);
  };

  // Global Keyboard Shortcuts (1-8, /, Escape, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      if (e.key === "Escape") {
        setIsAnalysisModalOpen(false);
        setIsMobileMenuOpen(false);
        setIsShortcutsModalOpen(false);
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        return;
      }

      switch (e.key) {
        case "1":
          navigate("/");
          break;
        case "2":
          navigate("/markets");
          break;
        case "3":
          navigate("/portfolio");
          break;
        case "4":
          navigate("/positions");
          break;
        case "5":
          navigate("/agent");
          break;
        case "6":
          navigate("/activity");
          break;
        case "7":
          navigate("/risk");
          break;
        case "8":
          navigate("/trades");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 flex flex-col relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Offline Alert Banner */}
      <BackendHealthBanner />

      {/* Sticky Top Header */}
      <Navbar
        onOpenAnalysisModal={() => handleOpenAnalysis("NVDA")}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Mobile Slide-out Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-xs bg-[#0E1015] border-r border-white/10 p-4 flex flex-col justify-between z-10 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className="font-mono font-bold text-white text-xs">NAVIGATION</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
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

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Floating AI Assistant Chat Panel */}
      <AskSentinelChat onOpenAnalysis={handleOpenAnalysis} />
    </div>
  );
};
