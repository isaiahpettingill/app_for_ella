import { supabase } from '../supabase';

interface Message {
  id: number;
  created_at: Date;
  subject: string;
  body: string;
  to_email: string;
  read: boolean;
  from_email: string;
  importance: number;
}

const TABLE_NAME = 'messages_isaiah_ella';

export async function createMessage(message: Omit<Message, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{ ...message }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMessageById(id: string) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getAllMessages() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateMessage(id: string, updates: Partial<Omit<Message, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMessage(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}
