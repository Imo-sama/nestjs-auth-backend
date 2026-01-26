import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Cursor blocks writing .env files; use an env var if you have one,
    // otherwise fall back to a local SQLite file.
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
});
