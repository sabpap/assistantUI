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
  appIntroMessage: process.env.NEXT_PUBLIC_APP_INTRO_MESSAGE || "Hello, I'm the Assistant. How can I help you today?",
}