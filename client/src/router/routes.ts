import { Chats } from "../pages/chats/Chats";
import { Login } from "../pages/login/Login";
import { NotFound } from "../pages/NotFound";
import { Signup } from "../pages/signup/Signup";

export interface IRoutes {
  path: string,
  element: React.FC,
}

export const routes: IRoutes[] = [
  { path: '/signup', element: Signup },
  { path: '/login', element: Login },
  { path: '/chats', element: Chats },
  { path: '*', element: NotFound }
]