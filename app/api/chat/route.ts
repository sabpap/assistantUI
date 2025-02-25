import { NextResponse } from 'next/server';

export const runtime = "edge";

export async function POST(req: Request) {
    const { query, conversation } = await req.json();

    const chatApiEndpoint = process.env.CHAT_API_ENDPOINT
    const chatApiMethod = process.env.CHAT_API_METHOD
    const chatApiToken = process.env.CHAT_API_TOKEN || "";

    // Prepare headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (chatApiToken) {
        headers['Service-Token'] = chatApiToken;
    }

    // Format conversation for the API
    const formattedConversation = conversation.slice(0, -1).map(msg => ({
        role: msg.role === "user" ? "user" : "bot",
        content: msg.content
    }));

    try {
        // Make the HTTP request to the external service
        const response = await fetch(chatApiEndpoint, {
            method: chatApiMethod,
            headers: headers,
            body: JSON.stringify({
                query: query,
                conversation: formattedConversation
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to get response from chat API' },
            { status: 500 }
        );
    }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type, Service-Token',
        },
    });
}



