import { supabase } from '../supabase';
import { ChatUser } from '../types';

const PRESENCE_TIMEOUT = 30; // seconds

export class PresenceManager {
  static async updatePresence(userId: string): Promise<void> {
    const { error } = await supabase
      .from('presence')
      .upsert({ 
        user_id: userId, 
        last_ping: new Date().toISOString() 
      });

    if (error) throw error;
  }

  static async getOnlineUsers(): Promise<ChatUser[]> {
    const { data, error } = await supabase
      .from('chat_users')
      .select('*, presence!inner(*)')
      .gte(
        'presence.last_ping',
        new Date(Date.now() - PRESENCE_TIMEOUT * 1000).toISOString()
      );

    if (error) throw error;
    return data;
  }
}