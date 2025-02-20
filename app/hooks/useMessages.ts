import { useEffect, useState } from "react";
import { StoreService } from "../stores/index";
import { Message } from "../types";

export function useMessages(activeConversationId: string | null, newMessage?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add getMessages function that uses StoreService
  const getMessages = async (conversationId: string) => {
    try {
      return await StoreService.fetchMessages(conversationId);
    } catch (err) {
      console.error('Error fetching messages:', err);
      throw err;
    }
  };

  // Effect to handle new messages
  useEffect(() => {
    if (newMessage && activeConversationId) {
      send(newMessage);
    }
  }, [newMessage, activeConversationId]);

  useEffect(() => {
    // Reset messages when conversation changes or becomes null
    setMessages([]);

    // Don't fetch if there's no active conversation
    if (!activeConversationId) {
      return;
    }

    setLoading(true);
    StoreService.fetchMessages(activeConversationId)
      .then(setMessages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeConversationId]);

  const send = async (content: string) => {
    if (!activeConversationId) {
      console.error("Cannot send message: No active conversation");
      return;
    }

    const tempUserMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const newMessages = await StoreService.createMessage(activeConversationId, tempUserMessage);
      setMessages(newMessages);

      // Fetch the assistant's reply
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const { content: assistantReply } = await response.json();

      // Create and save the assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: assistantReply,
        role: "assistant",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedMessages = await StoreService.createMessage(activeConversationId, assistantMessage);
      setMessages(updatedMessages);
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    getMessages,
    send,
    clear: () => setMessages([])
  };
}
