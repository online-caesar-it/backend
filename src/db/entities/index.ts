import {
  userEntity,
  userGroupRelations,
  userPaymentRelations,
} from "./user/user.entity";
import { userConfigEntity } from "./user/user-config.entity";
import { logEntity } from "./log/log.entity";
import { groupEntity } from "./group/group.entity";
import {
  directionEntity,
  directionGroupsRelations,
  directionPaymentRelations,
  directionsToGroupsRelations,
} from "./direction/direction.entity";
import { chatToUserEntity } from "./chat/chat-to-users.entity";
import { chatEntity } from "./chat/chat.entity";
import { messageEntity } from "./chat/message.entity";
import { moduleEntity, moduleRelations } from "./module/module.entity";
import { lessonEntity, lessonRelations } from "./lesson/lesson.entity";
import { paymentEntity, paymentRelations } from "./payment/payment.entity";
import {
  scheduleCanceledEntity,
  scheduleCanceledRelations,
  scheduleEntity,
  scheduleRelations,
  scheduleTransferEntity,
  scheduleTransferRelations,
} from "./schedule/schedule.entity";
import { scheduleToUsersEntity } from "./schedule/schedule-to-users.entity";
import { workingDayEntity } from "./working/working-day.entity";
import { userToWorkingDaysEntity } from "./user/user-to-working.entity";

export const entities = {
  userEntity,
  userConfigEntity,
  logEntity,
  groupEntity,
  directionEntity,
  chatToUserEntity,
  chatEntity,
  messageEntity,
  moduleEntity,
  lessonEntity,
  moduleRelations,
  lessonRelations,
  directionGroupsRelations,
  directionsToGroupsRelations,
  userGroupRelations,
  paymentEntity,
  paymentRelations,
  directionPaymentRelations,
  userPaymentRelations,
  scheduleCanceledEntity,
  scheduleCanceledRelations,
  scheduleEntity,
  scheduleToUsersEntity,
  scheduleTransferEntity,
  scheduleTransferRelations,
  scheduleRelations,
  userToWorkingDaysEntity,
  workingDayEntity,
};
