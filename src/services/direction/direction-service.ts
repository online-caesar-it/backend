import { GROUP_NOT_FOUND } from "consts/response-status/response-message";
import { db } from "db";
import {
  directionEntity,
  directionsToGroupsEntity,
} from "db/entities/direction/direction.entity";
import { userToDirectionEntity } from "db/entities/direction/user-to-direction.entity";
import { groupEntity } from "db/entities/group/group.entity";
import { lessonEntity } from "db/entities/lesson/lesson.entity";
import { moduleEntity } from "db/entities/module/module.entity";
import { userEntity } from "db/entities/user/user.entity";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import {
  IDirectionDto,
  IGroupDto,
  IUserByDirection,
  IUserToDirectionDto,
} from "dto/direction-dto";
import { log } from "lib/logger/logger";
import { moduleService } from "services/module/module-service";
import { userService } from "services/user/user-service";

const createDirection = async (data: IDirectionDto) => {
  const [direction] = await db
    .insert(directionEntity)
    .values({
      ...data,
      duration: Number(data.duration),
    })
    .returning();
  if (!direction) {
    throw new Error("Error creating direction");
  }
  return direction;
};
const getDirectionById = async (directionId: string) => {
  const direction = await db.query.directionEntity.findFirst({
    where: (it) => eq(it.id, directionId),
  });
  if (!direction) {
    throw new Error("Direction does not exist");
  }
  return direction;
};
const createGroup = async (data: IGroupDto) => {
  const [group] = await db
    .insert(groupEntity)
    .values({
      educatorId: data.educatorId,
    })
    .returning();
  if (!group) {
    throw new Error("Error creating group");
  }
  for (const studentId of data.studentsIds) {
    await addStudentToGroup(studentId, group.id);
  }
  return group;
};

const addDirectionToGroup = async (directionId: string, groupId: string) => {
  const [record] = await db
    .insert(directionsToGroupsEntity)
    .values({
      directionId,
      groupId,
    })
    .returning();
  if (!record) {
    throw new Error("Error adding direction to group");
  }
  return record;
};
const addStudentToGroup = async (userId: string, groupId: string) => {
  const existingUser = await db
    .select()
    .from(userEntity)
    .where(eq(userEntity.id, userId))
    .limit(1);

  if (!existingUser.length) {
    throw new Error("User does not exist");
  }

  const existingGroup = await db
    .select()
    .from(groupEntity)
    .where(eq(groupEntity.id, groupId))
    .limit(1);

  if (!existingGroup.length) {
    throw new Error("Group does not exist");
  }

  const [updatedUser] = await db
    .update(userEntity)
    .set({ groupId })
    .where(eq(userEntity.id, userId))
    .returning();

  if (!updatedUser) {
    throw new Error("Error adding user to group");
  }

  return updatedUser;
};
const getStudentsByDirectionAndGroup = async (groupId: string) => {
  const group = await db
    .select()
    .from(groupEntity)
    .where(eq(groupEntity.id, groupId))
    .limit(1);

  if (!group.length) {
    throw new Error("Educator does not have access to this group");
  }

  const students = await db
    .select()
    .from(userEntity)
    .where(eq(userEntity.groupId, groupId));

  return students;
};
const getStudentsByEducatorId = async (educatorId: string, search: string) => {
  const groups = await db
    .select()
    .from(groupEntity)
    .where(eq(groupEntity.educatorId, educatorId));

  const groupIds = groups.map((it) => it.id).filter(Boolean);
  if (!groupIds) {
    throw new Error(GROUP_NOT_FOUND);
  }
  const students = await db
    .select()
    .from(userEntity)
    .where(
      and(
        inArray(userEntity.groupId, groupIds),
        search
          ? or(
              sql`LOWER(${userEntity.firstName}) LIKE LOWER(${`%${search}%`})`,
              sql`LOWER(${userEntity.surname}) LIKE LOWER(${`%${search}%`})`
            )
          : undefined
      )
    );
  return students;
};
const getDirections = async () => {
  const directions = await db.select().from(directionEntity);
  if (!directions) {
    throw new Error("Directions not found");
  }
  return directions;
};
const updateDirection = async (data: IDirectionDto & { id: string }) => {
  const direction = await getDirectionById(data.id);
  const [updatedDirection] = await db
    .update(directionEntity)
    .set({
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
    })
    .where(eq(directionEntity.id, direction.id))
    .returning();
  return updatedDirection;
};
const deleteDirection = async (id: string) => {
  const existingDirection = await getDirectionById(id);
  const [direction] = await db
    .delete(directionEntity)
    .where(eq(directionEntity.id, existingDirection.id))
    .returning();
  await moduleService.deleteModuleByDirection(existingDirection.id);
  return direction;
};
const setUserToDirection = async (data: IUserToDirectionDto) => {
  const { userId, direction } = data;

  const user = await userService.findUserById(userId);

  if (!direction || !Array.isArray(direction)) {
    throw new Error("Directions does not exist or is not an array");
  }

  const directionIds = direction.map((it) => it.directionId);
  const findDirectionToUser = await db.query.userToDirectionEntity.findMany({
    where: (it) =>
      and(eq(it.userId, userId), inArray(it.directionId, directionIds)),
  });

  if (findDirectionToUser.length > 0) {
    throw new Error("У пользователя уже есть такие направления");
  }

  const values = direction.map((it) => ({
    directionId: it.directionId,
    userId: user.id,
    availableLessonCount: it.availableLessonCount ?? null,
    pendingLessonCount: it.availableLessonCount ?? null,
  }));

  await userService.setAccessToPortal(user.id, true);

  await db.insert(userToDirectionEntity).values(values);
};
const getUserWithDirection = async (data: IUserByDirection) => {
  const result = await db
    .select()
    .from(userToDirectionEntity)
    .innerJoin(userEntity, eq(userToDirectionEntity.userId, userEntity.id))
    .where(
      and(
        eq(userToDirectionEntity.directionId, data.directionId),
        eq(userEntity.role, data.role)
      )
    );

  return result.map((row) => row.users);
};
const getDirectionsByUserId = async (userId: string) => {
  const result = await db
    .select({
      direction: directionEntity,
    })
    .from(userToDirectionEntity)
    .innerJoin(
      directionEntity,
      eq(userToDirectionEntity.directionId, directionEntity.id)
    )
    .where(eq(userToDirectionEntity.userId, userId));

  const uniqueDirections = Array.from(
    new Map(result.map((row) => [row.direction.id, row.direction])).values()
  );

  return uniqueDirections;
};
const getDirectionByLessonId = async (lessonId: string) => {
  const result = await db
    .select()
    .from(lessonEntity)
    .innerJoin(moduleEntity, eq(lessonEntity.moduleId, moduleEntity.id))
    .innerJoin(
      directionEntity,
      eq(moduleEntity.directionId, directionEntity.id)
    )
    .where(eq(lessonEntity.id, lessonId));
  return result.map((it) => it.direction)[0];
};
export const directionService = {
  createDirection,
  createGroup,
  addDirectionToGroup,
  addStudentToGroup,
  getStudentsByDirectionAndGroup,
  getStudentsByEducatorId,
  getDirections,
  updateDirection,
  deleteDirection,
  getDirectionById,
  setUserToDirection,
  getUserWithDirection,
  getDirectionsByUserId,
  getDirectionByLessonId,
};
