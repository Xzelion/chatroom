"use client";

import { Wifi, WifiOff } from 'lucide-react';
import { useConnection } from '@/hooks/useConnection';

export default function ConnectionStatus() {
  const status = useConnection();

  if (status === 'connected') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>
        {status === 'connecting' 
          ? 'Reconnecting...' 
          : 'Connection lost. Check your internet.'}
      </span>
    </div>
  );
}