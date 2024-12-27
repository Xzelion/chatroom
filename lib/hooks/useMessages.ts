"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { useMessageQueue } from './useMessageQueue';
import { useConnection } from './useConnection';

const RETRY_DELAYS = [1000, 2000, 5000];
const MAX_RETRIES = 3;

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { queue, addToQueue, removeFromQueue, updateRetries } = useMessageQueue();
  const connectionStatus = useConnection();

  const sendMessage = useCallback(async (content: string, userId: string) => {
    const tempId = crypto.randomUUID();
    const tempMessage = {
      id: tempId,
      content,
      user_id: userId,
      type: 'text',
      created_at: new Date().toISOString(),
      status: 'sending'
    } as Message;

    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ content, user_id: userId, type: 'text' }])
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? { ...data, status: 'sent' } : msg)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'error' }
            : msg
        )
      );

      addToQueue({ id: tempId, content });
      
      toast({
        title: "Failed to Send",
        description: "Message will be retried when connection is restored.",
        variant: "destructive",
      });
    }
  }, [toast, addToQueue]);

  // Retry failed messages when connection is restored
  useEffect(() => {
    if (connectionStatus === 'connected' && queue.length > 0) {
      queue.forEach(async (msg) => {
        if (msg.retries >= MAX_RETRIES) {
          removeFromQueue(msg.id);
          return;
        }

        try {
          await sendMessage(msg.content, msg.id);
          removeFromQueue(msg.id);
        } catch (error) {
          updateRetries(msg.id);
        }
      });
    }
  }, [connectionStatus, queue, sendMessage, removeFromQueue, updateRetries]);

  return { messages, isLoading, error, sendMessage };
}