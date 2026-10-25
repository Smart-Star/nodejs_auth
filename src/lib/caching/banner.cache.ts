import { Banner } from "../../types/banner.types";
import { redis } from "../redis";

import {
  ADMIN_BANNERS_CACHE_KEY,
  ADMIN_BANNERS_CACHE_TTL_SECONDS,
} from "../../utils/constants";

export async function getBannersFromCache(): Promise<Banner[] | null> {
  const cacheData = await redis.get(ADMIN_BANNERS_CACHE_KEY);
  if (!cacheData) return null;

  return JSON.parse(cacheData) as Banner[];
}

export async function setBannerCache(banners: Banner[]): Promise<void> {
  await redis.set(
    ADMIN_BANNERS_CACHE_KEY,
    JSON.stringify(banners),
    "EX",
    ADMIN_BANNERS_CACHE_TTL_SECONDS,
  );
}

export async function clearBannersCache(): Promise<void> {
  await redis.del(ADMIN_BANNERS_CACHE_KEY);
}
