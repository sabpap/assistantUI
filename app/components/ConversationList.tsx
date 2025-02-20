import { Button } from "@/components/ui/button";
import { Plus, Share, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { Toast, type ToastState } from './Toast';

type ConversationListProps = {
  activeConversationId: string | null
  onSelectConversation?: (id: string | null) => void
}

export default function ConversationList({ activeConversationId, onSelectConversation }: ConversationListProps) {
  const { conversations, loading, error, create, deleteConversation } = useConversations();
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    show: false
  });
  const { getMessages } = useMessages(null);

  const handleNewChat = async () => {
    try {
      const newConversation = await create();
      onSelectConversation?.(newConversation.id);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      if (id === activeConversationId) {
        onSelectConversation?.(null);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleExport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const conversation = conversations.find(conv => conv.id === id);
      if (!conversation) return;

      const messages = await getMessages(id);

      if (!messages || messages.length === 0) {
        setToast({
          message: "Chat empty, export failed",
          type: 'error',
          show: true
        });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
        return;
      }

      const exportData = {
        conversation,
        messages,
        exportDate: new Date().toISOString()
      };

      const jsonContent = JSON.stringify(exportData, null, 2);

      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${id}-${conversation.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setToast({
        message: "Conversation exported successfully",
        type: 'success',
        show: true
      });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    } catch (error) {
      console.error("Failed to export conversation:", error);
      setToast({
        message: "Export failed",
        type: 'error',
        show: true
      });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
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
      <h2 className="px-4 py-2 text-lg font-semibold mb-4 text-gray-700">Chat History</h2>
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
              className={`w-full justify-start text-gray-600 hover:bg-gray-200 hover:text-gray-900 font-semibold ${
                conv.id === activeConversationId ? "bg-gray-200" : ""
              }`}
              onClick={() => onSelectConversation?.(conv.id)}
            >
              {conv.name}
            </Button>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden group-hover:flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 p-0"
                onClick={(e) => handleDelete(conv.id, e)}
              >
                <Trash className="w-4 h-4 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 p-0"
                onClick={(e) => handleExport(conv.id, e)}
              >
                <Share className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {toast.show && (
        <div className="fixed bottom-4 right-4">
          <Toast
            message={toast.message}
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
            variant={toast.type}
          />
        </div>
      )}
    </div>
  )
}

