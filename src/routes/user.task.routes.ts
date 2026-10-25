import { Router, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { taskSchema } from "../validation/task.schema";

import {
  createUserTask,
  deleteUserTask,
  getUserTasks,
  getUserTaskById,
  updateUserTask,
} from "../services/user.task.service";

export const userTaskRouter = Router();
userTaskRouter.use(isAuthenticated); // protects all routes with isAuthenticated

userTaskRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message ?? "Task title is required.",
      });

    try {
      const { title } = parsed.data;
      const task = await createUserTask(req.user!.userId, title);

      res.status(201).json({
        success: true,
        message: "Task created successfully.",
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  },
);

userTaskRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await getUserTasks(req.user!.userId);

      res.status(200).json({
        success: true,
        message: "Fetched tasks successfully.",
        data: { tasks },
      });
    } catch (error) {
      next(error);
    }
  },
);

userTaskRouter.get(
  "/:taskId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = req.params.taskId as string;
      const task = await getUserTaskById(taskId, req.user!.userId);

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

userTaskRouter.patch(
  "/:taskId",
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message ?? "Task title is required.",
      });

    try {
      const { title } = parsed.data;
      const taskId = req.params.taskId as string;
      const task = await updateUserTask(taskId, req.user!.userId, title);

      res.status(200).json({
        success: true,
        message: "Updated task successfully.",
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  },
);

userTaskRouter.delete(
  "/:taskId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = req.params.taskId as string;
      await deleteUserTask(taskId, req.user!.userId);

      res.status(200).json({
        success: true,
        message: "Task deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
);
