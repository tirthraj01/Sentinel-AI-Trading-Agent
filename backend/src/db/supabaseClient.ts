import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

let supabaseInstance: SupabaseClient | null = null;
let isConfigured = false;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("your-project")
) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
    isConfigured = true;
    console.log("⚡ Supabase PostgreSQL Client successfully initialized.");
  } catch (error) {
    console.warn("⚠️ Failed to initialize Supabase client. Defaulting to In-Memory Fallback:", error);
    supabaseInstance = null;
    isConfigured = false;
  }
} else {
  console.log(
    "ℹ️  SUPABASE_URL not configured or using placeholder. Running in resilient IN-MEMORY FALLBACK mode."
  );
}

export const getSupabaseClient = (): SupabaseClient | null => supabaseInstance;
export const isSupabaseConfigured = (): boolean => isConfigured;
