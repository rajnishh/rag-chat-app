import { useState, useCallback, useRef } from 'react';
import { chatAPI } from '../services/api';

// Helper function to generate a title from the first message (similar to ChatGPT)
const generateTitleFromMessage = (message) => {
  // Remove extra whitespace and limit to 50 characters
  const cleaned = message.trim().replace(/\s+/g, ' ');
  
  // If it's a question, keep it as is (up to 50 chars)
  if (cleaned.endsWith('?')) {
    return cleaned.length > 50 ? cleaned.substring(0, 47) + '...' : cleaned;
  }
  
  // If it's a statement, try to make it more title-like
  const words = cleaned.split(' ');
  
  // Take first few words that fit within 50 characters
  let title = '';
  for (const word of words) {
    if ((title + ' ' + word).length > 50) break;
    title = title ? title + ' ' + word : word;
  }
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Add ellipsis if we truncated
  if (title.length < cleaned.length) {
    title += '...';
  }
  
  return title || 'New Chat';
};

export const useChat = (userId) => {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);

  const abortControllerRef = useRef(null);

  // Add clearMessages function
  const clearMessages = useCallback(() => {
    console.log('Clearing messages...');
    setMessages([]);
    setEditingMessageId(null);
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Fetch all sessions for user
  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getSessions(userId);
      setSessions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch messages for a session - FIXED VERSION
  const fetchMessages = useCallback(async (sessionId, preserveCurrentSession = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setIsLoading(true);
      const response = await chatAPI.getMessages(
        sessionId, 
        userId, 
        0, 
        100,
        { signal: abortControllerRef.current.signal }
      );
      
      // Ensure we have an array of messages
      let messagesData = response.data;
      if (!Array.isArray(messagesData)) {
        console.warn('Expected array but got:', messagesData);
        messagesData = [];
      }
      
      setMessages(messagesData);
      
      // FIXED: Only update currentSession if we're not preserving it or if it's null
      if (!preserveCurrentSession || !currentSession) {
        const sessionFromList = sessions.find(s => s.id === sessionId);
        if (sessionFromList) {
          setCurrentSession(sessionFromList);
        } else {
          // If session not found in list, create a minimal session object
          setCurrentSession({ id: sessionId, sessionName: 'Loading...' });
          // Refresh sessions to get the latest data
          setTimeout(() => fetchSessions(), 100);
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.response?.data?.message || 'Failed to fetch messages');
        setMessages([]); // Set empty array on error
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, sessions, currentSession, fetchSessions]);

  // Start new chat with auto-generated title
  const startNewChat = useCallback(async (message, customTitle = null) => {
    try {
      setIsLoading(true);
      
      // Generate title from message if no custom title provided
      const title = customTitle || generateTitleFromMessage(message);
      
      // Use the demo endpoint to start a new chat with LLM
      const response = await chatAPI.demoNewChat(userId, message, title);
      const newSession = response.data;
      
      setCurrentSession(newSession);
      
      // Add new session to sessions list immediately
      setSessions(prevSessions => [newSession, ...prevSessions]);
      
      // Fetch messages for the new session (preserve currentSession)
      await fetchMessages(newSession.id, true);
      
      // Refresh sessions list in background
      setTimeout(() => fetchSessions(), 500);
      
      return newSession;
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start new chat');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchMessages, fetchSessions]);

  // Send a message - FIXED VERSION
  const sendMessage = useCallback(async (content, contextData = null) => {
    if (!currentSession) {
      // If no current session, start a new chat
      return startNewChat(content);
    }
    
    try {
      setIsLoading(true);
      
      // Store current session reference to prevent it from being cleared
      const sessionRef = currentSession;
      
      // Add user message immediately for better UX
      const userMessage = {
        id: `temp-user-${Date.now()}`,
        content,
        senderType: 'USER',
        contextData,
        createdAt: new Date().toISOString(),
        sessionId: sessionRef.id,
        isTemp: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // For followup messages, use the demo chat endpoint with sessionId
      const response = await chatAPI.demoChat(sessionRef.id, userId, content);
      
      // Refresh messages while preserving currentSession
      await fetchMessages(sessionRef.id, true);
      
      // Refresh sessions to update last message preview
      setTimeout(() => fetchSessions(), 100);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(m => !m.isTemp));
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, userId, fetchSessions, fetchMessages, startNewChat]);

  // Retry last AI message
  const retryMessage = useCallback(async (messageId) => {
    if (!currentSession) return;

    try {
      setIsLoading(true);
      
      const sessionRef = currentSession;
      
      // Find the message to retry and the user message before it
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;
      
      const messageToRetry = messages[messageIndex];
      if (messageToRetry.senderType !== 'ASSISTANT') return;
      
      // Find the user message that triggered this AI response
      const userMessage = messages[messageIndex - 1];
      if (!userMessage || userMessage.senderType !== 'USER') return;
      
      // Remove the AI message that we're retrying
      setMessages(prev => prev.filter(m => m.id !== messageId));
      
      // Retry by sending the user message again
      const response = await chatAPI.demoChat(sessionRef.id, userId, userMessage.content);
      
      // Refresh messages to get the new AI response
      await fetchMessages(sessionRef.id, true);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retry message');
      // Restore the original message on error
      await fetchMessages(currentSession.id, true);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, userId, messages, fetchMessages]);

  // Edit and resend user message
  const editMessage = useCallback(async (messageId, newContent) => {
    if (!currentSession) return;

    try {
      setIsLoading(true);
      
      const sessionRef = currentSession;
      
      // Find the message to edit
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;
      
      const messageToEdit = messages[messageIndex];
      if (messageToEdit.senderType !== 'USER') return;
      
      // Remove all messages from this point onwards (including AI responses)
      const messagesToKeep = messages.slice(0, messageIndex);
      setMessages(messagesToKeep);
      
      // Send the edited message
      await sendMessage(newContent);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to edit message');
      // Restore original messages on error
      await fetchMessages(currentSession.id, true);
    } finally {
      setIsLoading(false);
      setEditingMessageId(null);
    }
  }, [currentSession, messages, sendMessage, fetchMessages]);

  // Copy message content to clipboard
  const copyMessage = useCallback(async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      // You can add a toast notification here
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId) => {
    try {
      await chatAPI.deleteSession(sessionId, userId);
      await fetchSessions();
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete session');
    }
  }, [userId, currentSession, fetchSessions]);

  // Delete individual message
  const deleteMessage = useCallback(async (messageId) => {
    if (!currentSession) return;

    try {
      setIsLoading(true);
      
      const sessionRef = currentSession;
      
      // Optimistically remove the message from UI
      setMessages(prev => prev.filter(m => m.id !== messageId));
      
      // Call API to delete the message
      await chatAPI.deleteMessage(sessionRef.id, messageId, userId);
      
      // Refresh messages to ensure consistency
      await fetchMessages(sessionRef.id, true);
      
      // Update session list to reflect any changes
      setTimeout(() => fetchSessions(), 100);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete message');
      // Restore messages on error
      await fetchMessages(currentSession.id, true);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, userId, fetchMessages, fetchSessions]);

  return {
    messages,
    sessions,
    currentSession,
    setCurrentSession,
    isLoading,
    error,
    editingMessageId,
    setEditingMessageId,
    fetchSessions,
    fetchMessages,
    sendMessage,
    startNewChat,
    deleteSession,
    retryMessage,
    editMessage,
    copyMessage,
    deleteMessage,
    setError,
    clearMessages, // Add this to the return object
    generateTitleFromMessage
  };
};