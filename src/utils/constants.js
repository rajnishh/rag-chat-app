// API Constants
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/ragchat',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// WebSocket Constants
export const WS_CONFIG = {
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,
  MAX_RECONNECT_DELAY: 30000,
  HEARTBEAT_INTERVAL: 30000,
  HEARTBEAT_TIMEOUT: 10000
};

// Application Constants
export const APP_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 5000,
  MAX_SESSION_NAME_LENGTH: 255,
  MAX_USER_ID_LENGTH: 100,
  MESSAGES_PER_PAGE: 50,
  SESSIONS_PER_PAGE: 20,
  TYPING_INDICATOR_DELAY: 1000,
  MESSAGE_DEBOUNCE: 300,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Authentication failed. Please check your API key.',
  RATE_LIMITED: 'Rate limit exceeded. Please try again later.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_REQUEST: 'Invalid request. Please check your input.',
  SESSION_NOT_FOUND: 'Session not found.',
  MESSAGE_NOT_FOUND: 'Message not found.',
  LLM_UNAVAILABLE: 'AI service is currently unavailable.'
};

// Message Types
export const MESSAGE_TYPES = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
  SYSTEM: 'SYSTEM'
};

// Session Status
export const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED'
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_WEBSOCKETS: process.env.REACT_APP_ENABLE_WEBSOCKETS === 'true',
  ENABLE_TYPING_INDICATOR: true,
  ENABLE_MESSAGE_EDITING: false,
  ENABLE_SESSION_SHARING: false,
  ENABLE_FILE_UPLOAD: false
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_ID: 'chatUserId',
  API_KEY: 'chatApiKey',
  SESSIONS_CACHE: 'sessionsCache',
  MESSAGES_CACHE: 'messagesCache',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'themePreference'
};

// Theme Constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Date Formats
export const DATE_FORMATS = {
  MESSAGE_TIMESTAMP: 'HH:mm',
  SESSION_DATE: 'MMM dd, yyyy',
  FULL_DATE: 'PPpp',
  RELATIVE: 'relative'
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  USER_ID: /^[a-zA-Z0-9_-]{1,100}$/,
  API_KEY: /^[a-zA-Z0-9]{40,}$/,
  SESSION_NAME: /^[\w\s\-.,!?()]{1,255}$/,
  MESSAGE_CONTENT: /^[\s\S]{1,5000}$/
};

// Event Names (for analytics)
export const EVENTS = {
  SESSION_CREATED: 'session_created',
  SESSION_DELETED: 'session_deleted',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  ERROR_OCCURRED: 'error_occurred'
};