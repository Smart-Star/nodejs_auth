import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";

export const isAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next(new Error("Access denied! Access token is required."));
    return;
  }

  const token = authHeader.split(" ")[1];
  req.user = verifyAccessToken(token);

  next();
};
