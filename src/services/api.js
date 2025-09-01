import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/ragchat';
const API_KEY = process.env.REACT_APP_API_KEY;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {

    // Handle your specific API response structure
    if (response.data && typeof response.data === 'object') {
      // Case 1: { data: { content: [...] }, success: true, ... } - Sessions endpoint
      if (response.data.data && response.data.data.content !== undefined) {
        return {
          ...response,
          data: response.data.data.content
        };
      }
      // Case 2: { data: { ... }, success: true, ... } - Single object responses
      else if (response.data.data && typeof response.data.data === 'object') {
        return {
          ...response,
          data: response.data.data
        };
      }
      // Case 3: Direct array or object responses
      else if (response.data.content !== undefined) {
        return response;
      }
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  // Session management
  getSessions: (userId) => api.get(`/api/v1/sessions?userId=${userId}`),
  
  createSession: (data) => api.post('/api/v1/sessions', data),
  
  getSessionById: (sessionId, userId) => 
    api.get(`/api/v1/sessions/${sessionId}?userId=${userId}`),
  
  updateSession: (sessionId, userId, data) => 
    api.put(`/api/v1/sessions/${sessionId}?userId=${userId}`, data),
  
  deleteSession: (sessionId, userId) => 
    api.delete(`/api/v1/sessions/${sessionId}?userId=${userId}`),
  
  toggleFavorite: (sessionId, userId) => 
    api.patch(`/api/v1/sessions/${sessionId}/favorite?userId=${userId}`),

  // Message management
  sendMessage: (sessionId, userId, data) => 
    api.post(`/api/v1/sessions/${sessionId}/messages?userId=${userId}`, data),

  getMessages: (sessionId, userId, page = 0, size = 50) => 
    api.get(`/api/v1/sessions/${sessionId}/messages?userId=${userId}&page=${page}&size=${size}`),

  getAllSessionMessages: (sessionId, userId) => 
    api.get(`/api/v1/sessions/${sessionId}/messages/all?userId=${userId}`),

  getMessageCount: (sessionId, userId) => 
    api.get(`/api/v1/sessions/${sessionId}/messages/count?userId=${userId}`),

  deleteMessage: (sessionId, messageId, userId) => 
    api.delete(`/api/v1/sessions/${sessionId}/messages/${messageId}?userId=${userId}`),

  // Demo endpoints with LLM
  demoChat: (sessionId, userId, message) => 
    api.post(`/api/v1/chat/sessions/${sessionId}?userId=${userId}&message=${encodeURIComponent(message)}`),

  demoNewChat: (userId, message, title) => 
    api.post(`/api/v1/chat/sessions?userId=${userId}&message=${encodeURIComponent(message)}&title=${encodeURIComponent(title || 'New Chat')}`),

  getLLMStatus: () => api.get('/api/v1/chat/status')
};

export default api;