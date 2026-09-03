import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { ToastProvider } from "./context/ToastContext";
import { DashboardPage } from "./pages/DashboardPage";
import { MarketsPage } from "./pages/MarketsPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { PositionsPage } from "./pages/PositionsPage";
import { AIAgentPage } from "./pages/AIAgentPage";
import { RiskPage } from "./pages/RiskPage";
import { TradeHistoryPage } from "./pages/TradeHistoryPage";
import { AgentActivityPage } from "./pages/AgentActivityPage";
import { SettingsPage } from "./pages/SettingsPage";

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="markets" element={<MarketsPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="positions" element={<PositionsPage />} />
            <Route path="agent" element={<AIAgentPage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="trades" element={<TradeHistoryPage />} />
            <Route path="activity" element={<AgentActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
