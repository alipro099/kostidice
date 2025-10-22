import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  const pool = new Pool({ connectionString, ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined });
  pool
    .connect()
    .then((client) => {
      client.release();
      console.log('Connected to PostgreSQL.');
    })
    .catch((error) => {
      console.error('Failed to connect to PostgreSQL:', error.message);
    });
} else {
  console.log('DATABASE_URL is not set. Using in-memory store for MVP.');
}
