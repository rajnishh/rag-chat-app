import React from 'react';
import { Plus, Star, Trash2, MessageSquare, Clock, Search, Edit3, Check, X, Menu } from 'lucide-react';
import { useSessions } from '../../hooks/useSessions';
import { formatDistanceToNow } from 'date-fns';
import './SessionSidebar.css';

const SessionSidebar = ({ 
  userId, 
  currentSession, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  onOpenChatHistory  // New prop for opening chat history page
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

  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingSessionId, setEditingSessionId] = React.useState(null);
  const [editingTitle, setEditingTitle] = React.useState('');
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const editInputRef = React.useRef(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = React.useState({ isOpen: false, sessionId: null });

  // Original effect for debugging
  React.useEffect(() => {
    console.log('Sessions in sidebar:', sessions);
    console.log('Current session:', currentSession);
  }, [sessions, currentSession]);

  // Original effect for fetching sessions
  React.useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, [userId, fetchSessions]);

  // Focus and select text when editing starts
  React.useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSessionId]);

  // Clear search when collapsed
  React.useEffect(() => {
    if (isCollapsed) {
      setSearchQuery('');
      setEditingSessionId(null);
    }
  }, [isCollapsed]);

  // Filter sessions based on search
  const filteredSessions = React.useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    
    return sessions.filter(session =>
      session.sessionName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sessions, searchQuery]);

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteSession(sessionId);
        onDeleteSession?.(sessionId);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleDeleteClick = (sessionId, e) => {
    e.stopPropagation();
    setDeleteConfirmModal({ isOpen: true, sessionId });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmModal.sessionId) {
      onDeleteSession(deleteConfirmModal.sessionId);
      setDeleteConfirmModal({ isOpen: false, sessionId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, sessionId: null });
  };

  const handleToggleFavorite = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await toggleFavorite(sessionId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleEditStart = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.sessionName || 'Untitled Chat');
  };

  const handleEditSave = async () => {
    if (!editingTitle.trim()) return;
    
    try {
      await updateSession(editingSessionId, { sessionName: editingTitle.trim() });
      setEditingSessionId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleSessionClick = (sessionId) => {
    if (editingSessionId !== sessionId) {
      onSelectSession(sessionId);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleChatHistoryClick = () => {
    if (isCollapsed && onOpenChatHistory) {
      onOpenChatHistory();
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
      <div className={`modern-session-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="error-state">
          <MessageSquare size={isCollapsed ? 24 : 32} className="error-icon" />
          {!isCollapsed && (
            <>
              <h3>Unable to load conversations</h3>
              <p>{error}</p>
              <button onClick={fetchSessions} className="retry-button">
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`modern-session-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className={`header-controls ${isCollapsed ? 'collapsed' : ''}`}>
          <button 
            className="hamburger-button"
            onClick={handleToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={18} />
          </button>
          
          {!isCollapsed && (
            <button 
              className="new-chat-button"
              onClick={onNewChat}
              disabled={isLoading}
            >
              <Plus size={18} />
              <span>New Chat</span>
            </button>
          )}
        </div>
        
        {isCollapsed && (
          <div className="collapsed-actions">
            <button 
              className="new-chat-button icon-only"
              onClick={onNewChat}
              disabled={isLoading}
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className={`search-container ${isCollapsed ? 'collapsed' : ''}`}>
          {isCollapsed ? (
            <button 
              className="search-icon-button"
              onClick={handleChatHistoryClick}
              title="Open Chat History"
            >
              <Search size={16} />
            </button>
          ) : (
            <>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </>
          )}
        </div>
      </div>

      <div className="sessions-list">
        {isLoading && sessions.length === 0 ? (
          <div className="sessions-loading">
            <div className="loading-skeleton"></div>
            <div className="loading-skeleton"></div>
            <div className="loading-skeleton"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="sessions-empty">
            <MessageSquare size={isCollapsed ? 20 : 32} />
            {!isCollapsed && (
              <>
                <h3>{searchQuery ? "No matches found" : "No conversations yet"}</h3>
                <p>{searchQuery ? "Try different search terms" : "Start your first chat to get going!"}</p>
              </>
            )}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isEditing = editingSessionId === session.id;
            const isActive = currentSession?.id === session.id;
            
            return (
              <React.Fragment key={session.id}>
                <div
                  className={`session-card ${isActive ? 'active' : ''} ${isEditing ? 'editing' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                  onClick={() => isCollapsed ? handleChatHistoryClick() : handleSessionClick(session.id)}
                  title={isCollapsed ? session.sessionName || 'Untitled Chat' : ''}
                >
                  <div className="session-main">
                    {isCollapsed ? (
                      <div className="session-collapsed-content">
                        <div className="session-icon">
                          <MessageSquare size={20} />
                          {session.isFavorite && (
                            <Star size={10} className="favorite-badge" fill="currentColor" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="session-header">
                          {isEditing ? (
                            <div className="title-edit-container">
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                className="title-edit-input"
                                maxLength={100}
                                placeholder="Enter title..."
                              />
                              <div className="edit-actions">
                                <button
                                  onClick={handleEditSave}
                                  className="edit-save-btn"
                                  disabled={!editingTitle.trim()}
                                  title="Save"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="edit-cancel-btn"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="session-title">
                              {session.isFavorite && (
                                <Star size={14} className="favorite-icon" fill="currentColor" />
                              )}
                              <span className="title-text">
                                {session.sessionName || 'Untitled Chat'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {!isEditing && (
                          <div className="session-meta">
                            <span className="session-time">
                              <Clock size={12} />
                              {formatDistanceToNow(new Date(session.updatedAt || session.createdAt), { 
                                addSuffix: true 
                              })}
                            </span>
                            <span className="message-count">
                              {session.messageCount || 0}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!isEditing && !isCollapsed && (
                    <div className="session-actions">
                      <button
                        className="action-button edit-btn"
                        onClick={(e) => handleEditStart(session, e)}
                        title="Rename conversation"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="action-button favorite-btn"
                        onClick={(e) => handleToggleFavorite(session.id, e)}
                        title={session.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star 
                          size={14} 
                          fill={session.isFavorite ? "currentColor" : "none"} 
                        />
                      </button>
                      <button
                        className="action-button delete-btn"
                        onClick={(e) => handleDeleteClick(session.id, e)}
                        title="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirmModal.isOpen && deleteConfirmModal.sessionId === session.id && (
                  <div className="modal-overlay" onClick={handleDeleteCancel}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                      <div className="modal-header">
                        <h3>Delete Chat</h3>
                      </div>
                      <div className="modal-body">
                        <p>Are you sure you want to delete this chat?</p>
                        <p className="warning-text">This action cannot be undone.</p>
                      </div>
                      <div className="modal-footer">
                        <button className="btn-cancel" onClick={handleDeleteCancel}>
                          Cancel
                        </button>
                        <button className="btn-delete" onClick={handleDeleteConfirm}>
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <div className={`user-badge ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="user-avatar">
            {userId?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{userId}</div>
              <div className="conversation-stats">
                {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="collapsed-stats">
              {sessions.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionSidebar;