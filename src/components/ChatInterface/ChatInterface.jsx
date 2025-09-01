import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Menu, Plus, Trash2, Star, Loader } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import SessionSidebar from '../SessionSidebar/SessionSidebar';
import MessageList from '../MessageList/MessageList';
import InputArea from '../InputArea/InputArea';
import './ChatInterface.css';

const ChatInterface = ({ userId }) => {
  const {
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
    clearMessages, // This function now exists in the updated hook
    generateTitleFromMessage
  } = useChat(userId);

  // Local state to force message list to show empty state
  const [isNewChatMode, setIsNewChatMode] = useState(false);

  // Persistent input state - key is the session ID or 'new' for new chat
  const [inputValues, setInputValues] = useState({});
  const [currentInputKey, setCurrentInputKey] = useState('new');
  const messagesEndRef = useRef(null);
  // Add this new state for sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Initially open only on desktop
    return window.innerWidth > 768;
  });

  // Get current input value based on session
  const getCurrentInputValue = () => {
    const key = currentSession ? currentSession.id : 'new';
    return inputValues[key] || '';
  };

  // Update input value for current session
  const setCurrentInputValue = (value) => {
    const key = currentSession ? currentSession.id : 'new';
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear input for specific session
  const clearInputForSession = (sessionKey) => {
    setInputValues(prev => {
      const newInputValues = { ...prev };
      delete newInputValues[sessionKey];
      return newInputValues;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      // Update sidebar state based on screen width
      setIsSidebarOpen(window.innerWidth > 768);
    };

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Update input key when session changes
  useEffect(() => {
    const newKey = currentSession ? currentSession.id : 'new';
    setCurrentInputKey(newKey);
    
    // Update new chat mode based on session state
    setIsNewChatMode(!currentSession);
  }, [currentSession]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add toggle function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = async () => {
    const inputValue = getCurrentInputValue();
    if (!inputValue.trim() || isLoading) return;
    
    const messageToSend = inputValue.trim();
    const sessionToUse = currentSession; // Store reference before operations
    const currentKey = sessionToUse ? sessionToUse.id : 'new';
    
    // Clear input immediately for this session
    clearInputForSession(currentKey);
    
    if (!sessionToUse) {
      await startNewChat(messageToSend);
    } else {
      await sendMessage(messageToSend);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fixed handleNewChat function
  const handleNewChat = () => {
    console.log('handleNewChat called');
    
    // Clear current session first
    setCurrentSession(null);
    
    // Set new chat mode
    setIsNewChatMode(true);
    
    // Clear messages - try multiple approaches to ensure it works
    if (clearMessages) {
      clearMessages();
      console.log('clearMessages called');
    }
    
    // Clear any editing state
    setEditingMessageId(null);
    
    // Clear any errors
    setError(null);
    
    // Clear input for new chat
    clearInputForSession('new');
    
    // Update current input key
    setCurrentInputKey('new');
    
    console.log('New chat started - all state cleared');
  };

  const handleSelectSession = async (sessionId) => {
    console.log('Selecting session:', sessionId);
    
    // Clear new chat mode
    setIsNewChatMode(false);
    
    // Clear any editing state when switching sessions
    setEditingMessageId(null);
    
    // Switch to selected session and load its messages
    await fetchMessages(sessionId, false); // Don't preserve currentSession when manually selecting
  };

  const handleDeleteSession = async (sessionId) => {
    // Clear input for deleted session
    clearInputForSession(sessionId);
    
    // Delete the session
    await deleteSession(sessionId);
  };

  // Add chat history handler for collapsed sidebar
  const handleOpenChatHistory = () => {
    // This function should open a chat history page/modal
    // For now, let's just expand the sidebar and clear search
    setIsSidebarOpen(true);
    console.log('Opening chat history page...');
    // You can implement a modal or separate page here
  };

  const handleRetry = async (messageId) => {
    await retryMessage(messageId);
  };

  const handleEdit = async (messageId, newContent) => {
    await editMessage(messageId, newContent);
  };

  const handleCopy = async (content) => {
    return await copyMessage(content);
  };

  const handleMessageDelete = async (messageId) => {
    await deleteMessage(messageId);
  };

  const getPlaceholder = () => {
    if (currentSession) {
      return "Type your message...";
    } else {
      return "Start a new conversation...";
    }
  };

  const getHeaderTitle = () => {
    if (currentSession) {
      return currentSession.sessionName || 'Chat Session';
    } else {
      return 'New Chat';
    }
  };

  return (
    <div className="chat-interface">
      <SessionSidebar
        userId={userId}
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        onOpenChatHistory={handleOpenChatHistory}
        isLoading={isLoading}
        isOpen={isSidebarOpen}
      />
      
      <div className="chat-main">
        {/* Chat Header - Uncommented for better UX */}
        <div className="chat-header">
          <div className="chat-title">
            {/* <button 
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <Menu size={20} />
            </button> */}
            <h2>{getHeaderTitle()}</h2>
            {currentSession && (
              <div className="chat-info">
                <span>{messages.length} messages</span>
              </div>
            )}
          </div>
          
          {!currentSession && (
            <div className="new-chat-indicator">
              <Plus size={16} />
              <span>Ready to start a new conversation</span>
            </div>
          )}
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        <MessageList 
          messages={isNewChatMode ? [] : messages} 
          isLoading={isLoading}
          onRetry={handleRetry}
          onEdit={handleEdit}
          onCopy={handleCopy}
          onDelete={handleMessageDelete}
          editingMessageId={editingMessageId}
          setEditingMessageId={setEditingMessageId}
        />
        
        {isLoading && (
          <div className="typing-indicator">
            <Loader className="loader" size={16} />
            <span>AI is thinking...</span>
          </div>
        )}
        
        <InputArea
          value={getCurrentInputValue()}
          onChange={setCurrentInputValue}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={isLoading || editingMessageId !== null}
          placeholder={getPlaceholder()}
        />
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatInterface;