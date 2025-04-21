export interface ReadStatus {
    user: string;
    status: 'read' | 'unread';
  }
export interface ILikes {
    user: string;
    text: string;
}
export interface IPinned {
    user: string;
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
    likes?: ILikes[];
    stars?: string[];
    pinned?: {personal: string[], group:{ type: Boolean, default: false }};
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
  