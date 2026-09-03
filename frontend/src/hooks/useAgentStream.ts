import { useState, useEffect } from "react";
import { AgentActivityEvent } from "../types";
import { api } from "../services/api";
import { MOCK_ACTIVITIES } from "../data/mockData";

export function useAgentStream(limit = 20) {
  const [activities, setActivities] = useState<AgentActivityEvent[]>(MOCK_ACTIVITIES);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    // Initial fetch from backend REST API
    api.getAgentActivity(limit).then((data) => {
      setActivities(data);
    });

    // Establish SSE stream
    const sseUrl = "/api/agent/stream";
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "AGENT_EVENT" && payload.data) {
          const newEvent: AgentActivityEvent = {
            id: payload.data.id,
            runId: payload.data.runId || "live-stream",
            timestamp: payload.data.timestamp,
            stage: payload.data.stage,
            title: payload.data.title,
            message: payload.data.message,
            status: payload.data.status,
          };
          setActivities((prev) => [newEvent, ...prev.slice(0, limit - 1)]);
        }
      } catch {
        // Heartbeat or malformed
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [limit]);

  return { activities, connected };
}
