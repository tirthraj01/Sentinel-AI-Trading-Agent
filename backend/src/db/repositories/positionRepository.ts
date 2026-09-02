import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient.js";
import { store } from "../../services/mockDataStore.js";
import { Position } from "../../types/index.js";

export class PositionRepository {
  public async getPositions(): Promise<Position[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client.from("positions").select("*");
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          symbol: d.symbol,
          name: d.name,
          shares: Number(d.shares),
          avgEntryPrice: Number(d.avg_entry_price),
          currentPrice: Number(d.current_price),
          marketValue: Number(d.market_value),
          unrealizedPL: Number(d.unrealized_pl),
          unrealizedPLPercent: Number(d.unrealized_pl_percent),
          allocationPercent: Number(d.allocation_percent),
          side: d.side,
        }));
      }
    }
    return store.positions;
  }

  public async getPositionBySymbol(symbol: string): Promise<Position | undefined> {
    const sym = symbol.toUpperCase();
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from("positions")
        .select("*")
        .eq("symbol", sym)
        .maybeSingle();

      if (!error && data) {
        return {
          symbol: data.symbol,
          name: data.name,
          shares: Number(data.shares),
          avgEntryPrice: Number(data.avg_entry_price),
          currentPrice: Number(data.current_price),
          marketValue: Number(data.market_value),
          unrealizedPL: Number(data.unrealized_pl),
          unrealizedPLPercent: Number(data.unrealized_pl_percent),
          allocationPercent: Number(data.allocation_percent),
          side: data.side,
        };
      }
    }
    return store.positions.find((p) => p.symbol === sym);
  }

  public async upsertPosition(position: Position): Promise<Position> {
    const sym = position.symbol.toUpperCase();
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      await client.from("positions").upsert(
        {
          symbol: sym,
          name: position.name,
          shares: position.shares,
          avg_entry_price: position.avgEntryPrice,
          current_price: position.currentPrice,
          market_value: position.marketValue,
          unrealized_pl: position.unrealizedPL,
          unrealized_pl_percent: position.unrealizedPLPercent,
          allocation_percent: position.allocationPercent,
          side: position.side,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "symbol" }
      );
    }

    // Always update in-memory store as sync
    const idx = store.positions.findIndex((p) => p.symbol === sym);
    if (idx >= 0) {
      store.positions[idx] = position;
    } else {
      store.positions.push(position);
    }
    return position;
  }
}

export const positionRepository = new PositionRepository();
