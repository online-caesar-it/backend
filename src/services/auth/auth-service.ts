import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { IUserDto } from "../../dto/user-dto";
import { error } from "../../enums/error/error";
import { userService } from "services/user/user-service";
import { jwtService } from "services/jwt/jwt-service";
import { envConfig } from "env";

const sendEmailWithToken = async (
  email: string,
  token: string,
  type: "sign-in" | "sign-up"
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const link = `${process.env.FRONTEND_URL}/auth/confirm?token=${token}&method=by-email&type=${type}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Подтверждение регистрации",
    html: `<p>Для завершения регистрации перейдите по ссылке:</p>
           <a href="${link}">Подтвердить</a>`,
  });
};

const initiateRegistration = async (user: IUserDto) => {
  const { email } = user;
  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) {
    throw new Error(error.USER_EXIST);
  }
  const token = jwtService.createTemporaryToken(user);
  await sendEmailWithToken(email, token, "sign-up");
  return { message: "Confirmation email sent", token };
};

const verifyRegistrationToken = async (token: string) => {
  const userData = await jwtService.validateToken(token);
  const existingUser = await userService.findUserByEmail(userData.email);

  if (existingUser) {
    throw new Error(error.USER_EXIST);
  }

  const newUser = await userService.createUser(userData);
  const accessToken = jwt.sign({ id: newUser.id }, envConfig.SECRET_KEY, {
    expiresIn: "7d",
  });

  return { user: newUser, accessToken };
};

const initiateLogin = async (email: string) => {
  const user = await userService.findUserByEmail(email);

  if (!user) {
    throw new Error(error.USER_NOT_EXIST);
  }
  const userObj = {
    email: user.config.email ?? "",
    firstName: user.firstName ?? "",
    surname: user.surname ?? "",
    patronymic: user.patronymic ?? "",
    phone: user.config.phone_number ?? "",
  };
  const token = jwtService.createTemporaryToken(userObj);
  await sendEmailWithToken(email, token, "sign-in");

  return { message: "Confirmation email sent", token };
};

const verifyLoginToken = async (token: string) => {
  const { email } = await jwtService.validateToken(token);
  const user = await userService.findUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const accessToken = jwt.sign({ id: user.id }, envConfig.SECRET_KEY, {
    expiresIn: "7d",
  });

  return { user, accessToken };
};

export const authService = {
  initiateRegistration,
  verifyRegistrationToken,
  initiateLogin,
  verifyLoginToken,
};
