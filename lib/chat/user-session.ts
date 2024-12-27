import { supabase } from '../supabase';
import { ChatUser } from '../types';

const USER_STORAGE_KEY = 'chatUser';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export class UserSession {
  static async validate(userId: string): Promise<ChatUser | null> {
    const { data, error } = await supabase
      .from('chat_users')
      .select()
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data;
  }

  static isSessionValid(timestamp: string): boolean {
    return Date.now() - new Date(timestamp).getTime() < SESSION_TIMEOUT;
  }

  static store(user: ChatUser): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  static clear(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  static get(): ChatUser | null {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
}