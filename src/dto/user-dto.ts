export interface IUserDto {
  email: string;
  role?: string;
  firstName: string;
  surname: string;
  patronymic: string;
  avatar?: string;
  phone: string;
  telegram?: string;
}
export interface IUserWithWorkingDaysDto {
  user: IUserDto;
  directionIds: string[];
}
export interface IUserGetUsers {
  limit: number;
  offset: number;
}
