import { EventEmitter } from "events";
import { Response } from "express";
import { AgentActivityEvent } from "../types/index.js";

class SentinelEventBus extends EventEmitter {
  private clients: Set<Response> = new Set();

  constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Registers a client connection for Server-Sent Events (SSE)
   */
  public registerClient(res: Response): () => void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    // Initial connection acknowledgement
    res.write(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: new Date().toISOString() })}\n\n`);

    this.clients.add(res);

    // Heartbeat ping interval
    const interval = setInterval(() => {
      if (!res.writableEnded) {
        res.write(": heartbeat\n\n");
      }
    }, 15000);

    const cleanup = () => {
      clearInterval(interval);
      this.clients.delete(res);
    };

    res.on("close", cleanup);
    res.on("error", cleanup);

    return cleanup;
  }

  /**
   * Broadcasts an agent activity event in real-time to all connected SSE clients
   */
  public broadcastAgentEvent(event: AgentActivityEvent): void {
    const payload = JSON.stringify({
      type: "AGENT_EVENT",
      data: event,
    });

    for (const client of this.clients) {
      if (!client.writableEnded) {
        client.write(`data: ${payload}\n\n`);
      }
    }

    this.emit("agentEvent", event);
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export const eventBus = new SentinelEventBus();
