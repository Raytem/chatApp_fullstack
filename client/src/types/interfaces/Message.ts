export interface ChatMemberInfo {
  id: number;
  fullName: string;
}

export interface Message {
  id: number;
  text: string;
  createdAt: string;
  isEdited: boolean;
  isRead: boolean;
  user: ChatMemberInfo;
}