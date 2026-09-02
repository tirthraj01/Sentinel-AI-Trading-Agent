import { isSupabaseConfigured, getSupabaseClient } from "./supabaseClient.js";
import { positionRepository } from "./repositories/positionRepository.js";
import { orderRepository } from "./repositories/orderRepository.js";
import { decisionRepository } from "./repositories/decisionRepository.js";

export async function verifyDatabaseLayer(): Promise<{
  supabaseConfigured: boolean;
  positionsCount: number;
  ordersCount: number;
  decisionsCount: number;
}> {
  console.log("🔍 Checking Database / Repository Layer Status...");

  const supabaseConfigured = isSupabaseConfigured();
  console.log(`📡 Supabase Configured: ${supabaseConfigured ? "YES (Live PostgreSQL)" : "NO (In-Memory Fallback Mode)"}`);

  const positions = await positionRepository.getPositions();
  const orders = await orderRepository.getOrders();
  const decisions = await decisionRepository.getDecisions();

  console.log(`📊 Retrieved: ${positions.length} positions, ${orders.length} orders, ${decisions.length} decisions.`);

  return {
    supabaseConfigured,
    positionsCount: positions.length,
    ordersCount: orders.length,
    decisionsCount: decisions.length,
  };
}
