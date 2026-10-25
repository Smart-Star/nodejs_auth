import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { userTaskRouter } from "./user.task.routes";
import { adminTaskRouter } from "./admin.task.routes";
import { adminUsersRouter } from "./admin.users.routes";
import { adminBannerRouter } from "./admin.banner.routes";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/tasks", userTaskRouter);
apiRouter.use("/admin/tasks", adminTaskRouter);
apiRouter.use("/admin/users", adminUsersRouter);
apiRouter.use("/admin/banners", adminBannerRouter);
