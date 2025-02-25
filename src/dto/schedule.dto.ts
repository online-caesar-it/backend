import {
  EScheduleStatus,
  EScheduleTransferStatus,
} from "enums/schedule/schedule-status";

export interface IScheduleDto {
  workingDays: {
    day: number;
    timeIntervals: {
      startTime: string;
      endTime: string;
    }[];
  }[];
}
export interface IScheduleGet {
  teacherId: string;
  directionId: string;
}
export interface IScheduleGetByDate {
  startDate: string;
  endDate: string;
}
export interface IScheduleGetByEducatorId {
  startDate: string;
  endDate: string;
  educatorId: string;
}
export interface IScheduleEditWorkingDay {
  workingDays: number[];
}
export interface IScheduleFilter {
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
export interface IScheduleDataDto {
  startTime: string;
  endTime: string;
  dateLesson: Date;
  userId: string;
  status: EScheduleStatus;
}
export interface IScheduleAttachDto {
  scheduleId: string;
}
export interface IScheduleByDirection extends IScheduleGetByDate {
  directionId: string;
}
export interface IScheduleByStatus {
  status: EScheduleTransferStatus;
}
