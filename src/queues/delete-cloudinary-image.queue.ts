import { Queue } from "bullmq";
import { bullmqConnection } from "../lib/redis";
import { DELETE_CLOUDINARY_IMAGE_JOB, QUEUE_NAME } from "../utils/constants";
import { DeleteCloudinaryImageJobDataType } from "../types/banner.types";

export const deleteCloudinaryImageQueue = new Queue(QUEUE_NAME, {
  connection: bullmqConnection,
});

export async function addDeleteCloudinaryImageJob(
  publicId: string,
): Promise<void> {
  const jobData: DeleteCloudinaryImageJobDataType = {
    publicId,
  };

  // add one job to our queue
  await deleteCloudinaryImageQueue.add(DELETE_CLOUDINARY_IMAGE_JOB, jobData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3000,
    },

    removeOnComplete: true,
    removeOnFail: false,
  });
}
