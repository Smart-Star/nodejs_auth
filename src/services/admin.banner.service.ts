import { uploadBannerImageToCloudinary } from "../lib/cloudinary";
import { Banner } from "../types/banner.types";

import {
  clearBannersCache,
  getBannersFromCache,
  setBannerCache,
} from "../lib/caching/banner.cache";

import {
  createBanner,
  deleteBannerById,
  getAllBanners,
} from "../repositories/admin.banner.repository";
import { addDeleteCloudinaryImageJob } from "../queues/delete-cloudinary-image.queue";

export const createAdminBanner = async (
  file: Express.Multer.File | undefined,
): Promise<Banner> => {
  if (!file?.buffer) throw new Error("Image type is invalid.");

  const { secureUrl, publicId } = await uploadBannerImageToCloudinary(
    file.buffer,
    {
      folder: "nodejs-capstone-project",
    },
  );

  if (!secureUrl || !publicId)
    throw new Error("Cloudinary secureUrl or publicId error.");

  const banner = await createBanner(secureUrl, publicId);
  if (!banner) throw new Error("Unable to create Banner.");

  // invalidate the cache
  await clearBannersCache();

  return banner;
};

export const getAdminBanners = async (): Promise<Banner[]> => {
  const getCachedBanners = await getBannersFromCache();
  if (getCachedBanners) return getCachedBanners;

  // if no cache data, fetch data from DB
  const banners = await getAllBanners();
  if (!banners) throw new Error("Banners not found");

  // set data to cache
  await setBannerCache(banners);

  return banners;
};

export const deleteAdminBanner = async (bannerId: string): Promise<void> => {
  // delete from db and get the public id
  const publicId = await deleteBannerById(bannerId);
  if (!publicId) throw new Error("Banner not found");

  await clearBannersCache();

  // add BULLMQ job
  await addDeleteCloudinaryImageJob(publicId);
};
