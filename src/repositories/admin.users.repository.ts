import { pool } from "../lib/db";
import { DBUserRow, User } from "../types/user.types";

export const getUsers = async (): Promise<User[] | null> => {
  const result = await pool.query<DBUserRow>(
    `SELECT id, email, role, created_at
    FROM users
    ORDER BY created_at DESC`,
  );

  return result.rows ?? null;
};
