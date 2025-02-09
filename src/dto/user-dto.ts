export interface IUserDto {
  email: string;
  role?: string;
  firstName: string;
  surname: string;
  patronymic: string;
  avatar?: string;
  phone: string;
}
export interface IWorkingDaysDto {
  dayNumber: number[];
  dayName: string[];
}
export interface IUserWithWorkingDaysDto {
  user: IUserDto;
  workingDays: IWorkingDaysDto;
}
