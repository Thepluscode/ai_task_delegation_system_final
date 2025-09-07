import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as AuthUser } from '../api/authService';

// Extend the User type with token for WebSocket purposes
// This is needed because the token is in LoginResponse not directly in User
interface ExtendedUser extends AuthUser {
  token?: string;
}

// WebSocket connection statuses
export type WebSocketStatus = 'Connecting' | 'Connected' | 'Disconnecting' | 'Disconnected';

// Security classification levels from backend
export enum SecurityClassification {
  PUBLIC = "public",
  INTERNAL = "internal",
  CONFIDENTIAL = "confidential",
  RESTRICTED = "restricted",
  TOP_SECRET = "top_secret"
}

// WebSocket connection options
export interface WebSocketOptions {
  reconnect: boolean;
  reconnectInterval?: number;
  securityLevel?: SecurityClassification;
  includeAuth?: boolean;
}

// Hook for managing secure WebSocket connections
export const useWebSocket = (url: string, options?: WebSocketOptions) => {
  const [lastMessage, setLastMessage] = useState<WebSocketEventMap['message'] | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>('Disconnected');
  const [securityClassification, setSecurityClassification] = useState<SecurityClassification>(
    options?.securityLevel || SecurityClassification.INTERNAL
  );
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<boolean>(options?.reconnect ?? true);
  const reconnectIntervalRef = useRef<number>(options?.reconnectInterval ?? 5000);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth() as { user: ExtendedUser | null };

  // Connect to WebSocket with security headers
  const connect = useCallback(() => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      setConnectionStatus('Connecting');
      
      // Add authentication token to URL if needed
      let secureUrl = url;
      if (options?.includeAuth && user?.token) {
        secureUrl = `${url}?token=${user.token}`;
      }
      
      webSocketRef.current = new WebSocket(secureUrl);
      
      // Security protocol extensions
      webSocketRef.current.onopen = () => {
        setConnectionStatus('Connected');
        
        // Send security classification if needed
        if (securityClassification) {
          sendMessage(JSON.stringify({
            type: 'security_classification',
            level: securityClassification,
          }));
        }
      };

      webSocketRef.current.onclose = (event) => {
        setConnectionStatus('Disconnected');
        console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
        
        if (reconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectIntervalRef.current);
        }
      };

      webSocketRef.current.onmessage = (event) => {
        setLastMessage(event);
        
        // Handle security classification updates from server
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'security_update') {
            setSecurityClassification(data.level);
          }
        } catch (e) {
          // Not JSON or not a security update
        }
      };

      webSocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('Disconnected');
      
      if (reconnectRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectIntervalRef.current);
      }
    }
  }, [url, user?.token, options?.includeAuth, securityClassification]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (webSocketRef.current) {
      setConnectionStatus('Disconnecting');
      webSocketRef.current.close();
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: string) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(message);
      return true;
    }
    return false;
  }, []);

  // Change security classification level
  const setSecurityLevel = useCallback((level: SecurityClassification) => {
    setSecurityClassification(level);
    
    // Inform the server of the new security level
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      sendMessage(JSON.stringify({
        type: 'security_classification',
        level: level,
      }));
    }
  }, [sendMessage]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    sendMessage,
    lastMessage,
    connectionStatus,
    readyState: webSocketRef.current?.readyState,
    securityClassification,
    setSecurityLevel
  };
};