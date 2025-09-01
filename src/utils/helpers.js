import { 
  MESSAGE_TYPES, 
  ERROR_MESSAGES, 
  DATE_FORMATS,
  VALIDATION_PATTERNS 
} from './constants';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Validation helpers
export const validateUserId = (userId) => {
  if (!userId) return 'User ID is required';
  if (!VALIDATION_PATTERNS.USER_ID.test(userId)) {
    return 'User ID can only contain letters, numbers, underscores, and hyphens (max 100 characters)';
  }
  return null;
};

export const validateApiKey = (apiKey) => {
  if (!apiKey) return 'API key is required';
  if (!VALIDATION_PATTERNS.API_KEY.test(apiKey)) {
    return 'API key must be at least 40 characters long and contain only letters and numbers';
  }
  return null;
};

export const validateSessionName = (name) => {
  if (!name) return 'Session name is required';
  if (!VALIDATION_PATTERNS.SESSION_NAME.test(name)) {
    return 'Session name contains invalid characters or is too long';
  }
  return null;
};

export const validateMessageContent = (content) => {
  if (!content || content.trim().length === 0) return 'Message content is required';
  if (!VALIDATION_PATTERNS.MESSAGE_CONTENT.test(content)) {
    return 'Message is too long (max 5000 characters)';
  }
  return null;
};

// Date formatting helpers
export const formatMessageTimestamp = (dateString) => {
  const date = new Date(dateString);
  return format(date, DATE_FORMATS.MESSAGE_TIMESTAMP);
};

export const formatSessionDate = (dateString) => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, DATE_FORMATS.SESSION_DATE);
  }
};

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

// Message processing helpers
export const processMessageContent = (content) => {
  // Remove excessive newlines
  return content.replace(/\n{3,}/g, '\n\n');
};

export const truncateMessage = (content, maxLength = 100) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

export const extractCodeBlocks = (content) => {
  const codeBlockRegex = /```(\w+)?\s([\s\S]*?)```/g;
  const matches = [];
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    matches.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }
  
  return matches;
};

// Storage helpers
export const safeLocalStorage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('LocalStorage access failed:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('LocalStorage access failed:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('LocalStorage access failed:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('LocalStorage access failed:', error);
      return false;
    }
  }
};

// Error handling helpers
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    switch (error.response.status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 429:
        return ERROR_MESSAGES.RATE_LIMITED;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 404:
        return error.response.data?.message || ERROR_MESSAGES.SESSION_NOT_FOUND;
      default:
        return error.response.data?.message || ERROR_MESSAGES.SERVER_ERROR;
    }
  } else if (error.request) {
    // Request was made but no response received
    return ERROR_MESSAGES.NETWORK_ERROR;
  } else {
    // Something else happened
    return error.message || ERROR_MESSAGES.SERVER_ERROR;
  }
};

export const isNetworkError = (error) => {
  return error.message === 'Network Error' || !error.response;
};

// Utility functions
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Color utilities
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidFileType = (file, allowedTypes) => {
  if (!allowedTypes || allowedTypes.length === 0) return true;
  return allowedTypes.includes(file.type);
};

// URL utilities
export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

export const setQueryParam = (param, value) => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(param, value);
  window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
};