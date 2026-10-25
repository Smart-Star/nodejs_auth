import { pool } from "../lib/db";
import { Banner, DBBannerRow } from "../types/banner.types";

export const createBanner = async (
  imageUrl: string,
  cloudinaryPublicId: string,
): Promise<Banner | null> => {
  const result = await pool.query<DBBannerRow>(
    `INSERT INTO banners (image_url, cloudinary_public_id)
    VALUES ($1, $2)
    RETURNING id, image_url, cloudinary_public_id, created_at`,
    [imageUrl, cloudinaryPublicId],
  );

  return result.rows[0] ?? null;
};

export const getAllBanners = async (): Promise<Banner[] | null> => {
  const result = await pool.query<DBBannerRow>(
    `SELECT id, image_url, cloudinary_public_id, created_at
    FROM banners
    ORDER BY created_at DESC`,
  );

  return result.rows ?? null;
};

export const deleteBannerById = async (
  bannerId: string,
): Promise<string | null> => {
  const result = await pool.query<{ cloudinary_public_id: string }>(
    `DELETE FROM banners
    WHERE id = $1
    RETURNING cloudinary_public_id`,
    [bannerId],
  );

  return result.rows[0]?.cloudinary_public_id ?? null;
};
