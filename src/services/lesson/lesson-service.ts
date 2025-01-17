import { db } from "db";
import { lessonEntity } from "db/entities/lesson/lesson.entity";

const createLesson = async (
  name: string,
  description: string,
  moduleId: string
) => {
  const [lesson] = await db.insert(lessonEntity).values({
    name,
    description,
    moduleId,
  });
  if (!module) {
    throw new Error("lesson not created");
  }
  return lesson;
};
export const lessonService = {
  createLesson,
};
