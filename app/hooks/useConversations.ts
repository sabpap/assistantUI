import { useEffect, useState } from "react";
import { config } from "../config";
import { StoreService } from "../stores/index";
import { Conversation } from "../types";


export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    StoreService.fetchConversations()
      .then((data) => {
        // Sort conversations by most recent
        setConversations(data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const create = async () => {
    try {
      const newConversation = await StoreService.createConversation();
      console.log("created newConversation", newConversation);
      setConversations((prev) => [newConversation, ...prev]);

      if (config.appIntroMessage) {
        await StoreService.createMessage(newConversation.id, {
          id: crypto.randomUUID(),
          content: config.appIntroMessage,
          role: "assistant",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      return newConversation;
    } catch (err) {
      console.error("Failed to create conversation:", err);
      throw err;
    }
  };

  const rename = async (id: string, name: string) => {
    try {
      await StoreService.renameConversation(id, name);
      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, name, updated_at: new Date().toISOString() } : conv))
      );
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await StoreService.deleteConversation(id);
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      throw err;
    }
  };

  return { conversations, loading, error, create, rename, deleteConversation };
}
