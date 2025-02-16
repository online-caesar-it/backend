export interface IUserDto {
  email: string;
  role?: string;
  firstName: string;
  surname: string;
  patronymic: string;
  avatar?: string;
  phone: string;
}
export interface IUserWithWorkingDaysDto {
  user: IUserDto;
  workingDays: number[];
  directionIds: string[];
}
export interface IUserGetEducators {
  limit: number;
  offset: number;
}
