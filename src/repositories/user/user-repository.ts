import { entitiesUser } from "@db/entities/user/entities-user";
import { db } from "@db/index";
import { eq } from "drizzle-orm";
import { IUserDto } from "dto/user-dto";

export const findUserByEmail = async (email: string) => {
  try {
    const [user] = await db
      .select()
      .from(entitiesUser)
      .where(eq(entitiesUser.email, email));
    return user;
  } catch (error) {
    console.error("Произошла ошибка в методе findUserByEmail", error);
  }
};
export const createUser = async (user: IUserDto) => {
  const [userCreating] = await db.insert(entitiesUser).values(user).returning();
  return userCreating;
};
