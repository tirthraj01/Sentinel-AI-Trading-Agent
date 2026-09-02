# SENTINEL — Hackathon Demo Script & Judge Walkthrough

---

## 1. Demo Narrative: "The Hero Moment"

In most AI hackathon submissions, an LLM is connected directly to a trading API. If the LLM makes a mistake, money is lost. 

In SENTINEL, our hero moment is demonstrating that **when the AI hallucinates or tries to make an unsafe trade, the Risk Engine steps in and blocks it.**

---

## 2. Step-by-Step Live Demo Flow

### Act 1: The Command Center (30 seconds)
1. Open the SENTINEL frontend at `http://localhost:5173`.
2. Highlight the **Web3 dark aesthetic**: clean typography, luminous status badges, and large financial figures.
3. Show the **Paper Trading Badge** (reassuring judges that live funds are never at risk).
4. Review the Portfolio Overview: Total Equity, Cash, Day's P/L, and open positions.

### Act 2: Scenario A — The Explainable Approved Trade (60 seconds)
1. Navigate to **Markets** or the **Dashboard Analysis Box**.
2. Enter ticker `AAPL` and click **"Run Sentinel Agent"**.
3. Watch the **Agent Transparency Feed** illuminate in real-time:
   * `[09:41:02]` Live quotes and candlestick bars gathered.
   * `[09:41:04]` Recent news headlines analyzed (Sentiment: `+0.74`).
   * `[09:41:05]` Portfolio checked ($50,000 cash, 4% existing AAPL).
   * `[09:41:06]` AI Recommendation: **BUY** (Confidence: **84%**).
   * `[09:41:07]` Risk Engine evaluates rules:
     * Exposure check: **PASS** (4% + 3% = 7% <= 10%)
     * Confidence check: **PASS** (84% >= 70%)
     * Cash check: **PASS** ($3,000 <= $50,000)
   * `[09:41:08]` **Trade APPROVED** for Alpaca Paper Execution.
   * `[09:41:09]` Paper order submitted to Alpaca. Order ID returned: `ord_alpaca_7a8b9c`.
4. Refresh Positions table to show the new paper shares.

### Act 3: Scenario B — The Blocked Trade (The Veto) (60 seconds)
1. Now select `TSLA` (or a stock where the user already holds 9% allocation).
2. Ask the Agent to analyze `TSLA` with a proposal to buy $3,000 more shares.
3. The AI model outputs: **BUY**, citing technical momentum.
4. The proposal hits the **Deterministic Risk Engine**:
   * Proposed total exposure: **14.5%**.
   * Max allowable exposure: **10.0%**.
5. The Risk Engine returns: **BLOCKED**.
6. Display the **Red Alert Card**:
   > *"Trade Blocked by Sentinel Risk Engine: Maximum Position Exposure Exceeded (14.5% > 10.0%)."*
7. Show that:
   * **Zero calls** were dispatched to Alpaca's order endpoint.
   * A full audit record was stored in `risk_events`.
   * The capital remains protected.

---

## 3. The 60-Second Hackathon Elevator Pitch

> *"Most autonomous trading agents today have a fatal flaw: they let probabilistic AI models make unconstrained financial decisions. When models hallucinate, investors lose.*  
>  
> *Meet **SENTINEL**: an explainable, risk-aware AI trading agent built on Alpaca Paper Trading and the Model Context Protocol.*  
>  
> *SENTINEL's core philosophy is simple: **AI proposes, but a deterministic risk engine decides.** The AI analyzes real-time market data, technical indicators, and news sentiment to generate hypothesis-driven proposals with clear rationales and confidence scores. But before any order can touch Alpaca, our isolated risk engine evaluates hard mathematical constraints: exposure limits, daily loss circuits, and minimum confidence floors.*  
>  
> *If the AI recommends an unsafe trade, the Risk Engine vetoes it instantly. Every thought, check, and paper execution is audited in real-time. SENTINEL brings institutional discipline to autonomous agentic finance."*
