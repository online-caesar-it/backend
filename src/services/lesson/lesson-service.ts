import { db } from "db";
import { directionEntity } from "db/entities/direction/direction.entity";
import { userToDirectionEntity } from "db/entities/direction/user-to-direction.entity";
import { lessonEntity } from "db/entities/lesson/lesson.entity";
import { moduleEntity } from "db/entities/module/module.entity";
import { eq } from "drizzle-orm";
import { ILessonDto } from "dto/direction-dto";
import { P } from "pino";

const createLesson = async (data: ILessonDto) => {
  const [lesson] = await db.insert(lessonEntity).values(data).returning();
  if (!module) {
    throw new Error("lesson not created");
  }
  return lesson;
};
const getLessonByModuleId = async (id: string) => {
  const lessons = await db.query.lessonEntity.findMany({
    where: (it) => eq(it.moduleId, id),
  });
  if (!lessons) {
    throw new Error("Lesson is not defined");
  }
  const module = await db.query.moduleEntity.findFirst({
    where: (it) => eq(it.id, id),
  });
  return { module, lessons };
};
const updateLesson = async (
  id: string,
  name: string,
  description: string,
  file: string
) => {
  const lesson = await db.query.lessonEntity.findFirst({
    where: (it) => eq(it.id, id),
  });
  if (!lesson) {
    throw new Error("Lesson is not defined");
  }
  const [updatedLesson] = await db
    .update(lessonEntity)
    .set({
      name,
      description,
      file,
    })
    .where(eq(lessonEntity.id, id))
    .returning();
  return updatedLesson;
};
const deleteLesson = async (id: string) => {
  const existingLesson = await getLessonById(id);
  const [lesson] = await db
    .delete(lessonEntity)
    .where(eq(lessonEntity.id, existingLesson.id))
    .returning();
  return lesson;
};
const getLessonById = async (id: string) => {
  const existingLesson = await db.query.lessonEntity.findFirst({
    where: (it) => eq(it.id, id),
  });
  if (!existingLesson) {
    throw new Error("Lesson is not defined");
  }
  return existingLesson;
};
const getLessonByUserId = async (userId: string) => {
  const lessons = await db
    .select({
      lessonId: lessonEntity.id,
      lessonName: lessonEntity.name,
      lessonDescription: lessonEntity.description,
      moduleId: moduleEntity.id,
      moduleName: moduleEntity.name,
      moduleDescription: moduleEntity.description,
      directionId: directionEntity.id,
      directionName: directionEntity.name,
      directionDescription: directionEntity.description,
    })
    .from(userToDirectionEntity)
    .leftJoin(
      directionEntity,
      eq(userToDirectionEntity.directionId, directionEntity.id)
    )
    .leftJoin(moduleEntity, eq(moduleEntity.directionId, directionEntity.id))
    .leftJoin(lessonEntity, eq(lessonEntity.moduleId, moduleEntity.id))
    .where(eq(userToDirectionEntity.userId, userId));

  return lessons;
};
const getLessonsByDirectionId = async (directionId: string) => {
  const lessons = await db
    .select({
      id: lessonEntity.id,
      name: lessonEntity.name,
      description: lessonEntity.description,
    })
    .from(directionEntity)
    .leftJoin(moduleEntity, eq(moduleEntity.directionId, directionEntity.id))
    .leftJoin(lessonEntity, eq(lessonEntity.moduleId, moduleEntity.id))
    .where(eq(directionEntity.id, directionId));

  return lessons;
};
export const lessonService = {
  createLesson,
  deleteLesson,
  updateLesson,
  getLessonByModuleId,
  getLessonById,
  getLessonByUserId,
  getLessonsByDirectionId,
};
