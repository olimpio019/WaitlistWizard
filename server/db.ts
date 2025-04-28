import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("ERRO: DATABASE_URL não está definida no ambiente");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Verificar a conexão com o banco de dados
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// Testar a conexão
pool.connect()
  .then(() => {
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso");
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
    process.exit(1);
  });

export const db = drizzle(pool, { schema });
