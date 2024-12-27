import { supabase } from '../supabase';
import { Message } from '../types';

export class MessageHandler {
  static async send(content: string, userId: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ content, user_id: userId, type: 'text' }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async retry(messageId: string, content: string, userId: string): Promise<Message> {
    return this.send(content, userId);
  }
}