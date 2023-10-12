import { PaginationDto } from "../../types/dtos/PaginationDto";
import { PrivateChatsAndCntDto } from "../../types/dtos/privateChat/PrivateChatsAndCntDto";
import { UserFilterDto } from "../../types/dtos/user/UserFilterDto";
import { User } from "../../types/interfaces/User";
import { $api } from "../http/api";

class UserService {
  async getAll(userFilterDto?: UserFilterDto): Promise<User[]> {
    const res = await $api.get('/user', {
      params: { ...userFilterDto },
    });
    return res.data;
  }

  async getChats(userId: number, paginationDto?: PaginationDto): Promise<PrivateChatsAndCntDto> {
    const res = await $api.get(`user/${userId}/chats`, {
      params: { ...paginationDto },
    });

    return {
      chats: res.data,
      cnt: res.headers['x-total-count'],
    };
  }

  async update(userId: number, updateUserDto: FormData): Promise<User> {
    const res = await $api.patch(`user/${userId}`, updateUserDto);
    return res.data;
  }

  async delete(userId: number): Promise<User> {
    const res = await $api.delete(`user/${userId}`);
    return res.data;
  }
}

export const userService = new UserService();