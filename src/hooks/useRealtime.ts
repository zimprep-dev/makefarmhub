import { useState, useEffect, useCallback } from 'react';
import realtimeService from '../services/realtimeService';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Hook to subscribe to real-time channel messages
 */
export function useRealtimeChannel(channel: string) {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribe(channel, (data) => {
      setLastMessage(data);
      setMessages((prev) => [...prev, data]);
    });

    return unsubscribe;
  }, [channel]);

  const sendMessage = useCallback(
    (event: string, data: any) => {
      realtimeService.send(channel, event, data);
    },
    [channel]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  return { lastMessage, messages, sendMessage, clearMessages };
}

/**
 * Hook to track connection status
 */
export function useRealtimeStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    const unsubscribe = realtimeService.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const connect = useCallback((userId?: string) => {
    realtimeService.connect(userId);
  }, []);

  const disconnect = useCallback(() => {
    realtimeService.disconnect();
  }, []);

  return { status, connect, disconnect, isConnected: status === 'connected' };
}

/**
 * Hook for real-time chat in a specific conversation
 */
export function useRealtimeChat(conversationId: string) {
  const { lastMessage, messages, sendMessage, clearMessages } = useRealtimeChannel(
    `chat:${conversationId}`
  );

  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribe(
      `typing:${conversationId}`,
      (data) => {
        if (data.event === 'typing_start') {
          setTypingUsers((prev) =>
            prev.includes(data.data.userId) ? prev : [...prev, data.data.userId]
          );
        } else if (data.event === 'typing_stop') {
          setTypingUsers((prev) => prev.filter((id) => id !== data.data.userId));
        }
      }
    );

    return unsubscribe;
  }, [conversationId]);

  const sendChatMessage = useCallback(
    (text: string, senderId: string) => {
      sendMessage('new_message', {
        id: `msg_${Date.now()}`,
        text,
        senderId,
        conversationId,
        timestamp: Date.now(),
        status: 'sent',
      });
    },
    [sendMessage, conversationId]
  );

  const startTyping = useCallback(
    (userId: string) => {
      realtimeService.send(`typing:${conversationId}`, 'typing_start', { userId });
    },
    [conversationId]
  );

  const stopTyping = useCallback(
    (userId: string) => {
      realtimeService.send(`typing:${conversationId}`, 'typing_stop', { userId });
    },
    [conversationId]
  );

  return {
    chatMessages: messages,
    lastChatMessage: lastMessage,
    sendChatMessage,
    typingUsers,
    startTyping,
    stopTyping,
    clearMessages,
  };
}

/**
 * Hook for real-time notifications
 */
export function useRealtimeNotifications() {
  const { messages: notifications, lastMessage } = useRealtimeChannel('notifications');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (lastMessage) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [lastMessage]);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return { notifications, lastNotification: lastMessage, unreadCount, markAllRead };
}
