"use client";

import { createContext, useContext, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { useAuth } from '@/hooks/useAuth';
import { useConnection } from '@/hooks/useConnection';
import { useToast } from '@/components/ui/use-toast';

const ChatContext = createContext<ReturnType<typeof useChatState> | undefined>(undefined);

function useChatState() {
  const { user, loading: authLoading } = useAuth();
  const { messages, isLoading: messagesLoading, error, sendMessage } = useMessages();
  const onlineUsers = usePresence(user?.id);
  const connectionStatus = useConnection();
  const { toast } = useToast();

  // Handle connection status changes
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      toast({
        title: "Connection Lost",
        description: "Attempting to reconnect...",
        variant: "destructive",
      });
    } else if (connectionStatus === 'connected') {
      toast({
        title: "Connected",
        description: "You're back online!",
      });
    }
  }, [connectionStatus, toast]);

  return {
    user,
    messages,
    onlineUsers,
    loading: authLoading || messagesLoading,
    error,
    connectionStatus,
    sendMessage: async (content: string) => {
      if (!user) throw new Error('No user found');
      if (!content.trim()) throw new Error('Message cannot be empty');
      await sendMessage(content, user.id);
    },
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const state = useChatState();

  return (
    <ChatContext.Provider value={state}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}