// Punto de entrada del schema Drizzle.
// Exporta TODAS las tablas para que drizzle-kit las encuentre.
export * from "@server/modules/identity/infrastructure/db/auth.schema";
export * from "@server/modules/identity/infrastructure/db/profile.schema";
export * from "./domain.schema";
