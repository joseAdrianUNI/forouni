import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { env } from "./env";

/**
 * Pool único de conexiones reutilizado en toda la aplicación.
 * Evita abrir/cerrar una conexión por cada request.
 */
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.pgSsl ? { rejectUnauthorized: false } : undefined,
  max: 10, // conexiones simultáneas máximas
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  // Errores en clientes ociosos del pool (no deben tumbar el proceso silenciosamente)
  // eslint-disable-next-line no-console
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});

/**
 * Helper de conveniencia para ejecutar queries parametrizadas
 * sin repetir pool.query en cada repositorio.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params as never[]);

  if (env.nodeEnv !== "production") {
    const duration = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log("[db]", { text, duration, rows: result.rowCount });
  }

  return result;
}

/**
 * Verifica la conexión al iniciar el servidor (falla rápido si la DB no responde).
 */
export async function assertDbConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("select 1");
  } finally {
    client.release();
  }
}
