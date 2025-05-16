// ../../hooks/useMail.ts
import { useState, useEffect, useCallback } from 'preact/hooks';
import { supabase } from '../supabaseClient'; // Ensure User is importable
import { createMessage, updateMessage as apiUpdateMessage, deleteMessage as apiDeleteMessage } from '../../api/entities/message';
import { User } from '@supabase/supabase-js';

export interface Message {
  id: string;
  created_at: string;
  to_email: string;
  from_email: string;
  subject: string;
  body: string;
  read: boolean;
  importance: number;
  // Add other fields if your message table has more
}

const RECENT_EMAILS_KEY = 'recentToEmails';
const MAX_RECENT_EMAILS = 10;

export function useMail(user: User | null) {
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentToEmails, setRecentToEmails] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedRecentEmails = localStorage.getItem(RECENT_EMAILS_KEY);
      if (storedRecentEmails) {
        setRecentToEmails(JSON.parse(storedRecentEmails));
      }
    } catch (e) {
      console.error("Failed to load recent emails from localStorage", e);
    }
  }, []);

  const addRecentEmail = (email: string) => {
    setRecentToEmails(prev => {
      const lowerEmail = email.toLowerCase();
      const updatedEmails = [lowerEmail, ...prev.filter(e => e !== lowerEmail)];
      const uniqueEmails = Array.from(new Set(updatedEmails)).slice(0, MAX_RECENT_EMAILS);
      try {
        localStorage.setItem(RECENT_EMAILS_KEY, JSON.stringify(uniqueEmails));
      } catch (e) {
        console.error("Failed to save recent emails to localStorage", e);
      }
      return uniqueEmails;
    });
  };

  const fetchMessages = useCallback(async (currentUser: User) => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const { data: inboxData, error: inboxErr } = await supabase
        .from('messages_isaiah_ella')
        .select('*')
        .eq('to_email', currentUser.email)
        .order('created_at', { ascending: false });
      if (inboxErr) throw inboxErr;
      setInbox(inboxData as Message[] || []);

      const { data: sentData, error: sentErr } = await supabase
        .from('messages_isaiah_ella')
        .select('*')
        .eq('from_email', currentUser.email)
        .order('created_at', { ascending: false });
      if (sentErr) throw sentErr;
      setSent(sentData as Message[] || []);
    } catch (e: any) {
      console.error('Failed to load messages:', e);
      setError(e.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages(user);
    } else {
      // Clear messages if user logs out
      setInbox([]);
      setSent([]);
    }
  }, [user, fetchMessages]);

  const sendMessage = async (formData: { to_email: string; subject: string; body: string }) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true); // Or a specific sending state
    setError(null);
    try {
      await createMessage({
        ...formData,
        from_email: user.email!,
        importance: 1, // Default importance
        read: false,     // For the recipient
      });
      await fetchMessages(user); // Refresh all messages, or just sent
      addRecentEmail(formData.to_email);
      return true; // Indicate success
    } catch (e: any) {
      console.error('Failed to send message:', e);
      setError(e.message || 'Failed to send message');
      return false; // Indicate failure
    } finally {
      setLoading(false); // Or a specific sending state
    }
  };

  const deleteInboxMessage = async (messageId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteMessage(messageId);
      setInbox(prev => prev.filter(msg => msg.id !== messageId));
      // Note: If this message was also in 'sent' (e.g., self-sent), you might want to update 'sent' too.
      // For now, assuming delete primarily impacts inbox.
    } catch (e: any) {
      console.error('Failed to delete message:', e);
      setError(e.message || 'Failed to delete message');
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    // No separate loading state for this minor update, relies on main loading if full refresh happens
    setError(null);
    try {
      await apiUpdateMessage(messageId, { read: true });
      setInbox(prev =>
        prev.map(msg => (msg.id === messageId ? { ...msg, read: true } : msg))
      );
    } catch (e: any) {
      console.error('Failed to mark message as read:', e);
      setError(e.message || 'Failed to mark message as read');
      // Potentially show a toast for this specific error
    }
  };

  const refreshMessages = useCallback(() => {
    if (user) {
        fetchMessages(user);
    }
  }, [user, fetchMessages]);


  return {
    inbox,
    sent,
    loading,
    error,
    fetchMessages: refreshMessages, // Expose a refresh function
    sendMessage,
    deleteInboxMessage,
    markMessageAsRead,
    recentToEmails,
  };
}