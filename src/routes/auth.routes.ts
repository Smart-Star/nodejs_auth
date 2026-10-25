import { Router, Request, Response, NextFunction } from "express";
import { authSchema } from "../validation/auth.schema";
import {
  loginUser,
  loginWithGoogle,
  registerUser,
  startGoogleLogin,
} from "../services/auth.service";
import { isAuthenticated } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";

export const authRouter = Router();

authRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0].message ?? "Email and password are required.",
      });

    try {
      const { email, password } = parsed.data;
      await registerUser(email, password);

      res.status(201).json({
        success: true,
        message: "User registered successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0].message ?? "Email and password are required.",
      });

    try {
      const { email, password } = parsed.data;
      const { accessToken } = await loginUser(email, password);

      res.status(200).json({
        success: true,
        data: { accessToken },
        message: "Logged in successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.get("/google", async (_req: Request, res: Response) => {
  const googleAuthUrl = startGoogleLogin();
  res.redirect(googleAuthUrl);
});

authRouter.get(
  "/google/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code as string | undefined;
      const { accessToken } = await loginWithGoogle(code ?? "");

      res.status(200).json({
        success: true,
        data: { accessToken },
        message: "Logged in successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
);

// get current user information
authRouter.get(
  "/me",
  isAuthenticated,
  isAdmin,
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  },
);
