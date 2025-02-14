export interface IScheduleDto {
  workingDays: number[];
  directionId: string;
  dateLesson: string;
  startTime: string;
  endTime: string;
  teacherId: string;
}
export interface IScheduleGet {
  teacherId: string;
  directionId: string;
}
export interface IScheduleGetByDate {
  startDate: string;
  endDate: string;
}
export interface IScheduleEditWorkingDay {
  workingDays: number[];
}
export interface IScheduleFilter {
  directionId: string;
  userId: string;
  startDate: string;
  endDate: string;
}
