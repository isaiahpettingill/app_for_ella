import { useEffect, useState } from 'preact/hooks';
import { supabase } from '../supabase';
import type { EllaAdjective } from '../entities/adjective';

export function useEllaAdjectives() {
  const [adjectives, setAdjectives] = useState<EllaAdjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    supabase
      .from('ella_adjectives')
      .select('adjective, adverb')
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setError(error.message);
          setAdjectives([]);
        } else {
          setAdjectives(data || []);
          setError(null);
        }
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { adjectives, loading, error };
} 