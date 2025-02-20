"use client"

import { useEffect, useState } from "react"

export function useTypingEffect(text: string, speed = 50) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  useEffect(() => {
    let i = 0
    setDisplayedText("")
    setIsTypingComplete(false)

    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i))
        i++
      } else {
        clearInterval(typingInterval)
        setIsTypingComplete(true)
      }
    }, speed)

    return () => clearInterval(typingInterval)
  }, [text, speed])

  return { displayedText, isTypingComplete }
}

