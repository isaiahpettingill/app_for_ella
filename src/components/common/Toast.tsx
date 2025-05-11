import { h, FunctionalComponent } from 'preact';
import { useEffect } from 'preact/hooks';

interface ToastProps {
  message: string;
  show: boolean;
  duration?: number;
  onClose: () => void;
}

const Toast: FunctionalComponent<ToastProps> = ({ message, show, duration = 3000, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        background: 'rgba(40, 40, 40, 0.9)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        zIndex: 2000,
        fontSize: '1rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: show ? 1 : 0,
        transform: show ? 'translate(-50%, 0)' : 'translate(-50%, 20px)',
        textAlign: 'center',
      }}
    >
      {message}
    </div>
  );
};

export default Toast; 