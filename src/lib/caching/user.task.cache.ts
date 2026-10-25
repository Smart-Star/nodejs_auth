import { Task } from "../../types/task.types";
import { redis } from "../redis";

import {
  USER_TASKS_CACHE_KEY,
  USER_TASKS_CACHE_TTL_SECONDS,
} from "../../utils/constants";

export async function getUserTasksFromCache(): Promise<Task[] | null> {
  const cacheData = await redis.get(USER_TASKS_CACHE_KEY);
  if (!cacheData) return null;

  return JSON.parse(cacheData) as Task[];
}

export async function getUserTaskFromCacheById(
  taskId: string,
): Promise<Task | null> {
  const USER_TASKS_WITH_ID_CACHE_KEY = `user:task:${taskId}`;

  const cacheData = await redis.get(USER_TASKS_WITH_ID_CACHE_KEY);
  if (!cacheData) return null;

  return JSON.parse(cacheData) as Task;
}

export async function setUserTasksCache(tasks: Task[]): Promise<void> {
  await redis.set(
    USER_TASKS_CACHE_KEY,
    JSON.stringify(tasks),
    "EX",
    USER_TASKS_CACHE_TTL_SECONDS,
  );
}

export async function setUserTaskCacheById(task: Task): Promise<void> {
  const USER_TASKS_WITH_ID_CACHE_KEY = `user:task:${task.id}`;

  await redis.set(
    USER_TASKS_WITH_ID_CACHE_KEY,
    JSON.stringify(task),
    "EX",
    USER_TASKS_CACHE_TTL_SECONDS,
  );
}

export async function clearUserTasksCache(): Promise<void> {
  await redis.del(USER_TASKS_CACHE_KEY);
}

export async function clearUserTasksCacheById(taskId: string): Promise<void> {
  const USER_TASKS_WITH_ID_CACHE_KEY = `user:task:${taskId}`;
  await redis.del(USER_TASKS_WITH_ID_CACHE_KEY);
}
