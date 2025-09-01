import React, { useState, useRef, useEffect } from 'react';
import { Plus, Star, Trash2, MessageSquare, Clock, Edit3, Check, X } from 'lucide-react';
import { useSessions } from '../../hooks/useSessions';
import { formatDistanceToNow } from 'date-fns';
import './SessionSidebar.css';

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, sessionName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Conversation</h3>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete "{sessionName}"?</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-delete" onClick={onConfirm}>
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const SessionSidebar = ({ 
  userId, 
  currentSession, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession 
}) => {
  const { 
    sessions, 
    isLoading, 
    error, 
    fetchSessions, 
    toggleFavorite,
    deleteSession,
    updateSession
  } = useSessions(userId);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, sessionId: null, sessionName: '' });
  const [editingSession, setEditingSession] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [favoriteLoading, setFavoriteLoading] = useState(new Set());
  const editInputRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, [userId, fetchSessions]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingSession && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSession]);

  const handleDeleteClick = (session, e) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      sessionId: session.id,
      sessionName: session.sessionName || 'Untitled Chat'
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSession(deleteModal.sessionId);
      onDeleteSession?.(deleteModal.sessionId);
      setDeleteModal({ isOpen: false, sessionId: null, sessionName: '' });
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, sessionId: null, sessionName: '' });
  };

  const handleToggleFavorite = async (sessionId, e) => {
    e.stopPropagation();
    
    // Prevent multiple simultaneous requests
    if (favoriteLoading.has(sessionId)) return;
    
    try {
      setFavoriteLoading(prev => new Set(prev).add(sessionId));
      await toggleFavorite(sessionId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setFavoriteLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const handleEditStart = (session, e) => {
    e.stopPropagation();
    setEditingSession(session.id);
    setEditTitle(session.sessionName || 'Untitled Chat');
  };

  const handleEditSave = async () => {
    if (!editTitle.trim()) return;
    
    try {
      await updateSession(editingSession, { sessionName: editTitle.trim() });
      setEditingSession(null);
      setEditTitle('');
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingSession(null);
    setEditTitle('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const getMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    
    // Remove markdown syntax for preview
    const text = message.replace(/[#*_~`]/g, '').trim();
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  };

  if (error) {
    return (
      <div className="session-sidebar">
        <div className="error-state">
          <p>Error loading sessions</p>
          <button onClick={fetchSessions} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="session-sidebar">
        <div className="sidebar-header">
          <h2>Conversations</h2>
          <button 
            className="new-chat-button"
            onClick={onNewChat}
            disabled={isLoading}
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div className="sessions-list">
          {isLoading && sessions.length === 0 ? (
            <div className="sessions-loading">
              <MessageSquare size={24} />
              <p>Loading conversations...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="sessions-empty">
              <MessageSquare size={32} />
              <p>No conversations yet</p>
              <p>Start a new chat to begin</p>
            </div>
          ) : (
            sessions.map((session) => {
              return (
                <div
                  key={session.id}
                  className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                  onClick={() => editingSession !== session.id && onSelectSession(session.id)}
                >
                  <div className="session-content">
                    <div className="session-title-wrapper">
                      {editingSession === session.id ? (
                        <div className="session-edit">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="edit-input"
                            maxLength={100}
                          />
                          <div className="edit-actions">
                            <button
                              onClick={handleEditSave}
                              className="edit-save-btn"
                              disabled={!editTitle.trim()}
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="edit-cancel-btn"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="session-title">
                          {session.isFavorite && (
                            <Star size={14} className="favorite-icon" fill="currentColor" />
                          )}
                          {session.sessionName || 'Untitled Chat'}
                        </div>
                      )}
                    </div>
                    
                    {editingSession !== session.id && (
                      <div className="session-meta">
                        <span className="session-time">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(session.updatedAt || session.createdAt), { 
                            addSuffix: true 
                          })}
                        </span>
                        <span className="session-count">
                          {session.messageCount || 0} messages
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {editingSession !== session.id && (
                    <div className="session-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={(e) => handleEditStart(session, e)}
                        title="Rename conversation"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className={`action-btn favorite-btn ${favoriteLoading.has(session.id) ? 'loading' : ''}`}
                        onClick={(e) => handleToggleFavorite(session.id, e)}
                        disabled={favoriteLoading.has(session.id)}
                        title={session.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star 
                          size={14} 
                          fill={session.isFavorite ? "currentColor" : "none"}
                          className={favoriteLoading.has(session.id) ? 'spinning' : ''}
                        />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => handleDeleteClick(session, e)}
                        title="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <strong>User:</strong> {userId}
          </div>
          <div className="session-count">
            {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        sessionName={deleteModal.sessionName}
      />
    </>
  );
};

export default SessionSidebar;