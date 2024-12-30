import {
  createUser,
  findUserByEmail,
} from "@repositories/user/user-repository";
import { IUserDto } from "dto/user-dto";
import { error } from "enums/error/error";
import { envConfig } from "env";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const createAccessToken = async (id: number, email: string) => {
  const token = jwt.sign({ id: id, email }, String(envConfig.SECRET_KEY), {
    expiresIn: "1h",
  });

  return token;
};

export const registerService = async (user: IUserDto) => {
  const existingUser = await findUserByEmail(user.email);
  const passwordHash = await bcrypt.hash(user.password, 10);
  if (existingUser) {
    throw new Error(error.USER_EXIST);
  }
  const userCreating = await createUser({
    ...user,
    password: passwordHash,
  });
  const token = await createAccessToken(userCreating.id, userCreating.email);

  return { userCreating, token };
};
export const loginService = async (user: IUserDto) => {
  const findUser = await findUserByEmail(user.email);
  if (!findUser) {
    throw new Error(error.USER_NOT_EXIST);
  }
  const isValidPassword = await bcrypt.compare(
    user.password,
    findUser.password
  );

  if (!isValidPassword) {
    throw new Error(error.USER_NOT_VALID_PASSWORD);
  }
  const token = await createAccessToken(findUser.id, findUser.email);
  console.log(token);
  return { token, findUser };
};
