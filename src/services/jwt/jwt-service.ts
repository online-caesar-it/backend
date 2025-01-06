import { IUserDto } from "./../../dto/user-dto";
import { envConfig } from "env";
import jwt from "jsonwebtoken";
const TOKEN_EXPIRATION = "15m";
const createTemporaryToken = (userData: IUserDto) => {
  return jwt.sign(userData, envConfig.SECRET_KEY, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

const validateToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, envConfig.SECRET_KEY);
    return decoded as IUserDto;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};
export const jwtService = {
  createTemporaryToken,
  validateToken,
};
