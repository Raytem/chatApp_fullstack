import { User } from "./User";

export interface SignupResponse {
  user: User;
  accessToken: string;
}