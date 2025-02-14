import { EScheduleTransferStatus } from "enums/schedule/schedule-status";

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
export interface IScheduleTransferDto {
  scheduleId: string;
  reason: string;
  newEndTime: string;
  newStartTime: string;
  newDateLesson: string;
}
export interface IScheduleCanceledDto {
  scheduleId: string;
  reason: string;
}
export interface IScheduleUpdateTransferCancelDto {
  scheduleTransferId: string;
  status: EScheduleTransferStatus;
}
