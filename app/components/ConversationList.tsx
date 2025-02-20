import { Button } from "@/components/ui/button";
import { Plus, Share, Trash } from "lucide-react";
import { useEffect } from "react";
import { useConversations } from "../hooks/useConversations";

type ConversationListProps = {
  activeConversationId: string | null
  onSelectConversation?: (id: string) => void
}

export default function ConversationList({ activeConversationId, onSelectConversation }: ConversationListProps) {
  const { conversations, loading, error, create } = useConversations();

  const handleNewChat = async () => {
    try {
      const newConversation = await create();
      onSelectConversation?.(newConversation.id);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  useEffect(() => {
    console.log("Active conversation on ConversationList mount:", activeConversationId);
  }, [activeConversationId]);

  if (loading) {
    return <div className="w-72 md:64 h-full bg-gray-100 p-4">Loading...</div>;
  }

  if (error) {
    return <div className="w-72 md:64 h-full bg-gray-100 p-4">Error: {error}</div>;
  }

  return (
    <div className="w-72 md:64 h-full bg-gray-100 p-4 overflow-y-auto border-r border-gray-200">
      <h2 className="px-4 py-2 text-lg font-semibold mb-4 text-gray-700">Conversations</h2>
      <Button
        variant="outline"
        className="w-full mb-4 flex items-center justify-start"
        onClick={handleNewChat}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Chat
      </Button>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <div key={conv.id} className="relative group">
            <Button
              variant="ghost"
              className={`w-full justify-start text-gray-600 hover:bg-gray-200 hover:text-gray-900 ${
                conv.id === activeConversationId ? "bg-gray-200" : ""
              }`}
              onClick={() => onSelectConversation?.(conv.id)}
            >
              {conv.name}
            </Button>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden group-hover:flex space-x-1">
              <Button variant="ghost" size="icon" className="w-6 h-6 p-0">
                <Trash className="w-4 h-4 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6 p-0">
                <Share className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

