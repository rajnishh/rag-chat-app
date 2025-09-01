import { useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url, onMessage, onError, onOpen) => {
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = (event) => {
        reconnectAttempts.current = 0;
        onOpen?.(event);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.current.onclose = (event) => {
        
        // Attempt reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      onError?.(error);
    }
  }, [url, onMessage, onError, onOpen]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      ws.current.send(messageString);
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage,
    disconnect,
    reconnect: connect,
    isConnected: () => ws.current?.readyState === WebSocket.OPEN,
    getReadyState: () => ws.current?.readyState
  };
};

export const WebSocketService = {
  createConnection: (url, handlers) => {
    const ws = new WebSocket(url);
    
    ws.onopen = handlers.onOpen;
    ws.onmessage = handlers.onMessage;
    ws.onerror = handlers.onError;
    ws.onclose = handlers.onClose;
    
    return {
      send: (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(typeof data === 'string' ? data : JSON.stringify(data));
        }
      },
      close: () => ws.close(),
      getReadyState: () => ws.readyState
    };
  }
};

export const WS_READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};