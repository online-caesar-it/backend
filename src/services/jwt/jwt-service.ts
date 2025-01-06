import jwt from "jsonwebtoken";
import { IUserDto } from "./../../dto/user-dto";
import { envConfig } from "env";
import { userService } from "services/user/user-service";

const TOKEN_EXPIRATION = "15m";
const TOKEN_REFRESH_EXPIRES = "30d";

const cleanPayload = (data: IUserDto): Omit<IUserDto, "exp" | "iat"> => {
  const { exp, iat, ...cleanedData } = data as any;
  return cleanedData;
};

const createTemporaryToken = (userData: IUserDto) => {
  const cleanedData = cleanPayload(userData);
  return jwt.sign(cleanedData, envConfig.SECRET_KEY, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

const createRefreshToken = (userData: IUserDto) => {
  const cleanedData = cleanPayload(userData);
  return jwt.sign(cleanedData, envConfig.SECRET_KEY, {
    expiresIn: TOKEN_REFRESH_EXPIRES,
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

const refreshTokens = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, envConfig.SECRET_KEY) as IUserDto;
    const { user } = await userService.findUserByRefresh(refreshToken);
    const newAccessToken = createTemporaryToken(decoded);
    const newRefreshToken = createRefreshToken(decoded);
    await userService.updateUserRefreshToken(user.id, newRefreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    console.error(err);
    throw new Error("Invalid or expired refresh token");
  }
};

export const jwtService = {
  createTemporaryToken,
  createRefreshToken,
  validateToken,
  refreshTokens,
};
