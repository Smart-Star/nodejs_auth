import { Request, Response, NextFunction } from "express";

export const isAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== "ADMIN") {
    next(new Error("Access denied! Admin access is required."));
    return;
  }

  next();
};
