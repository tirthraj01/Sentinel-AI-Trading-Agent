import { z } from "zod";

export const AnalyzeRequestSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(6, "Symbol cannot exceed 6 characters")
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => /^[A-Z]+$/.test(val), {
      message: "Symbol must contain only alphabetic characters",
    }),
  forceScenario: z
    .enum(["APPROVED", "BLOCKED", "AUTO"])
    .optional()
    .default("AUTO"),
});

export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;

export const CreateTradeRequestSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(6, "Symbol cannot exceed 6 characters")
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => /^[A-Z]+$/.test(val), {
      message: "Symbol must contain only alphabetic characters",
    }),
  side: z.enum(["BUY", "SELL"], {
    errorMap: () => ({ message: "Side must be either 'BUY' or 'SELL'" }),
  }),
  shares: z
    .number()
    .int("Shares must be an integer")
    .positive("Shares must be greater than zero"),
  orderType: z.enum(["market", "limit"]).default("market"),
  limitPrice: z.number().positive("Limit price must be greater than zero").optional(),
});

export type CreateTradeRequestInput = z.infer<typeof CreateTradeRequestSchema>;

export const PaginationQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: "Limit must be a number between 1 and 100",
    }),
  symbol: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().toUpperCase() : undefined)),
  status: z.string().optional(),
});
