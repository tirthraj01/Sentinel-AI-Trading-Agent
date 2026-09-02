import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient.js";
import { store } from "../../services/mockDataStore.js";
import { AgentActivityEvent } from "../../types/index.js";

export class ActivityRepository {
  public async logActivity(event: AgentActivityEvent): Promise<AgentActivityEvent> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      await client.from("agent_logs").insert({
        id: event.id,
        run_id: event.runId,
        stage: event.stage,
        title: event.title,
        message: event.message,
        status: event.status,
        details: event.details || {},
        created_at: event.timestamp,
      });
    }

    // Always record in memory store
    store.activities.unshift(event);
    return event;
  }

  public async getActivities(limit = 20): Promise<AgentActivityEvent[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from("agent_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          runId: d.run_id,
          stage: d.stage,
          title: d.title,
          message: d.message,
          status: d.status,
          details: d.details,
          timestamp: d.created_at,
        }));
      }
    }

    return store.activities.slice(0, limit);
  }
}

export const activityRepository = new ActivityRepository();
