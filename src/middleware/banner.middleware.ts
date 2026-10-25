import multer from "multer";
import { MAX_IMAGE_FILE_SIZE } from "../utils/constants";

export const uploadBannerImage = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: MAX_IMAGE_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image upload is allowed"));
      return;
    }

    cb(null, true);
  },
});

export const uploadSingleBannerImage = uploadBannerImage.single("image");
