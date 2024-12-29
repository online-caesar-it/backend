import {
  createUser,
  findUserByEmail,
} from "@repositories/user/user-repository";
import { IUserDto } from "dto/user-dto";
import { error } from "enums/error/error";
import { envConfig } from "env";
import jwt from "jsonwebtoken";
export const createAccessToken = async (id: number, email: string) => {
  const token = jwt.sign({ id: id, email }, String(envConfig.SECRET_KEY), {
    expiresIn: "1h",
  });

  return token;
};

export const registerService = async (user: IUserDto) => {
  const existingUser = await findUserByEmail(user.role);

  if (existingUser) {
    throw new Error(error.USER_EXIST);
  }
  const userCreating = await createUser(user);
  const token = await createAccessToken(userCreating.id, userCreating.email);

  return { userCreating, token };
};
