import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient.js";
import { store } from "../../services/mockDataStore.js";
import { AgentDecision } from "../../types/index.js";

export class DecisionRepository {
  public async createDecision(decision: AgentDecision): Promise<AgentDecision> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;

      // 1. Insert decision
      await client.from("agent_decisions").insert({
        id: decision.id,
        run_id: decision.runId,
        symbol: decision.symbol,
        decision: decision.decision,
        confidence: decision.confidence,
        reasoning: decision.reasoning,
        suggested_allocation_pct: decision.suggestedAllocationPct,
        suggested_shares: decision.suggestedShares,
        risk_assessment: decision.riskAssessment,
        market_summary: decision.marketSummary,
        news_sentiment: decision.newsSentiment,
        status: decision.status,
        alpaca_order_id: decision.alpacaOrderId,
        created_at: decision.createdAt,
      });

      // 2. Insert nested risk evaluation if present
      if (decision.riskResult) {
        await client.from("risk_evaluations").insert({
          decision_id: decision.id,
          approved: decision.riskResult.approved,
          risk_level: decision.riskResult.riskLevel,
          reasons: decision.riskResult.reasons,
          checks: decision.riskResult.checks,
          evaluated_at: decision.riskResult.evaluatedAt,
        });
      }
    }

    // Always maintain in-memory store
    const existingIndex = store.decisions.findIndex((d) => d.id === decision.id);
    if (existingIndex >= 0) {
      store.decisions[existingIndex] = decision;
    } else {
      store.decisions.unshift(decision);
    }

    return decision;
  }

  public async getDecisions(filters?: {
    symbol?: string;
    limit?: number;
  }): Promise<AgentDecision[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      let query = client
        .from("agent_decisions")
        .select("*, risk_evaluations(*)")
        .order("created_at", { ascending: false });

      if (filters?.symbol) {
        query = query.eq("symbol", filters.symbol.toUpperCase());
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => {
          const riskEval = d.risk_evaluations?.[0];
          return {
            id: d.id,
            runId: d.run_id,
            symbol: d.symbol,
            decision: d.decision,
            confidence: Number(d.confidence),
            reasoning: d.reasoning,
            suggestedAllocationPct: Number(d.suggested_allocation_pct),
            suggestedShares: Number(d.suggested_shares),
            riskAssessment: d.risk_assessment,
            marketSummary: d.market_summary || {},
            newsSentiment: d.news_sentiment || { score: 0.5, headline: "", source: "" },
            status: d.status,
            alpacaOrderId: d.alpaca_order_id,
            createdAt: d.created_at,
            riskResult: riskEval
              ? {
                  approved: riskEval.approved,
                  riskLevel: riskEval.risk_level,
                  reasons: riskEval.reasons || [],
                  checks: riskEval.checks || [],
                  evaluatedAt: riskEval.evaluated_at,
                }
              : undefined,
          };
        });
      }
    }

    let results = [...store.decisions];
    if (filters?.symbol) {
      results = results.filter((d) => d.symbol === filters.symbol?.toUpperCase());
    }
    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }
    return results;
  }
}

export const decisionRepository = new DecisionRepository();
