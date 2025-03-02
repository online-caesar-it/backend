import { db } from "db";
import { moduleEntity } from "db/entities/module/module.entity";
import { eq, inArray } from "drizzle-orm";
import { IModuleDto } from "dto/direction-dto";
import { lessonService } from "services/lesson/lesson-service";

const createModule = async (data: IModuleDto) => {
  const [module] = await db.insert(moduleEntity).values(data).returning();
  if (!module) {
    throw new Error("Error in create module");
  }
  return module;
};
const getModuleByDirectionId = async (directionId: string) => {
  const modules = await db.query.moduleEntity.findMany({
    where: (it) => eq(it.directionId, directionId),
  });

  if (!modules) {
    throw new Error("Not found module by this direction id");
  }
  const direction = await db.query.directionEntity.findFirst({
    where: (it) => eq(it.id, directionId),
  });
  return {
    modules,
    direction,
  };
};
const editModule = async (id: string, name?: string, description?: string) => {
  const existingModule = await db.query.moduleEntity.findFirst({
    where: (it) => eq(it.id, id),
  });
  if (!existingModule) {
    throw new Error("Module not found");
  }

  const [updatedModule] = await db
    .update(moduleEntity)
    .set({
      ...(name && { name }),
      ...(description && { description }),
    })
    .where(eq(moduleEntity.id, id))
    .returning();

  if (!updatedModule) {
    throw new Error("Failed to update module");
  }
  return updatedModule;
};
const deleteModule = async (id: string) => {
  const existingModule = await db.query.moduleEntity.findFirst({
    where: (it) => eq(it.id, id),
  });
  if (!existingModule) {
    throw new Error("Module not found");
  }
  await lessonService.deleteLessonByModuleId(id);
  const [module] = await db
    .delete(moduleEntity)
    .where(eq(moduleEntity.id, id))
    .returning();
  return module;
};
const deleteModuleByDirection = async (id: string) => {
  const existingModule = await getModuleByDirectionId(id);

  const [module] = await db
    .delete(moduleEntity)
    .where(
      inArray(
        moduleEntity.id,
        existingModule.modules.map((it) => it.id)
      )
    )
    .returning();
  return module;
};
export const moduleService = {
  createModule,
  getModuleByDirectionId,
  editModule,
  deleteModule,
  deleteModuleByDirection,
};
