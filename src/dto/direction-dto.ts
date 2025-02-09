export interface IDirectionDto {
  name: string;
  description: string;
  price: string;
  duration: string;
}
export interface ILessonDto {
  name: string;
  description: string;
  moduleId: string;
}
export interface IModuleDto {
  name: string;
  description: string;
  directionId: string;
}
