import { pool } from "../lib/db";
import { DBUserRow, DBUserWithPasswordRow, User } from "../types/user.types";

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query<DBUserRow>(
    `SELECT id, email, role, created_at FROM users WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
};

export const createUser = async (
  email: string,
  passwordHash: string,
): Promise<User | null> => {
  const result = await pool.query<DBUserWithPasswordRow>(
    `INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, role, created_at`,
    [email, passwordHash],
  );

  return result.rows[0] ?? null;
};

export const findUserByEmailWithPassword = async (
  email: string,
): Promise<DBUserWithPasswordRow | null> => {
  const result = await pool.query<DBUserWithPasswordRow>(
    `SELECT id, email, password_hash, role, created_at
    FROM users WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
};

export const findUserByGoogleId = async (
  googleId: string,
): Promise<User | null> => {
  const result = await pool.query<DBUserRow>(
    `SELECT id, email, role, created_at
    FROM users WHERE google_id = $1`,
    [googleId],
  );

  return result.rows[0] ?? null;
};

export const linkGoogleIdToUser = async (
  userId: string,
  googleId: string,
): Promise<User> => {
  const result = await pool.query<DBUserRow>(
    `UPDATE users
    SET google_id = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, email, role, google_id, updated_at`,
    [googleId, userId],
  );

  return result.rows[0];
};

export const createGoogleUser = async (
  email: string,
  googleId: string,
): Promise<User> => {
  const result = await pool.query<DBUserRow>(
    `INSERT into users (email, google_id)
    VALUES ($1, $2)
    RETURNING id, email, role, google_id, created_at`,
    [email, googleId],
  );

  return result.rows[0];
};
