import { CreateChatDto } from "../../types/dtos/privateChat/CreateChatDto";
import { PrivateChat } from "../../types/interfaces/PrivateChat";
import { $api } from "../http/api";
import { PaginationDto } from "../../types/dtos/PaginationDto";
import { ChatMessagesAndCnt } from "../../types/dtos/privateChat/ChatMessagesAndCnt";
import { UpdateChatDto } from "../../types/dtos/privateChat/UpdateChatDto";

class ChatService {
  async getMessages(chatId: number, paginationDto?: PaginationDto): Promise<ChatMessagesAndCnt> {
    const res = await $api.get(`/message/private-chat/${chatId}`, {
      params: {
        ...paginationDto,
      },
    });

    return {
      messages: res.data,
      cnt: res.headers['x-total-count'],
    };
  }

  async getChatByMemberIds(member1_id: number, member2_id: number) {
    const res = await $api.get(`/private-chat/memberIds/${member1_id}/${member2_id}`);
    return res.data;
  }

  async createChat(createChatDto: CreateChatDto): Promise<PrivateChat> {
    const res = await $api.post(`/private-chat`, createChatDto);
    return res.data;
  }

  async updateChat(chatId: number, updateChatDto: UpdateChatDto): Promise<PrivateChat> {
    const res = await $api.patch(`/private-chat/${chatId}/forUser`, updateChatDto);
    return res.data;
  }
}

export const chatService = new ChatService();