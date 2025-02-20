import { Conversation, Message } from "../types";

export interface Store {
  fetchConversations: () => Promise<Conversation[]>;
  fetchMessages: (conversationId: string) => Promise<Message[]>;
  createMessage: (conversationId: string, message: Message) => Promise<Message[]>;
  createConversation: () => Promise<Conversation>;
  renameConversation: (id: string, name: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<Message>;
}
