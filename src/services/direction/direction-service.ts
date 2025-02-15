import { GROUP_NOT_FOUND } from "consts/response-status/response-message";
import { db } from "db";
import {
  directionEntity,
  directionsToGroupsEntity,
} from "db/entities/direction/direction.entity";
import { educatorsToDirectionsEntity } from "db/entities/direction/educator-to-direction.entity";
import { groupEntity } from "db/entities/group/group.entity";
import { userEntity } from "db/entities/user/user.entity";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { IDirectionDto } from "dto/direction-dto";
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
const createGroup = async (educatorId: string) => {
  const [group] = await db
    .insert(groupEntity)
    .values({
      educatorId,
    })
    .returning();
  if (!group) {
    throw new Error("Error creating group");
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
const updateDirection = async (
  id: string,
  name: string,
  description: string
) => {
  const direction = await db
    .select()
    .from(directionEntity)
    .where(eq(directionEntity.id, id));
  if (direction) {
    throw new Error("Direction not found");
  }
  const [updatedDirection] = await db
    .update(directionEntity)
    .set({
      name,
      description,
    })
    .where(eq(directionEntity.id, id))
    .returning();
  return updatedDirection;
};
const deleteDirection = async (id: string) => {
  const existingDirection = await db.query.directionEntity.findFirst({
    where: (it) => eq(it.id, id),
  });
  if (existingDirection) {
    throw new Error("Direction not found");
  }
  const [direction] = await db
    .delete(directionEntity)
    .where(eq(directionEntity.id, id))
    .returning();
  return direction;
};
const setEducatorToDirection = async (
  educatorId: string,
  directionIds: string[]
) => {
  const user = await userService.findUserById(educatorId);
  if (!directionIds || !Array.isArray(directionIds)) {
    throw new Error("Direction ids does not exist");
  }
  const values = directionIds.map((it) => ({
    directionId: it,
    educatorId: user.id,
  }));
  await db.insert(educatorsToDirectionsEntity).values(values);
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
  setEducatorToDirection,
};
