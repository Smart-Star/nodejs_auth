// validation
export const PASSWORD_LENGTH = 6;
export const BCRYPT_SALT_NUMBER = 10;
export const MIN_TASK_TITLE_LENGTH = 3;
export const MAX_TASK_TITLE_LENGTH = 150;

export const TASK_STATUS = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; //10mb

// caching
export const ADMIN_BANNERS_CACHE_KEY = "admin:banners";
export const ADMIN_BANNERS_CACHE_TTL_SECONDS = 60;

export const USER_TASKS_CACHE_KEY = "user:tasks";
export const USER_TASKS_CACHE_TTL_SECONDS = 60;

// BullMQ
export const QUEUE_NAME = "cloudinary-jobs";
export const DELETE_CLOUDINARY_IMAGE_JOB = "delete-cloudinary-image";
