import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { SentinelMascot } from "./SentinelMascot";
import { AIChatMessage } from "../types";
import {
  MOCK_PORTFOLIO,
  MOCK_POSITIONS,
  MOCK_TRADES,
} from "../data/mockData";
import { api } from "../services/api";

interface AskSentinelChatProps {
  onOpenAnalysis?: (symbol: string) => void;
}

const suggestedPrompts = [
  "Analyze my portfolio",
  "Explain my risk",
  "Analyze NVDA",
  "Why is AAPL approaching the risk limit?",
  "Show my portfolio allocation",
  "Why was the last trade blocked?",
];

export const AskSentinelChat: React.FC<AskSentinelChatProps> = ({ onOpenAnalysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "msg-1",
      sender: "sentinel",
      text: "Greetings, Trader. I am Sentinel, your AI-native guardian and risk surveillance agent. I monitor your portfolio health, market sentiment, and deterministic risk boundaries 24/7. How can I assist your strategy today?",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Intelligent frontend response generator using mock data
  const generateMockResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("cash") || q.includes("buying power") || q.includes("paper cash")) {
      return `Your current available paper cash is **$${MOCK_PORTFOLIO.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}** (representing 40.1% liquidity), with total paper buying power of **$${MOCK_PORTFOLIO.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}**. All funds are safely sandboxed in Alpaca Paper Trading.`;
    }

    if (q.includes("largest position") || q.includes("biggest position")) {
      const largestSingle = [...MOCK_POSITIONS].sort((a, b) => b.marketValue - a.marketValue)[0];
      return `Your largest single equity holding is **${largestSingle.symbol}** (${largestSingle.name}) at **$${largestSingle.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}**, which represents **${largestSingle.allocationPercent.toFixed(1)}%** of total portfolio equity. Note: SPDR ETF (SPY) also holds 26.4% as your core index benchmark.`;
    }

    if (q.includes("aapl") && (q.includes("limit") || q.includes("risk") || q.includes("approaching"))) {
      return `**AAPL Exposure Notice:** Apple currently accounts for **8.72%** of your total portfolio ($9,146.00). Under Sentinel's deterministic risk rules, the hard ceiling for any single asset is **10.0%**. Because you are within 1.28% of this threshold, any new BUY proposal will trigger elevated scrutiny and will likely be vetoed by the Risk Engine to prevent over-concentration.`;
    }

    if (q.includes("blocked") || q.includes("last trade") || q.includes("tsla")) {
      const blockedTrade = MOCK_TRADES.find((t) => t.status === "blocked");
      return `The last blocked trade was a BUY proposal for **${blockedTrade?.symbol || "TSLA"}** (30 shares at $242.80). The Sentinel Risk Engine intercepted and vetoed it for two reasons:\n1. **AI Conviction**: Confidence was 68.0% (below our strict 70.0% floor).\n2. **Single Trade Size**: Proposed 6.8% allocation exceeded the 5.0% single-trade limit.\nZero orders were submitted to Alpaca.`;
    }

    if (q.includes("portfolio") || q.includes("analyze my portfolio") || q.includes("performance")) {
      return `**Portfolio Health Summary:**\n• **Total Equity:** $${MOCK_PORTFOLIO.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n• **Day's P/L:** +${MOCK_PORTFOLIO.dailyPLPercent}% (+$${MOCK_PORTFOLIO.dailyPL.toFixed(2)})\n• **All-Time Gain:** +${MOCK_PORTFOLIO.totalPLPercent}%\n• **Risk Posture:** SAFE (All single assets below the 10.0% ceiling, daily loss 0.0% vs 2.0% circuit breaker).`;
    }

    if (q.includes("nvda") || q.includes("nvidia")) {
      return `**NVDA (NVIDIA Corp) Analysis:**\n• Current Price: $128.90 (+3.33% today)\n• AI Recommendation: **BUY** (86% Confidence)\n• Rationale: Strong institutional datacenter accumulation and positive news sentiment (+82%).\n• Risk Check: Approved (7.99% exposure < 10.0% ceiling).`;
    }

    if (q.includes("risk") || q.includes("explain my risk") || q.includes("rules")) {
      return `Sentinel enforces 6 mathematical safety rules that **cannot be overridden by the AI**:\n1. **Max Position Exposure:** 10.0% per ticker\n2. **Max Single Trade Allocation:** 5.0%\n3. **Daily Loss Circuit Breaker:** 2.0% max drawdown\n4. **Min AI Confidence:** 70.0% floor\n5. **Max Daily Trades:** 10 executions\n6. **Max Sector Exposure:** 40.0%`;
    }

    if (q.includes("allocation") || q.includes("breakdown")) {
      return `Your current capital distribution is:\n• **USD Cash:** 40.1% ($42,120.80)\n• **SPY Index:** 26.4% ($27,637.50)\n• **AAPL:** 8.7% ($9,146.00)\n• **MSFT:** 8.6% ($8,965.00)\n• **NVDA:** 8.0% ($8,378.50)\n• **AMZN:** 6.3% ($6,604.50)`;
    }

    return `I evaluated your request against current market telemetry and portfolio state. You have **5 open positions** totaling $62,729.45 and **$42,120.80** in cash. All risk parameters are compliant. Would you like me to launch an automated agent scan for a specific ticker like NVDA or AAPL?`;
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMessage: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await api.askSentinel(query);
      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "sentinel",
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "sentinel",
        text: generateMockResponse(query),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 pl-3 pr-4 py-2.5 text-xs font-bold text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 group"
          title="Ask Sentinel AI"
        >
          <SentinelMascot size="sm" state="idle" glow={false} />
          <span>ASK SENTINEL</span>
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Slide-over Chat Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[560px] rounded-3xl bg-[#0E1016] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-[#12141A] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SentinelMascot size="sm" state={isTyping ? "analyzing" : "idle"} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white text-xs">
                    SENTINEL ASSISTANT
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Risk-aware portfolio & strategy intelligence
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "sentinel" && (
                  <div className="shrink-0 mt-0.5">
                    <SentinelMascot size="xs" state="idle" glow={false} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-[#181B24] border border-white/5 text-slate-200"
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  {m.sender === "sentinel" && onOpenAnalysis && (m.text.includes("NVDA") || m.text.includes("AAPL")) && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onOpenAnalysis(m.text.includes("NVDA") ? "NVDA" : "AAPL");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-2 py-1 text-[10px] font-bold transition-all"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Launch Simulation for {m.text.includes("NVDA") ? "NVDA" : "AAPL"}</span>
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 font-mono block mt-1 text-right">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-8">
                <div className="flex space-x-1">
                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[11px] font-mono text-indigo-300">
                  Sentinel is evaluating telemetry...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-3 py-2 bg-[#12141A]/60 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {suggestedPrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => { void handleSend(prompt); }}
                className="text-[10px] whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 px-2.5 py-1 rounded-full transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#12141A] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Sentinel anything about risk or markets..."
                className="flex-1 bg-[#0A0B0E] border border-white/10 rounded-2xl py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="h-8 w-8 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 flex items-center justify-center text-white transition-all shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
