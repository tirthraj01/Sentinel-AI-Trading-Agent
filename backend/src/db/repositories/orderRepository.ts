import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient.js";
import { store } from "../../services/mockDataStore.js";
import { TradeRecord } from "../../types/index.js";

export class OrderRepository {
  public async createOrder(order: TradeRecord): Promise<TradeRecord> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      await client.from("orders").insert({
        alpaca_order_id: order.alpacaOrderId,
        symbol: order.symbol,
        side: order.side,
        shares: order.shares,
        order_type: order.orderType,
        estimated_price: order.estimatedPrice,
        executed_price: order.executedPrice,
        status: order.status,
        decision_id: order.decisionId,
        submitted_at: order.submittedAt,
        executed_at: order.executedAt,
      });

      if (order.status === "filled") {
        await client.from("trade_history").insert({
          symbol: order.symbol,
          side: order.side,
          shares: order.shares,
          price: order.executedPrice || order.estimatedPrice,
          total_amount: order.shares * (order.executedPrice || order.estimatedPrice),
          executed_at: order.executedAt || order.submittedAt,
        });
      }
    }

    // Always maintain in-memory store
    const existingIndex = store.trades.findIndex((t) => t.id === order.id);
    if (existingIndex >= 0) {
      store.trades[existingIndex] = order;
    } else {
      store.trades.unshift(order);
    }

    return order;
  }

  public async getOrders(filters?: {
    symbol?: string;
    status?: string;
    limit?: number;
  }): Promise<TradeRecord[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      let query = client.from("orders").select("*").order("submitted_at", { ascending: false });

      if (filters?.symbol) {
        query = query.eq("symbol", filters.symbol.toUpperCase());
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          alpacaOrderId: d.alpaca_order_id,
          symbol: d.symbol,
          side: d.side,
          shares: Number(d.shares),
          orderType: d.order_type,
          estimatedPrice: Number(d.estimated_price || d.limit_price || 0),
          executedPrice: d.executed_price ? Number(d.executed_price) : undefined,
          status: d.status,
          submittedAt: d.submitted_at,
          executedAt: d.executed_at,
          decisionId: d.decision_id,
        }));
      }
    }

    let results = [...store.trades];
    if (filters?.symbol) {
      results = results.filter((t) => t.symbol === filters.symbol?.toUpperCase());
    }
    if (filters?.status) {
      results = results.filter((t) => t.status === filters.status);
    }
    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }
    return results;
  }
}

export const orderRepository = new OrderRepository();
