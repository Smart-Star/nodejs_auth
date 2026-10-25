import {
  TaskStatus,
  AdminTaskListQuery,
  AdminTaskListResponse,
  Task,
} from "../types/task.types";

import {
  getAllTasks,
  updateTaskStatus,
} from "../repositories/admin.task.repository";

import { TASK_STATUS } from "../utils/constants";

export const getAdminTasks = async (
  query: AdminTaskListQuery,
): Promise<AdminTaskListResponse> => {
  const search = query.search?.trim() || undefined;
  const status = query.status?.trim() || undefined;

  if (status && !TASK_STATUS.includes(status as TaskStatus))
    throw new Error("Status must either be open, inprogress or resolved");

  const tasks = await getAllTasks({ search, status });
  if (!tasks) throw new Error("Tasks not found.");

  return {
    tasks,
  };
};

export const updateAdminTaskStatus = async (
  taskId: string,
  status: unknown,
): Promise<Task> => {
  if (typeof status !== "string" || !TASK_STATUS.includes(status as TaskStatus))
    throw new Error("Status must either be open, inprogress or resolved");

  const task = await updateTaskStatus(taskId, status);
  if (!task) throw new Error("Tasks not found.");

  return task;
};
