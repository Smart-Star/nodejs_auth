import {
  clearUserTasksCache,
  getUserTasksFromCache,
  getUserTaskFromCacheById,
  setUserTasksCache,
  setUserTaskCacheById,
  clearUserTasksCacheById,
} from "../lib/caching/user.task.cache";

import {
  createTask,
  deleteTask,
  getTaskByIdAndUserId,
  getTasksByUserId,
  updateTaskTitle,
} from "../repositories/user.task.repository";

import { Task } from "../types/task.types";

export const createUserTask = async (
  userId: string,
  title: string,
): Promise<Task> => {
  const normalizeTitle = title.trim();
  const createdTask = await createTask(userId, normalizeTitle);

  // invalidate the cache
  await clearUserTasksCache();

  return createdTask;
};

export const getUserTasks = async (userId: string): Promise<Task[]> => {
  const getCachedUserTasks = await getUserTasksFromCache();
  if (getCachedUserTasks) return getCachedUserTasks;

  // if no cache data, fetch data from DB
  const tasks = await getTasksByUserId(userId);
  if (!tasks) throw new Error("Tasks not found");

  // set data to cache
  await setUserTasksCache(tasks);

  return tasks;
};

export const getUserTaskById = async (
  taskId: string,
  userId: string,
): Promise<Task> => {
  const getCachedUserTaskWithId = await getUserTaskFromCacheById(taskId);
  if (getCachedUserTaskWithId) return getCachedUserTaskWithId;

  // if no cache data, fetch data from DB
  const task = await getTaskByIdAndUserId(taskId, userId);
  if (!task) throw new Error("Task not found.");

  // set data to cache
  await setUserTaskCacheById(task);

  return task;
};

export const updateUserTask = async (
  taskId: string,
  userId: string,
  title: string,
): Promise<Task> => {
  const normalizeTitle = title.trim();
  const task = await updateTaskTitle(taskId, userId, normalizeTitle);
  if (!task) throw new Error("Task not found.");

  // invalidate the cache
  await clearUserTasksCache(); // clears cache list
  await clearUserTasksCacheById(taskId); // clears single task

  return task;
};

export const deleteUserTask = async (
  taskId: string,
  userId: string,
): Promise<void> => {
  const deletedTask = await deleteTask(taskId, userId);
  if (!deletedTask) throw new Error("Task not found.");

  // invalidate the cache
  await clearUserTasksCache(); // clears cache list
  await clearUserTasksCacheById(taskId); // clears single task
};
