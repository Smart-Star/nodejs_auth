import { z } from "zod";
import { MAX_IMAGE_FILE_SIZE } from "../utils/constants";

export const bannerSchema = z
  .custom<Express.Multer.File>((file) => !!file, "Image file is required.")
  .refine(
    (file) => file?.size <= MAX_IMAGE_FILE_SIZE,
    "File size must not exceed 10MB.",
  )
  .refine(
    (file) => file?.mimetype?.startsWith("image/"),
    "Only image files are allowed.",
  );
