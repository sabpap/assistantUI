import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const userMessage = messages[messages.length - 1].content

  // Simulate a 2-second delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const dummyReply = `You said: "${userMessage}" - This is a dummy reply from the assistant`

  return NextResponse.json({ content: dummyReply })
}

