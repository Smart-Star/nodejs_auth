import { z } from "zod";
import { PASSWORD_LENGTH } from "../utils/constants";

export const authSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(
      PASSWORD_LENGTH,
      `Password must be at least ${PASSWORD_LENGTH} characters long.`,
    ),
});
