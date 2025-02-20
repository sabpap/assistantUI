export type Message = {
    id: string;
    content: string;
    role: "user" | "assistant"; // Assuming only two roles
    created_at: string;
    updated_at: string;
  };

  export type Conversation = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    messages?: Message[]; // Only when fetching messages
  };
