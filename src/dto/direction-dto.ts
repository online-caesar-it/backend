export interface IDirectionDto {
  name: string;
  description: string;
  price: string;
  duration: number;
}
export interface ILessonDto {
  name: string;
  description: string;
  moduleId: string;
  file: string;
}
export interface IModuleDto {
  name: string;
  description: string;
  directionId: string;
}
export interface IGroupDto {
  educatorId: string;
  studentsIds: string[];
}
export interface IUserByDirection {
  role: string;
  directionId: string;
}
export interface IUserToDirectionDto {
  userId: string;
  directionIds: string[];
  availableLessonCount?: number;
}
