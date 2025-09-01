import React, { useState, useEffect } from 'react';
import { Key, User, LogOut } from 'lucide-react';
import ChatInterface from './components/ChatInterface/ChatInterface';
import './App.css';

function App() {
  const [userId, setUserId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const savedUserId = localStorage.getItem('chatUserId');
    const savedApiKey = localStorage.getItem('chatApiKey');
    
    if (savedUserId && savedApiKey) {
      setUserId(savedUserId);
      setApiKey(savedApiKey);
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      alert('Please enter a User ID');
      return;
    }
    
    if (!apiKey.trim()) {
      alert('Please enter an API Key');
      return;
    }

    // Save to localStorage
    localStorage.setItem('chatUserId', userId.trim());
    localStorage.setItem('chatApiKey', apiKey.trim());
    
    // Set authentication state
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear all authentication data
    setIsAuthenticated(false);
    const currentUserId = userId; // Store current userId before clearing it
    setUserId('');
    setApiKey('');
    
    // Clear authentication localStorage
    localStorage.removeItem('chatUserId');
    localStorage.removeItem('chatApiKey');
    
    // Clear session persistence data for current user
    if (currentUserId) {
      localStorage.removeItem(`chatApp_currentSession_${currentUserId}`);
      
      // Also clear any input persistence data if you add that later
      // You can add more cleanup here if needed
      
      console.log(`Cleared session data for user: ${currentUserId}`);
    }
    
    // Clear any other chat-related data that might exist
    // This is a more thorough cleanup approach
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chatApp_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="setup-container">
        <div className="setup-card">
          <h1>Welcome to RAG Chat</h1>
          <p>Please login to get started</p>
          
          <form onSubmit={handleLogin} className="setup-form">
            <div className="input-group">
              <User size={20} />
              <input
                type="text"
                placeholder="User ID (e.g., your email)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            
            <div className="input-group">
              <Key size={20} />
              <input
                type="password"
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          
          <div className="setup-info">
            <h3>Authentication Required</h3>
            <ul>
              <li><strong>User ID:</strong> Your unique identifier (email recommended)</li>
              <li><strong>API Key:</strong> Enter your API key (not from environment)</li>
            </ul>
            <p className="security-note">
              Your credentials will be stored locally in your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show main application if authenticated
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>RAG Chat</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <User size={18} />
            <span>{userId}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <ChatInterface userId={userId} apiKey={apiKey} />
      </main>
    </div>
  );
}

export default App;