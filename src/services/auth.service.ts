import {
  createGoogleUser,
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
  findUserByGoogleId,
  linkGoogleIdToUser,
} from "../repositories/user.repository";

import bcrypt from "bcryptjs";
import { signAccessToken } from "../lib/jwt";
import { BCRYPT_SALT_NUMBER } from "../utils/constants";
import { getGoogleAuthUrl, getGoogleUserFromAuthCode } from "../lib/google";
import { User } from "../types/user.types";

export const registerUser = async (
  email: string,
  password: string,
): Promise<void> => {
  const normalizeEmail = email.toLowerCase().trim();

  //  check if user already exists
  const existingUser = await findUserByEmail(normalizeEmail);
  if (existingUser) throw new Error("Email already exists.");

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_NUMBER);
  await createUser(normalizeEmail, passwordHash);
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<{ accessToken: string }> => {
  const normalizeEmail = email.toLowerCase().trim();

  // check if user exists in db
  const user = await findUserByEmailWithPassword(normalizeEmail);
  if (!user?.password_hash) throw new Error("Invalid email or password.");

  // compare password to db password hash
  const isPasswordValid = await bcrypt.compare(password, user?.password_hash);
  if (!isPasswordValid) throw new Error("Invalid email or password.");

  const accessToken = signAccessToken({
    userId: user?.id,
    email: user?.email,
    role: user?.role,
  });

  return { accessToken };
};

// google auth
export const startGoogleLogin = (): string => {
  return getGoogleAuthUrl();
};

const createAccessTokenForUser = (user: User): string => {
  return signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
};

export const loginWithGoogle = async (
  code: string,
): Promise<{ accessToken: string }> => {
  const googleProfile = await getGoogleUserFromAuthCode(code);

  let user = await findUserByGoogleId(googleProfile.googleId);

  if (!user) {
    user = await findUserByEmail(googleProfile.email);

    if (user) {
      // link google account to the existing email
      user = await linkGoogleIdToUser(user.id, googleProfile.googleId);
    } else {
      // first time login -> create user in db
      user = await createGoogleUser(
        googleProfile.email,
        googleProfile.googleId,
      );
    }
  }

  const accessToken = createAccessTokenForUser(user);
  return { accessToken };
};
