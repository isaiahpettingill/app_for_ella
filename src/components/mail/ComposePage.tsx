// ../../components/mail/ComposePage.tsx
import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { XMarkIcon } from '@heroicons/react/24/solid';
import styles from '../../pages/Mail/Mail.module.css'; // Use existing or new styles

interface ComposePageProps {
  userEmail: string;
  onSend: (formData: { to_email: string; subject: string; body: string }) => Promise<boolean>;
  onClose: () => void;
  recentEmails: string[];
}

export function ComposePage({ userEmail, onSend, onClose, recentEmails }: ComposePageProps) {
  const [form, setForm] = useState({ to_email: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setForm({ ...form, [target.name]: target.value });
  };

  const handleSelectRecent = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setForm({ ...form, to_email: target.value });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!form.to_email || !form.subject || !form.body) {
        setError("Please fill in all fields.");
        return;
    }
    setSending(true);
    setError('');
    try {
      const success = await onSend({
        to_email: form.to_email,
        subject: form.subject,
        body: form.body,
      });
      if (success) {
        onClose(); // Close compose page on successful send
      } else {
        setError('Failed to send message. Please try again.'); // Error from useMail will be more specific
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setSending(false);
    }
  };

  // Autofocus on the 'to' field when the component mounts
  useEffect(() => {
    const toInput = document.getElementById('to_email_compose');
    if (toInput) {
      (toInput as HTMLInputElement).focus();
    }
  }, []);

  return (
    <div className={styles.composeFullScreen}>
      <div className={styles.composeHeader}>
        <h2>New Message</h2>
        <button
          className={styles.closeComposeFullScreenBtn}
          type="button"
          onClick={onClose}
          aria-label="Close compose window"
        >
          <XMarkIcon style={{ width: 24, height: 24 }} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className={styles.composeForm}>
        <div className={styles.formGroup}>
          <label htmlFor="to_email_compose">To</label>
          <input
            id="to_email_compose"
            name="to_email"
            type="email"
            value={form.to_email}
            onInput={handleChange}
            placeholder="Recipient's email"
            required
            list="recent-emails-datalist"
          />
          <datalist id="recent-emails-datalist">
            {recentEmails.map(email => (
              <option key={email} value={email} />
            ))}
          </datalist>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="subject_compose">Subject</label>
          <input
            id="subject_compose"
            name="subject"
            type="text"
            value={form.subject}
            onInput={handleChange}
            placeholder="Subject"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="body_compose">Message</label>
          <textarea
            id="body_compose"
            name="body"
            value={form.body}
            onInput={handleChange}
            placeholder="Write your message..."
            required
            rows={10}
          />
        </div>
        {error && (
          <div className={styles.composeError}>{error}</div>
        )}
        <button
          type="submit"
          disabled={sending}
          className={styles.sendButton}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}