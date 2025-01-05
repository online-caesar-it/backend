import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { IUserDto } from "../../dto/user-dto";
import { error } from "../../enums/error/error";
import { userService } from "services/user/user-service";

const JWT_SECRET = process.env.JWT_SECRET || "ARCH_LINUX";
const TOKEN_EXPIRATION = "15m";

const createTemporaryToken = (userData: IUserDto) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

const validateToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as Omit<IUserDto, "password">;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

const sendEmailWithToken = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const link = `${process.env.FRONTEND_URL}/auth/confirm?token=${token}&method=by-email&type=sign-up`;

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

  const token = createTemporaryToken(user);
  await sendEmailWithToken(email, token);

  return { message: "Confirmation email sent", token };
};

const verifyRegistrationToken = async (token: string) => {
  const userData = await validateToken(token);
  const existingUser = await userService.findUserByEmail(userData.email);

  if (existingUser) {
    throw new Error(error.USER_EXIST);
  }

  const newUser = await userService.createUser(userData);
  const accessToken = jwt.sign({ id: newUser.id }, JWT_SECRET, {
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
    email: user.email ?? "",
    firstName: user.firstName ?? "",
    surname: user.surname ?? "",
    patronymic: user.patronymic ?? "",
    phone: user.phone_number ?? "",
  };
  const token = createTemporaryToken(userObj);
  await sendEmailWithToken(email, token);

  return { message: "Confirmation email sent", token };
};

const verifyLoginToken = async (token: string) => {
  const { email } = await validateToken(token);
  const user = await userService.findUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
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
