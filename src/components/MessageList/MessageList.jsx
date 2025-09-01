import React, { useState } from 'react';
import { Bot, User, Copy, RotateCcw, Edit3, Check, X, Trash2 } from 'lucide-react';
import './MessageList.css';

const MessageList = ({ 
  messages, 
  isLoading, 
  onRetry, 
  onEdit, 
  onCopy,
  onDelete,
  editingMessageId,
  setEditingMessageId 
}) => {
  const [editText, setEditText] = useState('');
  const [copySuccess, setCopySuccess] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, messageId: null });

  const handleEditStart = (message) => {
    setEditingMessageId(message.id);
    setEditText(message.content);
  };

  const handleEditSave = () => {
    if (editText.trim()) {
      onEdit(editingMessageId, editText.trim());
    }
    setEditingMessageId(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleCopy = async (content, messageId) => {
    const success = await onCopy(content);
    if (success) {
      setCopySuccess(messageId);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handleDeleteClick = (messageId) => {
    setDeleteConfirmModal({ isOpen: true, messageId });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmModal.messageId) {
      onDelete(deleteConfirmModal.messageId);
      setDeleteConfirmModal({ isOpen: false, messageId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, messageId: null });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="message-list-empty">
        <div className="empty-state">
          <Bot size={48} className="empty-icon" />
          <h3>Start a conversation</h3>
          <p>Ask me anything to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="message-list">
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className={`message ${message.senderType.toLowerCase()} ${message.isTemp ? 'temp' : ''}`}
          >
            <div className="message-avatar">
              {message.senderType === 'USER' ? (
                <User size={20} />
              ) : (
                <Bot size={20} />
              )}
            </div>
            
            <div className="message-content">
              {editingMessageId === message.id ? (
                <div className="edit-container">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="edit-textarea"
                    autoFocus
                    rows={Math.max(2, editText.split('\n').length)}
                  />
                  <div className="edit-actions">
                    <button 
                      onClick={handleEditSave}
                      className="edit-save"
                      disabled={!editText.trim()}
                    >
                      <Check size={16} />
                      Save & Submit
                    </button>
                    <button 
                      onClick={handleEditCancel}
                      className="edit-cancel"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="message-text">
                    {message.content}
                  </div>
                  
                  {!message.isTemp && (
                    <div className="message-actions">
                      <button 
                        onClick={() => handleCopy(message.content, message.id)}
                        className="action-button"
                        title="Copy message"
                      >
                        {copySuccess === message.id ? (
                          <Check size={16} className="success" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      
                      {message.senderType === 'USER' && (
                        <button 
                          onClick={() => handleEditStart(message)}
                          className="action-button"
                          title="Edit message"
                          disabled={isLoading}
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      
                      {message.senderType === 'ASSISTANT' && (
                        <button 
                          onClick={() => onRetry(message.id)}
                          className="action-button"
                          title="Retry response"
                          disabled={isLoading}
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteClick(message.id)}
                        className="action-button delete-action"
                        title="Delete message"
                        disabled={isLoading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="message-timestamp">
              {new Date(message.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Message</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this message?</p>
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
    </>
  );
};

export default MessageList;