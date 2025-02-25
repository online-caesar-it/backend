import { db } from "db";
import { lessonEntity } from "db/entities/lesson/lesson.entity";
import { eq } from "drizzle-orm";
import { ILessonDto } from "dto/direction-dto";

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
};
const updateLesson = async (id: string, name: string, description: string) => {
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
export const lessonService = {
  createLesson,
  deleteLesson,
  updateLesson,
  getLessonByModuleId,
  getLessonById,
};
