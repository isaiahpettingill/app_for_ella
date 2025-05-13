import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { supabase } from '../../api/supabase';
import preactLogo from '../../assets/preact.svg';


const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;


const GOOGLE_REDIRECT_URL = (import.meta as any).env.VITE_GOOGLE_REDIRECT_URL;

export function Login() {
  const googleDivRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Google script if not already present
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = initializeGoogleButton;
      document.body.appendChild(script);
    } else {
      initializeGoogleButton();
    }
    // eslint-disable-next-line
  }, []);

  function initializeGoogleButton() {
    if (!window.google || !googleDivRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      ux_mode: 'popup',
      use_fedcm_for_prompt: true,
      login_uri: GOOGLE_REDIRECT_URL,
    });
    window.google.accounts.id.renderButton(googleDivRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      logo_alignment: 'left',
    });
  }

  async function handleGoogleResponse(response: any) {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });
      if (error) throw error;
      // Redirect to home or another page
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginTop: 48 }}>
      <h2>Sign in to continue</h2>
      <div ref={googleDivRef} style={{ marginBottom: 16 }}></div>
      {loading && <div>Signing in...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

declare global {
  interface Window {
    google?: any;
  }
}
