import { z } from "zod";

import {
  MAX_TASK_TITLE_LENGTH,
  MIN_TASK_TITLE_LENGTH,
  TASK_STATUS,
} from "../utils/constants";

export const taskSchema = z.object({
  title: z
    .string()
    .min(
      MIN_TASK_TITLE_LENGTH,
      `Title must be at least ${MIN_TASK_TITLE_LENGTH} characters long.`,
    )
    .max(
      MAX_TASK_TITLE_LENGTH,
      `Title cannot be at longer than ${MAX_TASK_TITLE_LENGTH} characters.`,
    ),
});

export const taskStatusSchema = z.enum(TASK_STATUS);

export const adminUpdateTaskSchema = z.object({
  title: z
    .string()
    .min(
      MIN_TASK_TITLE_LENGTH,
      `Title must be at least ${MIN_TASK_TITLE_LENGTH} characters long.`,
    )
    .max(
      MAX_TASK_TITLE_LENGTH,
      `Title cannot be at longer than ${MAX_TASK_TITLE_LENGTH} characters.`,
    )
    .optional(),
  status: taskStatusSchema.optional(),
});
