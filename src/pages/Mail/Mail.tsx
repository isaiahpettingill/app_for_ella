import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { supabase } from '../../api/supabase';
import { Login } from '../../components/auth/Login';
import { createMessage, updateMessage, deleteMessage } from '../../api/entities/message';
import styles from './Mail.module.css';

export function Mail() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [form, setForm] = useState({ to_email: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const notificationTimeout = useRef(null);
  const [viewing, setViewing] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [swipeStates, setSwipeStates] = useState({});
  const MESSAGES_PER_PAGE = 8;
  const [page, setPage] = useState(0);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchMessages = async () => {
      setError('');
      try {
        // Inbox: messages sent to this user
        const { data: inboxData, error: inboxErr } = await supabase
          .from('messages_isaiah_ella')
          .select('*')
          .eq('to_email', user.email)
          .order('created_at', { ascending: false });
        if (inboxErr) throw inboxErr;
        setInbox(inboxData || []);
        // Sent: messages sent by this user
        const { data: sentData, error: sentErr } = await supabase
          .from('messages_isaiah_ella')
          .select('*')
          .eq('from_email', user.email)
          .order('created_at', { ascending: false });
        if (sentErr) throw sentErr;
        setSent(sentData || []);
      } catch (e) {
        setError(e.message || 'Failed to load messages');
      }
    };
    fetchMessages();
  }, [user]);

  useEffect(() => {
    // Request browser notification permission on mount
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    // Real-time subscription for new inbox messages
    const channel = supabase.channel('inbox-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_isaiah_ella',
          filter: `to_email=eq.${user.email}`,
        },
        (payload) => {
          // Try native browser notification
          if (window.Notification && Notification.permission === 'granted') {
            new Notification('New message from ' + payload.new.from_email, {
              body: payload.new.subject || 'No subject',
            });
          } else {
            setNotification('New message received!');
            // Auto-hide notification after 3 seconds
            if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
            notificationTimeout.current = setTimeout(() => setNotification(''), 3000);
          }
          setInbox((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    };
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = async e => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await createMessage({
        to_email: form.to_email,
        from_email: user.email,
        subject: form.subject,
        body: form.body,
        importance: 1,
        read: false,
      });
    setForm({ to_email: '', subject: '', body: '' });
      // Refresh messages
      const { data: sentData } = await supabase
        .from('messages_isaiah_ella')
        .select('*')
        .eq('from_email', user.email)
        .order('created_at', { ascending: false });
      setSent(sentData || []);
    } catch (e) {
      setError(e.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const openCompose = () => setComposeOpen(true);
  const closeCompose = () => setComposeOpen(false);

  const handleTouchStart = (id, e) => {
    setSwipeStates((prev) => ({ ...prev, [id]: { startX: e.touches[0].clientX, x: 0, swiped: false } }));
  };

  const handleTouchMove = (id, e) => {
    if (!swipeStates[id]) return;
    const x = e.touches[0].clientX - swipeStates[id].startX;
    setSwipeStates((prev) => ({ ...prev, [id]: { ...prev[id], x, swiped: prev[id].swiped } }));
  };

  const handleTouchEnd = async (id) => {
    if (!swipeStates[id]) return;
    if (swipeStates[id].x < -60) {
      // Swiped left enough, delete
      setSwipeStates((prev) => ({ ...prev, [id]: { ...prev[id], swiped: true } }));
      await deleteMessage(id);
      setInbox((prev) => prev.filter((msg) => msg.id !== id));
    } else {
      setSwipeStates((prev) => ({ ...prev, [id]: { ...prev[id], x: 0 } }));
    }
  };

  const handleOpenMessage = async (msg) => {
    setViewing(msg);
    if (!msg.read) {
      await updateMessage(msg.id, { read: true });
      setInbox((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const paginatedInbox = inbox.slice(page * MESSAGES_PER_PAGE, (page + 1) * MESSAGES_PER_PAGE);
  const totalPages = Math.ceil(inbox.length / MESSAGES_PER_PAGE);

  const handleNextPage = () => setPage((p) => Math.min(p + 1, totalPages - 1));
  const handlePrevPage = () => setPage((p) => Math.max(p - 1, 0));

  // Reset page to 0 when inbox changes
  useEffect(() => { setPage(0); }, [inbox.length]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className={styles.mailApp}>
      <div className={styles.header}>
        <span>📬 cutemail.com</span>
        <button className={styles.composeBtn} onClick={openCompose}>+</button>
      </div>
      {notification && <div style={{ background: '#4e7', color: '#fff', padding: 10, borderRadius: 6, margin: 12, textAlign: 'center' }}>{notification}</div>}
      <ul className={styles.inboxList}>
        {paginatedInbox.length === 0 && <li style={{ color: '#bbb', padding: 24, textAlign: 'center' }}>No messages</li>}
        {paginatedInbox.map(msg => (
          <li
            key={msg.id}
            className={styles.inboxItem + ' ' + (msg.read ? styles.read : styles.unread)}
            style={{ transform: `translateX(${swipeStates[msg.id]?.x || 0}px)` }}
            onTouchStart={e => handleTouchStart(msg.id, e)}
            onTouchMove={e => handleTouchMove(msg.id, e)}
            onTouchEnd={() => handleTouchEnd(msg.id)}
            onClick={() => handleOpenMessage(msg)}
          >
            <span className={styles.from}>{msg.from_email}</span>
            <span className={styles.subject}>{msg.subject}</span>
            <span className={styles.time}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {swipeStates[msg.id]?.x < -40 && (
              <span className={styles.swipeDelete}>Delete</span>
            )}
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '12px 0' }}>
          <button onClick={handlePrevPage} disabled={page === 0} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #eee', background: '#fff', color: '#333' }}>Prev</button>
          <span style={{ alignSelf: 'center', color: '#888' }}>{page + 1} / {totalPages}</span>
          <button onClick={handleNextPage} disabled={page === totalPages - 1} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #eee', background: '#fff', color: '#333' }}>Next</button>
        </div>
      )}
      {viewing && (
        <div className={styles.messageView}>
          <button className={styles.closeBtn} onClick={() => setViewing(null)}>&times;</button>
          <div style={{ marginBottom: 8, color: '#888' }}>From: {viewing.from_email}</div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>{viewing.subject}</div>
          <div style={{ marginBottom: 16, color: '#555' }}>{viewing.body}</div>
          <div style={{ color: '#bbb', fontSize: 12 }}>Received: {new Date(viewing.created_at).toLocaleString()}</div>
        </div>
      )}
      {composeOpen && (
        <div className={styles.composeModal} onClick={closeCompose}>
          <div className={styles.composeContent} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSend}>
              <input
                name="to_email"
                value={form.to_email}
                onInput={handleChange}
                placeholder="To (email)"
                required
                autoFocus
              />
              <input
                name="subject"
                value={form.subject}
                onInput={handleChange}
                placeholder="Subject"
                required
              />
              <textarea
                name="body"
                value={form.body}
                onInput={handleChange}
                placeholder="Message body"
                required
                rows={5}
              />
              <button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
