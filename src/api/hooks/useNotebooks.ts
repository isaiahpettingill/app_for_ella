import { useState, useCallback } from 'preact/hooks';
import { supabase } from '../supabase';

export interface NotebookIsaiahElla {
  readonly id: number;
  readonly created_at: Date;
  name: string | null;
  description: string | null;
  color: string | null;
}

const TABLE_NAME = 'notebooks_isaiah_ella';

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState<NotebookIsaiahElla[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNotebooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotebooks(data || []);
  }, []);

  const createNotebook = useCallback(async (notebook: Omit<NotebookIsaiahElla, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...notebook }])
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      throw error;
    }
    setNotebooks(prev => [data, ...prev]);
    return data;
  }, []);

  const updateNotebook = useCallback(async (id: number, updates: Partial<Omit<NotebookIsaiahElla, 'id' | 'created_at'>>) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      throw error;
    }
    setNotebooks(prev => prev.map(nb => nb.id === id ? data : nb));
    return data;
  }, []);

  const deleteNotebook = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    setLoading(false);
    if (error) {
      setError(error.message);
      throw error;
    }
    setNotebooks(prev => prev.filter(nb => nb.id !== id));
    return true;
  }, []);

  return {
    notebooks,
    loading,
    error,
    getNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
  };
} 