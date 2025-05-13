import { useState, useCallback } from 'preact/hooks';
import { supabase } from '../supabase';

export interface NoteIsaiahElla {
  readonly id: number;
  readonly created_at: Date;
  contents: string | null;
  notebook_id: number | null;
}

const TABLE_NAME = 'notes_isaiah_ella';

export function useNotes() {
  const [notes, setNotes] = useState<NoteIsaiahElla[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNotes = useCallback(async (notebookId?: number) => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });
    if (notebookId !== undefined) {
      query = query.eq('notebook_id', notebookId);
    }
    const { data, error } = await query;
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotes(data || []);
  }, []);

  const createNote = useCallback(async (note: Omit<NoteIsaiahElla, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...note }])
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      throw error;
    }
    setNotes(prev => [data, ...prev]);
    return data;
  }, []);

  const updateNote = useCallback(async (id: number, updates: Partial<Omit<NoteIsaiahElla, 'id' | 'created_at'>>) => {
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
    setNotes(prev => prev.map(n => n.id === id ? data : n));
    return data;
  }, []);

  const deleteNote = useCallback(async (id: number) => {
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
    setNotes(prev => prev.filter(n => n.id !== id));
    return true;
  }, []);

  return {
    notes,
    loading,
    error,
    getNotes,
    createNote,
    updateNote,
    deleteNote,
  };
} 