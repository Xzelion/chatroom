import { useState, useCallback } from 'react';
import { PendingMessage } from '../types';

const MAX_RETRIES = 3;

export function useMessageQueue() {
  const [queue, setQueue] = useState<PendingMessage[]>([]);

  const addToQueue = useCallback((message: Omit<PendingMessage, 'retries'>) => {
    setQueue(prev => [...prev, { ...message, retries: 0 }]);
  }, []);

  const removeFromQueue = useCallback((messageId: string) => {
    setQueue(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const updateRetries = useCallback((messageId: string) => {
    setQueue(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, retries: msg.retries + 1 }
        : msg
    ));
  }, []);

  const canRetry = useCallback((messageId: string) => {
    const message = queue.find(msg => msg.id === messageId);
    return message && message.retries < MAX_RETRIES;
  }, [queue]);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    updateRetries,
    canRetry
  };
}