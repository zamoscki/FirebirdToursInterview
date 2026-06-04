import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations/migrations.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: "firebird.db",
  }
} satisfies Config;
