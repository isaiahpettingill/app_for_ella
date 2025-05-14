// ../../routes/mail/Mail.tsx
import { h, Fragment } from 'preact';
import { useEffect, useState, useCallback } from 'preact/hooks';
import { Login } from '../../components/auth/Login';
import { ArrowPathIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import styles from './Mail.module.css';
import Toast from '../../components/common/Toast';
import { useSupabaseAuth } from '../../api/hooks/useSubabaseAuth';
import { useMail, Message } from '../../api/hooks/useMail';
import { ComposePage } from '../../components/mail/ComposePage';

type MailView = 'inbox' | 'compose' | 'readMessage';

export function Mail() {
  const { user, loading: authLoading, auth } = useSupabaseAuth();
  const {
    inbox,
    // sent, // Not actively displayed in this UI version, but available from hook
    loading: mailLoading,
    error: mailError,
    fetchMessages,
    sendMessage,
    deleteInboxMessage,
    markMessageAsRead,
    recentToEmails,
  } = useMail(user);

  const [currentView, setCurrentView] = useState<MailView>('inbox');
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
  
  const [swipeStates, setSwipeStates] = useState<{ [key: string]: { startX: number; x: number; swiped: boolean } }>({});
  const MESSAGES_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(0);
  
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Request browser notification permission on mount
    if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // --- Touch Swipe Handlers ---
  const handleTouchStart = (id: string, e: TouchEvent) => {
    setSwipeStates(prev => ({ ...prev, [id]: { startX: e.touches[0].clientX, x: 0, swiped: false } }));
  };

  const handleTouchMove = (id: string, e: TouchEvent) => {
    if (!swipeStates[id] || swipeStates[id].swiped) return;
    const x = e.touches[0].clientX - swipeStates[id].startX;
    setSwipeStates(prev => ({ ...prev, [id]: { ...prev[id], x } }));
  };

  const handleTouchEnd = async (id: string) => {
    if (!swipeStates[id]) return;
    const SWIPE_THRESHOLD = -60; // Pixels to swipe for delete action
    if (swipeStates[id].x < SWIPE_THRESHOLD) {
      if (window.confirm('Are you sure you want to delete this email?')) {
        setSwipeStates(prev => ({ ...prev, [id]: { ...prev[id], swiped: true, x: -1000 } })); // Animate out
        await deleteInboxMessage(id);
        displayToast('Message deleted.');
        // Reset swipe state for this item after animation/removal
        setTimeout(() => {
            setSwipeStates(prev => {
                const newState = {...prev};
                delete newState[id];
                return newState;
            });
        }, 300);
      } else {
        // Reset swipe if cancelled
        setSwipeStates(prev => ({ ...prev, [id]: { ...prev[id], x: 0 } }));
      }
    } else {
      // Reset swipe if not past threshold
      setSwipeStates(prev => ({ ...prev, [id]: { ...prev[id], x: 0 } }));
    }
  };

  // --- Message Actions ---
  const handleOpenMessage = async (msg: Message) => {
    setViewingMessage(msg);
    setCurrentView('readMessage');
    if (!msg.read) {
      await markMessageAsRead(msg.id);
    }
  };

  const handleCloseMessageView = () => {
    setViewingMessage(null);
    setCurrentView('inbox');
  };
  
  const handleInitiateDeleteFromView = async () => {
    if (viewingMessage) {
      if (window.confirm('Are you sure you want to delete this email?')) {
        await deleteInboxMessage(viewingMessage.id);
        displayToast('Message deleted.');
        handleCloseMessageView();
      }
    }
  };

  const handleSendEmail = async (formData: { to_email: string; subject: string; body: string }) => {
    const success = await sendMessage(formData);
    if (success) {
      displayToast('Message sent! 💌');
      setCurrentView('inbox'); // Go back to inbox after sending
      return true;
    } else {
      // Error will be set in useMail hook, potentially display it in ComposePage or as a toast
      displayToast(mailError || 'Failed to send message.');
      return false;
    }
  };

  // --- Pagination ---
  const paginatedInbox = inbox.slice(currentPage * MESSAGES_PER_PAGE, (currentPage + 1) * MESSAGES_PER_PAGE);
  const totalPages = Math.ceil(inbox.length / MESSAGES_PER_PAGE);

  const handleNextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages - 1));
  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 0));

  useEffect(() => { setCurrentPage(0); }, [inbox.length]); // Reset page on inbox change

  // --- Render Logic ---
  if (authLoading) return <div className={styles.loadingScreen}>Loading authentication...</div>;
  if (!user) return <Login />;

  if (currentView === 'compose') {
    return (
      <ComposePage
        userEmail={user.email!}
        onSend={handleSendEmail}
        onClose={() => setCurrentView('inbox')}
        recentEmails={recentToEmails}
      />
    );
  }

  if (currentView === 'readMessage' && viewingMessage) {
    return (
      <div className={styles.mailApp}>
        <div className={styles.messageViewFullScreen}>
          <div className={styles.messageViewHeader}>
            <button className={styles.backButton} onClick={handleCloseMessageView}>&larr; Inbox</button>
            <button 
                onClick={handleInitiateDeleteFromView} 
                className={styles.deleteMessageButton}
                aria-label="Delete email"
            >
                <TrashIcon style={{width: 20, height: 20}}/>
            </button>
          </div>
          <div className={styles.messageViewContent}>
            <div className={styles.messageDetailItem}><span>From:</span> {viewingMessage.from_email}</div>
            <div className={styles.messageDetailItem}><span>To:</span> {viewingMessage.to_email}</div>
            <div className={styles.messageDetailItem}><span>Subject:</span> <strong>{viewingMessage.subject}</strong></div>
            <hr className={styles.messageDivider} />
            <div className={styles.messageBodyFull}>{viewingMessage.body}</div>
            <div className={styles.messageTimestampFull}>Received: {new Date(viewingMessage.created_at).toLocaleString()}</div>
          </div>
        </div>
        <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
      </div>
    );
  }

  // --- Inbox View (Default) ---
  return (
    <div className={styles.mailApp}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={fetchMessages}
            disabled={mailLoading}
            className={styles.refreshBtn}
            aria-label="Refresh emails"
          >
            <ArrowPathIcon style={{ width: 20, height: 20 }} className={mailLoading ? styles.loadingIcon : ''} />
          </button>
          <span className={styles.headerTitle}>📬 MyMail</span>
        </div>
        <button className={styles.composeBtnFixed} onClick={() => setCurrentView('compose')} aria-label="Compose new email">
            <PencilSquareIcon style={{width: 24, height: 24}}/>
        </button>
      </div>

      {mailLoading && inbox.length === 0 && <div className={styles.loadingScreen}>Loading messages...</div>}
      {mailError && <div className={styles.errorBanner}>Error: {mailError}</div>}
      
      <ul className={styles.inboxList}>
        {!mailLoading && paginatedInbox.length === 0 && (
          <li className={styles.emptyInbox}>Your inbox is empty.</li>
        )}
        {paginatedInbox.map(msg => (
          <li
            key={msg.id}
            className={`${styles.inboxItem} ${msg.read ? styles.read : styles.unread} ${swipeStates[msg.id]?.swiped ? styles.swipedOut : ''}`}
            style={{ transform: `translateX(${swipeStates[msg.id]?.x || 0}px)` }}
            onTouchStart={e => handleTouchStart(msg.id, e)}
            onTouchMove={e => handleTouchMove(msg.id, e)}
            onTouchEnd={() => handleTouchEnd(msg.id)}
            onClick={() => handleOpenMessage(msg)}
          >
            <div className={styles.messageContent}>
              {!msg.read && <span className={styles.unreadDot} aria-label="Unread message"></span>}
              <span className={styles.from}>{msg.from_email}</span>
              <span className={styles.subject}>{msg.subject}</span>
            </div>
            <span className={styles.time}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            { (swipeStates[msg.id]?.x || 0) < -10 && (swipeStates[msg.id]?.x || 0) > -150 && !swipeStates[msg.id]?.swiped && ( // Show delete hint during swipe
                 <span className={styles.swipeActionIndicator} style={{ opacity: Math.abs((swipeStates[msg.id]?.x || 0)) / 60 }}>
                    <TrashIcon style={{width: 18, height: 18}}/> Delete
                 </span>
            )}
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button onClick={handlePrevPage} disabled={currentPage === 0}>Prev</button>
          <span>{currentPage + 1} / {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>Next</button>
        </div>
      )}

      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}