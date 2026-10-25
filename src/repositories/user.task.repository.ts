import { pool } from "../lib/db";
import { DBTaskRow, Task } from "../types/task.types";

export const createTask = async (
  userId: string,
  title: string,
): Promise<Task> => {
  const result = await pool.query<DBTaskRow>(
    `INSERT INTO support_tasks (user_id, title)
    VALUES ($1, $2)
    RETURNING id, title, status, user_id, created_at, updated_at`,
    [userId, title],
  );

  return result.rows[0] ?? null;
};

export const getTasksByUserId = async (
  userId: string,
): Promise<Task[] | null> => {
  const result = await pool.query<DBTaskRow>(
    `SELECT id, title, status, user_id, created_at, updated_at
    FROM support_tasks WHERE user_id = $1
    ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows ?? null;
};

export const getTaskByIdAndUserId = async (
  taskId: string,
  userId: string,
): Promise<Task | null> => {
  const result = await pool.query<DBTaskRow>(
    `SELECT id, title, status, user_id, created_at, updated_at
    FROM support_tasks WHERE id = $1 AND user_id = $2`,
    [taskId, userId],
  );

  return result.rows[0] ?? null;
};

export const updateTaskTitle = async (
  taskId: string,
  userId: string,
  title: string,
): Promise<Task | null> => {
  const result = await pool.query<DBTaskRow>(
    `UPDATE support_tasks
    SET title = $1, updated_at = NOW()
    WHERE id = $2 AND user_id = $3
    RETURNING id, title, status, user_id, created_at, updated_at`,
    [title, taskId, userId],
  );

  return result.rows[0] ?? null;
};

export const deleteTask = async (
  taskId: string,
  userId: string,
): Promise<boolean> => {
  const result = await pool.query<DBTaskRow>(
    `DELETE FROM support_tasks
    WHERE id = $1 AND user_id = $2`,
    [taskId, userId],
  );

  // result.rowCount is the number of rows DB query affected/returned
  // 1 > 0 → true; if rowCount is 0 (no rows deleted) 0 > 0 → false
  return (result.rowCount ?? 0) > 0;
};
