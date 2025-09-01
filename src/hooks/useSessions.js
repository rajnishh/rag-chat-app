import { useState, useCallback } from 'react';
import { chatAPI } from '../services/api';

export const useSessions = (userId) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await chatAPI.getSessions(userId);
      
      // Handle the extracted data
      let sessionsData = response.data;
      
      // If we didn't get an array, try to extract manually
      if (!Array.isArray(sessionsData)) {
        console.warn('Sessions data is not array, attempting extraction:', sessionsData);
        
        // Try different extraction patterns
        if (sessionsData?.data?.content) {
          sessionsData = sessionsData.data.content;
        } else if (sessionsData?.content) {
          sessionsData = sessionsData.content;
        } else if (sessionsData?.data && Array.isArray(sessionsData.data)) {
          sessionsData = sessionsData.data;
        } else {
          sessionsData = [];
        }
      }
      setSessions(sessionsData);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch sessions';
      setError(errorMsg);
      console.error('Error fetching sessions:', err);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createSession = useCallback(async (sessionData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await chatAPI.createSession(sessionData);
      await fetchSessions(); // Refresh the list
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
      console.error('Error creating session:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSessions]);

  const updateSession = useCallback(async (sessionId, updateData) => {
    try {
      setError(null);
      
      // Optimistically update the UI
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, ...updateData, updatedAt: new Date().toISOString() }
            : session
        )
      );
      
      const response = await chatAPI.updateSession(sessionId, userId, updateData);
      
      // Refresh from server to ensure consistency
      await fetchSessions();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update session');
      console.error('Error updating session:', err);
      
      // Revert optimistic update on error
      await fetchSessions();
      throw err;
    }
  }, [userId, fetchSessions]);

  const deleteSession = useCallback(async (sessionId) => {
    try {
      setError(null);
      
      // Optimistically remove from UI
      setSessions(prevSessions => 
        prevSessions.filter(session => session.id !== sessionId)
      );
      
      await chatAPI.deleteSession(sessionId, userId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete session');
      console.error('Error deleting session:', err);
      
      // Revert optimistic update on error
      await fetchSessions();
      throw err;
    }
  }, [userId, fetchSessions]);

  const toggleFavorite = useCallback(async (sessionId) => {
    try {
      setError(null);
      
      // Find current session
      const currentSession = sessions.find(s => s.id === sessionId);
      if (!currentSession) return;
      
      // Optimistically update the UI
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, isFavorite: !session.isFavorite, updatedAt: new Date().toISOString() }
            : session
        )
      );
      
      const response = await chatAPI.toggleFavorite(sessionId, userId);
      
      // Refresh from server to ensure consistency
      setTimeout(() => fetchSessions(), 100); // Small delay to prevent race conditions
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle favorite');
      console.error('Error toggling favorite:', err);
      
      // Revert optimistic update on error
      await fetchSessions();
      throw err;
    }
  }, [userId, sessions, fetchSessions]);

  const getFavoriteSessions = useCallback(() => {
    return sessions.filter(session => session.isFavorite);
  }, [sessions]);

  const getSessionById = useCallback((sessionId) => {
    return sessions.find(session => session.id === sessionId);
  }, [sessions]);

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    toggleFavorite,
    getFavoriteSessions,
    getSessionById,
    setError
  };
};