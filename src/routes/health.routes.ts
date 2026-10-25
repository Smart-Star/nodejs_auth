import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res, _next) => {
  res.status(200).json({
    success: true,
    message: "Health route is working.",
  });
});
