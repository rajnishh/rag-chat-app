import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored credentials on mount
    const storedUserId = localStorage.getItem('chatUserId');
    const storedApiKey = localStorage.getItem('chatApiKey');
    
    if (storedUserId && storedApiKey) {
      setUser(storedUserId);
      setApiKey(storedApiKey);
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = (userId, apiKey) => {
    if (!userId || !apiKey) {
      throw new Error('User ID and API key are required');
    }

    localStorage.setItem('chatUserId', userId);
    localStorage.setItem('chatApiKey', apiKey);
    
    setUser(userId);
    setApiKey(apiKey);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('chatUserId');
    localStorage.removeItem('chatApiKey');
    
    setUser(null);
    setApiKey('');
    setIsAuthenticated(false);
  };

  const updateApiKey = (newApiKey) => {
    if (!newApiKey) {
      throw new Error('API key is required');
    }

    localStorage.setItem('chatApiKey', newApiKey);
    setApiKey(newApiKey);
  };

  const value = {
    user,
    apiKey,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateApiKey
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher Order Component for protecting routes
export const withAuth = (Component) => {
  return function ProtectedRoute(props) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      // You can redirect to login or show unauthorized message
      return <div>Please log in to access this page</div>;
    }
    
    return <Component {...props} />;
  };
};