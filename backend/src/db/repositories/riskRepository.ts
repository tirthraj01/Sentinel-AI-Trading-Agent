import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient.js";
import { store } from "../../services/mockDataStore.js";
import { RiskRuleConfig } from "../../types/index.js";

export class RiskRepository {
  public async getRiskRules(): Promise<RiskRuleConfig[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client.from("risk_rules").select("*");
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          limit: Number(d.limit_value),
          currentValue: 0,
          unit: d.unit,
          isViolation: false,
        }));
      }
    }
    return store.riskRules;
  }

  public async logAudit(params: {
    eventType: string;
    entityType: string;
    entityId?: string;
    payload?: Record<string, any>;
  }): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      await client.from("audit_logs").insert({
        event_type: params.eventType,
        entity_type: params.entityType,
        entity_id: params.entityId,
        payload: params.payload || {},
      });
    }
  }
}

export const riskRepository = new RiskRepository();
