import { useEffect, useState } from "react";
import { StoreService } from "../stores/index";
import { Message } from "../types";

export function useMessages(activeConversationId: string | null, newMessage?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ephemeralMessage, setEphemeralMessage] = useState<Message | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);


  // Add getMessages function that uses StoreService
  const getMessages = async (conversationId: string) => {
    try {
      return await StoreService.fetchMessages(conversationId);
    } catch (err) {
      console.error('Error fetching messages:', err);
      throw err;
    }
  };

  const typeCharacter = async (text: string, index: number) => {
    if (index <= text.length) {
      setDisplayedText(text.slice(0, index));
      setShouldScroll(true);
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

      // Make request to our Next.js API route instead of directly to external service
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: content, conversation: newMessages })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantReply = data.res;

      // Create ephemeral message
      const ephemeralAssistantMessage: Message = {
        id: crypto.randomUUID(),
        content: assistantReply,
        role: "assistant",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setEphemeralMessage(ephemeralAssistantMessage);
      setDisplayedText("");
      setIsTypingComplete(false);

      // Improved typing effect with adaptive speed
      const typeCharacter = async (text: string, index: number) => {
        if (index <= text.length) {
          setDisplayedText(text.slice(0, index));
          setShouldScroll(true);

          if (index < text.length) {
            // Faster typing speed (reduced from 30ms to 15ms)
            // For longer messages, increase the speed even more
            const delay = text.length > 100 ? 10 : 15;
            await new Promise(resolve => setTimeout(resolve, delay));
            await typeCharacter(text, index + (text.length > 200 ? 2 : 1)); // Skip characters for very long messages
          } else {
            setIsTypingComplete(true);
          }
        }
      };

      // Start the typing effect
      await typeCharacter(assistantReply, 0);

      // Save the message to storage after typing is complete
      const updatedMessages = await StoreService.createMessage(activeConversationId, ephemeralAssistantMessage);
      setMessages(updatedMessages);
      setEphemeralMessage(null);
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
    clear: () => setMessages([]),
    ephemeralMessage,
    displayedText,
    isTypingComplete,
    shouldScroll,
    setShouldScroll,
  };
}
