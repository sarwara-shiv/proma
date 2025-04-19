export interface ReadStatus {
    userId: string;
    status: 'read' | 'unread';
  }
  
  export interface MessageType {
    _id?: string;
    content: string;
    sender: string;
    receiver?: string;
    group?: string;
    readStatus: ReadStatus[];
    createdAt?: Date;
    updatedAt?: Date;
    status: 'sent' | 'delivered' | 'seen';
    likes: string[];
    pinned: 'none' | 'personal' | 'group';
    replyTo?: string;
  }


  export interface ChatGroupType{
    _id:string,
    user:string,
    name:string,
    description?:string
    members:string[],
    status:'active'|'inactive';
    pinnedMessages?:MessageType[]
  }
  
  export interface ChatState {
    messages: MessageType[];
    unreadCount: number;
    onlineUsers: string[];
    groups: string[];
  }
  