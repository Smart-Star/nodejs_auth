import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

type UploadResult = {
  secureUrl: string;
  publicId: string;
};

// configure cloudinary
cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinarySecret,
});

export const uploadBannerImageToCloudinary = async (
  buffer: Buffer,
  options?: { folder?: string },
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: options?.folder,
      },

      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          secureUrl: result?.secure_url ?? "",
          publicId: result?.public_id ?? "",
        });
      },
    );
    // sending raw image bytes to cloudinary
    uploadStream.end(buffer);
  });
};

export async function deleteBannerImageFromCloudinary(
  publicId: string,
): Promise<void> {
  return cloudinary.uploader.destroy(publicId);
}
