import { Roles } from "../enums/Roles"
import { OnlineStatus } from "./OnlineStatus";

export interface User {
  id:	number;
  name:	string;
  surname:	string;
  fullName: string;
  email:	string;
  birthday:	Date;
  avatar?: string;
  onlineStatus: OnlineStatus;
  roles: Roles[];
}