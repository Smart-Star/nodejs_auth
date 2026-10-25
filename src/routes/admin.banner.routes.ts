import { Router, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";
import { uploadSingleBannerImage } from "../middleware/banner.middleware";
import { bannerSchema } from "../validation/banner.schema";

import {
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanners,
} from "../services/admin.banner.service";

export const adminBannerRouter = Router();
adminBannerRouter.use(isAuthenticated, isAdmin);

adminBannerRouter.post(
  "/",
  uploadSingleBannerImage,
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = bannerSchema.safeParse(req.file);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message ?? "Image is required.",
      });

    try {
      const file = parsed.data;
      const banner = await createAdminBanner(file);

      res.status(201).json({
        success: true,
        message: "Banner uploaded successfully.",
        data: { banner },
      });
    } catch (error) {
      next(error);
    }
  },
);

adminBannerRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const banner = await getAdminBanners();

      res.status(200).json({
        success: true,
        message: "Banner uploaded successfully.",
        data: { banner },
      });
    } catch (error) {
      next(error);
    }
  },
);

adminBannerRouter.delete(
  "/:bannerId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bannerId = req.params.bannerId as string;
      await deleteAdminBanner(bannerId);

      res.status(200).json({
        success: true,
        message: "Banner deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
);
