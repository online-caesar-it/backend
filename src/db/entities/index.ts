import { userEntity } from "./user/user.entity";
import { userConfigEntity } from "./user/user-config.entity";
import { logEntity } from "./log/log.entity";
import { groupEntity } from "./group/group.entity";
import {
  directionEntity,
  directionRelations,
  directionsToGroupsRelations,
  userRelations,
} from "./direction/direction.entity";
import { chatToUserEntity } from "./chat/chat-to-users.entity";
import { chatEntity } from "./chat/chat.entity";
import { messageEntity } from "./chat/message.entity";
import { moduleEntity, moduleRelations } from "./module/module.entity";
import { lessonEntity, lessonRelations } from "./lesson/lesson.entity";

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
  directionRelations,
  directionsToGroupsRelations,
  userRelations,
};
