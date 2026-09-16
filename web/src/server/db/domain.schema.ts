/**
 * Drizzle schema para las tablas que NO genera Better Auth.
 * Las tablas de Better Auth (user, session, account, verification)
 * se generan con `npx @better-auth/cli generate` y viven en:
 *   src/server/modules/identity/infrastructure/db/auth.schema.ts
 *
 * REGLA DE DUEÑO:
 *   - portfolio, portfolio_candidate, chat_message → dueño: Next.js (este archivo)
 *   - asset, price_history, optimization_*, lstm_*, backtest_* → dueño: ml-service (SQLAlchemy)
 *     PERO se declaran aquí para que Drizzle los cree en Supabase y
 *     Next.js pueda LEER de ellas (con relaciones FK).
 */
import { relations } from "drizzle-orm";
import {
  bigint,
  date,
  decimal,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// La tabla `user` la genera Better Auth — usamos su export para las FKs
import { user } from "@server/modules/identity/infrastructure/db/auth.schema";

// ---------------------------------------------------------------------------
// Market Data (dueño: ml-service, creada por Drizzle para compartir)
// ---------------------------------------------------------------------------

export const assetTable = pgTable("asset", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticker: varchar("ticker", { length: 20 }).unique().notNull(),
  name: varchar("name", { length: 255 }),
  assetType: varchar("asset_type", { length: 50 }),
  exchange: varchar("exchange", { length: 50 }),
  currency: varchar("currency", { length: 10 }),
});

export const priceHistoryTable = pgTable("price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id")
    .references(() => assetTable.id)
    .notNull(),
  date: date("date").notNull(),
  open: decimal("open", { precision: 18, scale: 6 }),
  high: decimal("high", { precision: 18, scale: 6 }),
  low: decimal("low", { precision: 18, scale: 6 }),
  close: decimal("close", { precision: 18, scale: 6 }).notNull(),
  adjClose: decimal("adj_close", { precision: 18, scale: 6 }),
  volume: bigint("volume", { mode: "number" }),
  source: varchar("source", { length: 30 }).notNull(), // "yfinance" | "alpha_vantage"
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
});

// ---------------------------------------------------------------------------
// Portfolio (dueño: Next.js)
// ---------------------------------------------------------------------------

