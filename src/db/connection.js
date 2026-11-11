// @ts-check

import 'dotenv/config';
import pg from 'pg';

const { Client, types } = pg; // CommonJS library

/*
 * Prisma stores UTC values in `timestamp without time zone` (OID 1114).
 * By default `pg` reads a value without a time zone as the local time of the machine:
 * with UTC+3 and the date would be 3 hours off in UTC.
 * 'Z' is added, so the value is read as UTC and equals the date sent to the API.
 */
types.setTypeParser(types.builtins.TIMESTAMP, (value) =>
  value === null ? null : new Date(`${value.replace(' ', 'T')}Z`),
);

const REQUIRED_ENV = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
];

/**
 * Creates a client of the stand database and connects it.
 *
 * @returns {Promise<pg.Client>} The connected client. Close it with `end()`.
 * @throws {Error} If a connection variable is missing.
 */
export async function connectDb() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(
      `Database variables must be provided in the environment: ${missing.join(', ')}.`,
    );
  }

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await client.connect();

  return client;
}
