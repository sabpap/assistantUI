/**
 * Application configuration loaded from environment variables
 */
export const config = {
  /**
   * The application title displayed in various places throughout the app
   * Loads from APP_TITLE environment variable, defaults to "AssistantChatApp"
   */
  appTitle: process.env.APP_TITLE || "AssistantChatApp",
}