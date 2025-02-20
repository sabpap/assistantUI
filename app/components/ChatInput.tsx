"use client"

import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"

type ChatInputProps = {
  onSendMessage: (message: string) => void
  isLoading: boolean
  isPendingReply?: boolean
}

export default function ChatInput({ onSendMessage, isLoading, isPendingReply = false }: ChatInputProps) {
  const [input, setInput] = useState("")
  const isDisabled = isLoading || isPendingReply;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when input becomes enabled
  useEffect(() => {
    if (!isDisabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isDisabled]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() && !isDisabled) {
      onSendMessage(input)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isDisabled) {
        onSendMessage(input)
        setInput("")
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= 300) {
      setInput(text)
    }
  }

  return (
    <div>
      {isDisabled && (
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"/>
          <p className="text-sm text-gray-500">Thinking...</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="py-6 px-4 bg-background">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={`w-full h-12 md:h-24 pt-2 pr-12 resize-none rounded-md border-4 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
              isDisabled ? 'opacity-50 bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={isDisabled}
          />
          <div className="absolute bottom-2 right-12 text-xs text-gray-400">
            {input.length}/300
          </div>
          <Button
            type="submit"
            className="absolute m-0.5 top-1 right-1 bg-black hover:bg-purple-dark text-white
              disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
            disabled={isDisabled}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

