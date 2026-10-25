import { Router, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";
import { getAllUsers } from "../services/admin.users.service";

export const adminUsersRouter = Router();
adminUsersRouter.use(isAuthenticated, isAdmin); // protects all routes

// fetch all users
adminUsersRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await getAllUsers();

      res.status(200).json({
        success: true,
        message: "Users fetched successfully.",
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  },
);
