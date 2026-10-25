import { getUsers } from "../repositories/admin.users.repository";
import { User } from "../types/user.types";

export const getAllUsers = async (): Promise<User[]> => {
  const users = await getUsers();
  if (!users) throw new Error("Users not found.");

  return users;
};
