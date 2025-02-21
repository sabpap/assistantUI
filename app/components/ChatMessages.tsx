"use client"

import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useMessages } from "../hooks/useMessages"
import ChatInput from './ChatInput'
import { Toast } from './Toast'

type ChatMessagesProps = {
  conversationId: string | null
}

export default function ChatMessages({ conversationId }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [likeStates, setLikeStates] = useState<{ [key: string]: "like" | "dislike" | null }>({})
  const [newMessage, setNewMessage] = useState<string | undefined>();
  const [pendingReply, setPendingReply] = useState(false);
  const {
    messages,
    loading: isLoading,
    ephemeralMessage,
    displayedText,
    isTypingComplete,
    shouldScroll,
    setShouldScroll
  } = useMessages(conversationId, newMessage);
  const [showToast, setShowToast] = useState(false);
  const downloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldScroll(false);
    }
  }, [shouldScroll, setShouldScroll, displayedText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Combined useEffect for logging and state reset
  useEffect(() => {
    // Logging
    console.log("Active conversation on ChatMessages mount:", conversationId);
    console.log("Current messages:", messages);

    // Reset states
    setCopiedStates({});
    setLikeStates({});
    setShowToast(false);
    setNewMessage(undefined); // Reset new message state

    // Clear any existing timeout
    if (downloadTimeoutRef.current) {
      clearTimeout(downloadTimeoutRef.current);
    }
  }, [conversationId, messages, newMessage]);

  const handleCopy = useCallback((messageId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedStates((prev) => ({ ...prev, [messageId]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [messageId]: false }))
      }, 2000)
    })
  }, [])

  const downloadMessages = useCallback((messageId: string) => {
    // Clear any existing timeout
    if (downloadTimeoutRef.current) {
      clearTimeout(downloadTimeoutRef.current);
    }

    // Set new timeout
    downloadTimeoutRef.current = setTimeout(() => {
      const currentMessageIndex = messages.findIndex(m => m.id == messageId);
      if (currentMessageIndex < 1) return; // Ensure there's a previous message

      const relevantMessages = messages.slice(currentMessageIndex - 1, currentMessageIndex + 1);
      const jsonContent = JSON.stringify(relevantMessages, null, 2);

      // Create blob and download
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback-${messageId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      downloadTimeoutRef.current = null;
    }, 100); // Small delay to prevent double downloads
  }, [messages]);

  const handleLikeDislike = useCallback((messageId: string, action: "like" | "dislike") => {
    setLikeStates((prev) => {
      const newState = prev[messageId] === action ? null : action;

      if (newState === 'dislike') {
        downloadMessages(messageId);
        setShowToast(true);
      }

      return { ...prev, [messageId]: newState };
    });
  }, [downloadMessages]);

  const handleSendMessage = (message: string) => {
    setPendingReply(true);
    setNewMessage(message);
  };

  // Reset pendingReply when we get a new assistant message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (pendingReply && lastMessage?.role === 'assistant') {
      setPendingReply(false);
    }
  }, [messages]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((message, index) => {
          return (
            <div key={message.id}>
              <div className={`flex items-end ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col group">
                  <div
                    className={`max-w-md px-4 py-2 rounded-xl cursor-pointer relative ${
                      message.role === "user" ? "bg-purple-light text-gray-800" : "bg-gray-100 text-gray-800"
                    }`}
                    onClick={() => handleCopy(message.id.toString(), message.content)}
                  >
                    <p className="px-2 py-1">
                        {message.content}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(message.id.toString(), message.content);
                      }}
                      className="absolute right-1 top-1 rounded-full bg-transparent hover:bg-gray-200 transition-colors duration-200 border border-gray-300 opacity-0 group-hover:opacity-100"
                    >
                      {copiedStates[message.id] ? (
                        <Check className="w-3 h-3 text-gray-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-col">
                    {message.role === "assistant" && (
                      <div className="relative">
                        <div className="flex space-x-2 mt-1">
                          <button
                            onClick={() => handleLikeDislike(message.id.toString(), "like")}
                            className={`p-1 rounded-md bg-transparent hover:bg-gray-200 transition-colors duration-200 border border-gray-300 ${
                              likeStates[message.id] === "like" ? "bg-green-100" : ""
                            }`}
                          >
                            <ThumbsUp
                              className={`w-3 h-3 ${likeStates[message.id] === "like" ? "text-green-500" : "text-gray-500"}`}
                            />
                          </button>
                          <button
                            onClick={() => handleLikeDislike(message.id.toString(), "dislike")}
                            className={`p-1 rounded-md bg-transparent hover:bg-gray-200 transition-colors duration-200 border border-gray-300 ${
                              likeStates[message.id] === "dislike" ? "bg-red-100" : ""
                            }`}
                          >
                            <ThumbsDown
                              className={`w-3 h-3 ${likeStates[message.id] === "dislike" ? "text-red-500" : "text-gray-500"}`}
                            />
                          </button>
                        </div>
                        {showToast && likeStates[message.id] === "dislike" && (
                          <div className="absolute left-0 mt-1">
                            <Toast
                              message="Feedback saved and downloaded"
                              onClose={() => setShowToast(false)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {ephemeralMessage && (
          <div key={ephemeralMessage.id}>
            <div className="flex items-end justify-start">
              <div className="flex flex-col group">
                <div className="max-w-md px-4 py-2 rounded-xl relative bg-gray-100 text-gray-800">
                  <p className="px-2 py-1">
                    {displayedText}
                    {!isTypingComplete && (
                      <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse" />
                    )}
                  </p>
                </div>
                {isTypingComplete && (
                  <div className="relative">
                    <div className="flex space-x-2 mt-1">
                      <button
                        onClick={() => handleLikeDislike(ephemeralMessage.id.toString(), "like")}
                        className={`p-1 rounded-md bg-transparent hover:bg-gray-200 transition-colors duration-200 border border-gray-300 ${
                          likeStates[ephemeralMessage.id] === "like" ? "bg-green-100" : ""
                        }`}
                      >
                        <ThumbsUp
                          className={`w-3 h-3 ${likeStates[ephemeralMessage.id] === "like" ? "text-green-500" : "text-gray-500"}`}
                        />
                      </button>
                      <button
                        onClick={() => handleLikeDislike(ephemeralMessage.id.toString(), "dislike")}
                        className={`p-1 rounded-md bg-transparent hover:bg-gray-200 transition-colors duration-200 border border-gray-300 ${
                          likeStates[ephemeralMessage.id] === "dislike" ? "bg-red-100" : ""
                        }`}
                      >
                        <ThumbsDown
                          className={`w-3 h-3 ${likeStates[ephemeralMessage.id] === "dislike" ? "text-red-500" : "text-gray-500"}`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isPendingReply={pendingReply}
      />
    </>
  )
}

