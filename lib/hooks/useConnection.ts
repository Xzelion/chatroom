import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase.channel('system')
      .on('system', { event: 'reconnect' }, () => {
        setStatus('connecting');
      })
      .subscribe((status) => {
        setStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    const handleOnline = () => {
      setStatus('connecting');
      toast({
        title: "Reconnecting",
        description: "Attempting to restore connection..."
      });
    };

    const handleOffline = () => {
      setStatus('disconnected');
      toast({
        title: "Disconnected",
        description: "Check your internet connection",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      channel.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return status;
}