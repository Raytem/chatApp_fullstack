
//namespace
'/private-chat'

  'user:online-status'
  //res
  { 
    userId: number,
    isOnline: boolean,
    lastActivity: Date,
  }

  'private-chat:readMsgs'
  //body
  {
    chatId: number,
  }
  //res
  {
    chatId: number;
    readMsgs:{
      msgId: number,
      isRead: boolean,
    }[];
  }

  'private-chat:update' 
  //res
  {
    id: number,
  }

  'private-chat:getOne'
  //body
  {
    chatId: number
  }
  //res
  Chat

  'private-chat:connect'
  //body
  {
    chatId: number,
  }

  'private-chat:leave' 
  //body
  {
    chatId: number,
  }

  'message:post'
  //body
  {
    chatId: number,
    text: string,
  }
  //res 
  Message

  'message:update'
  //body
  {
    msgId: number,
    chatId: number,
    text: number,
  }
  //res
  Message

  'message:remove'
  //body
  {
    msgId: number,
    chatId: number,
  }
  //res
  Message