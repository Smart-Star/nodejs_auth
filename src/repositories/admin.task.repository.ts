import { pool } from "../lib/db";
import { AdminTaskListFilters, DBTaskRow, Task } from "../types/task.types";

export const getAllTasks = async (
  filters: AdminTaskListFilters,
): Promise<Task[] | null> => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  let paramIndex = 1;

  if (filters.search) {
    conditions.push(`title ILIKE $${paramIndex}`);
    values.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.status) {
    conditions.push(`status = $${paramIndex}`);
    values.push(filters.status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query<DBTaskRow>(
    `SELECT id, title, status, user_id, created_at, updated_at
    FROM support_tasks ${whereClause}
    ORDER BY created_at DESC`,
    values,
  );

  return result.rows ?? null;
};

export const updateTaskStatus = async (
  taskId: string,
  status: string,
): Promise<Task | null> => {
  const result = await pool.query<DBTaskRow>(
    `UPDATE support_tasks
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, title, status, user_id, created_at, updated_at`,
    [status, taskId],
  );

  return result.rows[0] ?? null;
};
