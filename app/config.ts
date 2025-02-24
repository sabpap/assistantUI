/**
 * Application configuration loaded from environment variables
 */
console.log(process.env.NEXT_PUBLIC_APP_TITLE)
export const config = {
  /**
   * The application title displayed in various places throughout the app
   * Loads from NEXT_PUBLIC_APP_TITLE environment variable, defaults to "AssistantChatApp"
   */


  appTitle: process.env.NEXT_PUBLIC_APP_TITLE || "AssistantChatApp",
  chatApiEndpoint: process.env.NEXT_PUBLIC_CHAT_API_ENDPOINT || "http://localhost:3000/api/chat",
  chatApiMethod: process.env.NEXT_PUBLIC_CHAT_API_METHOD || "POST",
  chatApiToken: process.env.NEXT_PUBLIC_CHAT_API_TOKEN || "",
}