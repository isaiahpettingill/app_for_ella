import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { supabase } from '../../api/supabase';
import { Login } from '../../components/auth/Login';

export function Mail() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };
    getSession();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;

  // Placeholder for the mail app
  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ marginBottom: 16 }}>📬 Ella's Mail</h2>
      <div style={{ color: '#888', fontStyle: 'italic' }}>
        (Tiny mail app coming soon!)
      </div>
      <ul style={{ marginTop: 24, color: '#bbb' }}>
        <li>Inbox (empty)</li>
        <li>Sent (empty)</li>
        <li>Drafts (empty)</li>
      </ul>
    </div>
  );
}
