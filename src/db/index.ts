import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://firozmohammad@localhost:5432/callagent";

// In Next.js hot-reload environment, reuse the connection
declare global {
  var _pgClient: ReturnType<typeof postgres> | undefined;
}

const client =
  global._pgClient ||
  postgres(connectionString, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
export default db;
