import { Router, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";
import { AdminTaskListQuery } from "../types/task.types";

import {
  getAdminTasks,
  updateAdminTaskStatus,
} from "../services/admin.task.service";

import { taskStatusSchema } from "../validation/task.schema";

export const adminTaskRouter = Router();
adminTaskRouter.use(isAuthenticated, isAdmin); // protects all routes

adminTaskRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await getAdminTasks(req.query as AdminTaskListQuery);

      res.status(200).json({
        success: true,
        message: "Tasks fetched successfully.",
        data: { tasks },
      });
    } catch (error) {
      next(error);
    }
  },
);

// update task status
adminTaskRouter.patch(
  "/:taskId/status",
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = taskStatusSchema.safeParse(req.body.status);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message ?? "Task status is required.",
      });

    try {
      const status = parsed.data;
      const taskId = req.params.taskId as string;
      const task = await updateAdminTaskStatus(taskId, status);

      res.status(200).json({
        success: true,
        message: "Fetched task successfully.",
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  },
);
