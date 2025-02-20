"use client"

import { useEffect, useState } from "react"
import ChatMessages from "./components/ChatMessages"
import ConversationList from "./components/ConversationList"
import { config } from "./config"
import { useConversations } from "./hooks/useConversations"

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const { conversations, loading: conversationsLoading } = useConversations()

  // Set the first conversation as active when conversations are loaded
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id)
    }
  }, [conversations, activeConversationId])

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-center">
        <button
          className="px-4 sm:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {/* You can replace this with an icon of your choice */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="text-2xl font-bold">{config.appTitle}</h1>
        <div className="w-6 sm:hidden" /> {/* Spacer for centering */}
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className={`
          ${isSidebarOpen ? 'fixed inset-0 z-50 bg-background' : 'hidden'}
          sm:relative sm:block
        `}>
          <ConversationList
            activeConversationId={activeConversationId ?? null}
            onSelectConversation={setActiveConversationId}
          />
          {isSidebarOpen && (
            <button
              className="absolute top-4 right-4 sm:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              {/* Close icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-full sm:w-[60%] mx-auto flex flex-col p-4">
            {!activeConversationId && !conversationsLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Create a new conversation to get started
              </div>
            ) : (
              <ChatMessages
                key={activeConversationId}
                conversationId={activeConversationId}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

