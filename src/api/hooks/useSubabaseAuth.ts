// ../../hooks/useSupabaseAuth.ts
import { useEffect, useState } from 'preact/hooks';
import { supabase } from '../supabaseClient';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'; // Explicit Supabase types

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (e: any) {
        console.error('Error getting session:', e);
        setError(e.message || 'Failed to retrieve session.');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false); // Important to set loading false after initial check and changes
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading, error, auth: supabase.auth };
}