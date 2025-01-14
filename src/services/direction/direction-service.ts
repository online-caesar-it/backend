import { GROUP_NOT_FOUND } from "consts/response-status/response-message";
import { db } from "db";
import {
  directionEntity,
  directionsToGroupsEntity,
  groupEntity,
} from "db/entities/direction/direction.entity";
import { userEntity } from "db/entities/user/user.entity";
import { eq, inArray } from "drizzle-orm";

const createDirection = async (name: string, description: string) => {
  const [direction] = await db
    .insert(directionEntity)
    .values({
      name,
      description,
    })
    .returning();
  if (!direction) {
    throw new Error("Error creating direction");
  }
  return direction;
};

// Создание группы
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
const getStudentsByEducatorId = async (educatorId: string) => {
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
    .where(inArray(userEntity.groupId, groupIds));
  return students;
};
export const directionService = {
  createDirection,
  createGroup,
  addDirectionToGroup,
  addStudentToGroup,
  getStudentsByDirectionAndGroup,
  getStudentsByEducatorId,
};
