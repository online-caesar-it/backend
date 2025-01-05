import { userService } from "./../user/user-service";
import bcrypt from "bcrypt";
import { IUserDto } from "../../dto/user-dto";
import { error } from "../../enums/error/error";
import { envConfig } from "../../env";
import jwt from "jsonwebtoken";

const createAccessToken = async (id: string) => {
  const token = jwt.sign({ id: id }, String(envConfig.SECRET_KEY), {
    expiresIn: "1h",
  });

  return token;
};

const registerService = async (user: IUserDto) => {
  const existingUser = await userService.findUserByEmail(user.email || "");
  const passwordHash = await bcrypt.hash(user.password || "", 10);
  if (existingUser) {
    throw new Error(error.USER_EXIST);
  }
  const { userCreating, userCreatingConfig } = await userService.createUser({
    ...user,
    password: passwordHash || "",
  });
  const token = await createAccessToken(userCreating.id);

  return { userCreating, token, userCreatingConfig };
};


const loginService = async (user: IUserDto) => {
  const findUserConfig = await userService.findUserByEmail(user.email || "");

  if (!findUserConfig) {
    throw new Error(error.USER_NOT_EXIST);
  }
  const findUser = await userService.findUserById(findUserConfig.userId || "");
  console.log(findUserConfig);
  const isValidPassword = await bcrypt.compare(
    user.password || "",
    findUserConfig.password || ""
  );

  if (!isValidPassword) {
    throw new Error(error.USER_NOT_VALID_PASSWORD);
  }
  const token = await createAccessToken(findUserConfig.userId || "");
  return { token, findUser, findUserConfig };
};

export const authService = {
  loginService,
  registerService,
};
