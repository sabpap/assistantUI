// 📁 /providers/localStorageChatProvider.ts

import { Conversation, Message } from "../types";
import { Store } from "./store";

export const StoreLocalStorage: Store = {
  async fetchConversations(): Promise<Conversation[]> {
    return JSON.parse(localStorage.getItem("conversations") || "[]");
  },

  async fetchMessages(conversationId: string): Promise<Message[]> {
    return JSON.parse(localStorage.getItem(`messages-${conversationId}`) || "[]");
  },

  async createMessage(conversationId: string, message: Message): Promise<Message[]> {
    const messages = JSON.parse(localStorage.getItem(`messages-${conversationId}`) || "[]");
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: message.content,
      role: message.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    messages.push(newMessage);
    localStorage.setItem(`messages-${conversationId}`, JSON.stringify(messages));
    return messages;
  },

  async createConversation(): Promise<Conversation> {
    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      name: "Chat #" + (conversations.length + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
    };

    conversations.push(newConversation);
    localStorage.setItem("conversations", JSON.stringify(conversations));
    return newConversation;
  },

  async renameConversation(id: string, name: string): Promise<void> {
    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
    const updated = conversations.map((conv: Conversation) => (conv.id === id ? { ...conv, name } : conv));
    localStorage.setItem("conversations", JSON.stringify(updated));
  },

  async deleteConversation(id: string): Promise<void> {
    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
    const updated = conversations.filter((conv: Conversation) => conv.id !== id);
    localStorage.setItem("conversations", JSON.stringify(updated));
  },

  async editMessage(messageId: string, newContent: string): Promise<Message> {
    return { id: messageId, content: newContent, role: "user", created_at: "", updated_at: "" };
  },
};
