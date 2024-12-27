import { supabase } from '../supabase';
import type { ConnectionStatus } from '../types';

export class ConnectionManager {
  private static channel = supabase.channel('system');
  private static listeners: ((status: ConnectionStatus) => void)[] = [];

  static subscribe(callback: (status: ConnectionStatus) => void) {
    this.listeners.push(callback);
    
    if (this.listeners.length === 1) {
      this.initializeChannel();
    }

    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      if (this.listeners.length === 0) {
        this.channel.unsubscribe();
      }
    };
  }

  private static initializeChannel() {
    this.channel
      .on('system', { event: '*' }, () => {
        this.notifyListeners('connecting');
      })
      .subscribe((status) => {
        this.notifyListeners(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });
  }

  private static notifyListeners(status: ConnectionStatus) {
    this.listeners.forEach(callback => callback(status));
  }
}