export const portfolioTable = pgTable("portfolio", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => user.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  capital: decimal("capital", { precision: 18, scale: 2 }),
  riskAversionLambda: decimal("risk_aversion_lambda", { precision: 8, scale: 4 }),
  maxAssets: integer("max_assets"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const portfolioCandidateTable = pgTable("portfolio_candidate", {
  id: uuid("id").primaryKey().defaultRandom(),
  portfolioId: uuid("portfolio_id")
    .references(() => portfolioTable.id)
    .notNull(),
  assetId: uuid("asset_id")
    .references(() => assetTable.id)
    .notNull(),
  minWeight: decimal("min_weight", { precision: 6, scale: 4 }),
  maxWeight: decimal("max_weight", { precision: 6, scale: 4 }),
});

// ---------------------------------------------------------------------------
// Optimization (dueño: ml-service — declaradas aquí para Drizzle y para lectura en Next.js)
// ---------------------------------------------------------------------------

export const optimizationRunTable = pgTable("optimization_run", {
  id: uuid("id").primaryKey().defaultRandom(),
  portfolioId: uuid("portfolio_id")
    .references(() => portfolioTable.id)
    .notNull(),
  algorithm: varchar("algorithm", { length: 10 }).notNull(), // "ga" | "pso" | "de"
  status: varchar("status", { length: 20 }).notNull(),        // "pending" | "running" | "done" | "error"
  params: jsonb("params"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const optimizationResultTable = pgTable("optimization_result", {
  id: uuid("id").primaryKey().defaultRandom(),
  optimizationRunId: uuid("optimization_run_id")
    .references(() => optimizationRunTable.id)
    .notNull(),
  assetId: uuid("asset_id")
    .references(() => assetTable.id)
    .notNull(),
  weight: decimal("weight", { precision: 8, scale: 6 }).notNull(),
});

// ---------------------------------------------------------------------------
// LSTM (dueño: ml-service)
// ---------------------------------------------------------------------------

export const lstmModelTable = pgTable("lstm_model", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: varchar("version", { length: 50 }).notNull(),
  hyperparameters: jsonb("hyperparameters"),
  metrics: jsonb("metrics"),
  trainingWindowStart: date("training_window_start"),
  trainingWindowEnd: date("training_window_end"),
  trainedAt: timestamp("trained_at", { withTimezone: true }).notNull(),
});

export const lstmPredictionTable = pgTable("lstm_prediction", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id")
    .references(() => assetTable.id)
    .notNull(),
  lstmModelId: uuid("lstm_model_id")
    .references(() => lstmModelTable.id)
    .notNull(),
  predictionDate: date("prediction_date").notNull(),
  horizonDays: integer("horizon_days").notNull(),
  predictedReturn: decimal("predicted_return", { precision: 10, scale: 6 }),
  predictedRisk: decimal("predicted_risk", { precision: 10, scale: 6 }),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
});

// ---------------------------------------------------------------------------
// Backtesting (dueño: ml-service)
// ---------------------------------------------------------------------------

export const backtestTable = pgTable("backtest", {
  id: uuid("id").primaryKey().defaultRandom(),
  optimizationRunId: uuid("optimization_run_id")
    .references(() => optimizationRunTable.id)
    .notNull(),
  benchmarkType: varchar("benchmark_type", { length: 30 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  sharpe: decimal("sharpe", { precision: 10, scale: 6 }),
  sortino: decimal("sortino", { precision: 10, scale: 6 }),
  maxDrawdown: decimal("max_drawdown", { precision: 10, scale: 6 }),
  cumulativeReturn: decimal("cumulative_return", { precision: 10, scale: 6 }),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
});

export const backtestEquityPointTable = pgTable("backtest_equity_point", {
  id: uuid("id").primaryKey().defaultRandom(),
  backtestId: uuid("backtest_id")
    .references(() => backtestTable.id)
    .notNull(),
  date: date("date").notNull(),
  portfolioValue: decimal("portfolio_value", { precision: 18, scale: 4 }).notNull(),
});

// ---------------------------------------------------------------------------
// Chat / Assistant (dueño: Next.js)
// ---------------------------------------------------------------------------

export const chatMessageTable = pgTable("chat_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => user.id)
    .notNull(),
  portfolioId: uuid("portfolio_id").references(() => portfolioTable.id),
  role: varchar("role", { length: 20 }).notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  contextSnapshot: jsonb("context_snapshot"), // resultados de optimización relevantes al mensaje
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relaciones Drizzle (para joins tipados)
// ---------------------------------------------------------------------------

export const portfolioRelations = relations(portfolioTable, ({ many }) => ({
  candidates: many(portfolioCandidateTable),
  runs: many(optimizationRunTable),
  messages: many(chatMessageTable),
}));

export const portfolioCandidateRelations = relations(portfolioCandidateTable, ({ one }) => ({
  portfolio: one(portfolioTable, {
    fields: [portfolioCandidateTable.portfolioId],
    references: [portfolioTable.id],
  }),
  asset: one(assetTable, {
    fields: [portfolioCandidateTable.assetId],
    references: [assetTable.id],
  }),
}));

export const optimizationRunRelations = relations(optimizationRunTable, ({ one, many }) => ({
  portfolio: one(portfolioTable, {
    fields: [optimizationRunTable.portfolioId],
    references: [portfolioTable.id],
  }),
  results: many(optimizationResultTable),
  backtests: many(backtestTable),
}));

export const backtestRelations = relations(backtestTable, ({ one, many }) => ({
  run: one(optimizationRunTable, {
    fields: [backtestTable.optimizationRunId],
    references: [optimizationRunTable.id],
  }),
  equityPoints: many(backtestEquityPointTable),
}));
