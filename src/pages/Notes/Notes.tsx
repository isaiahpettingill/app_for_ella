import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { supabase } from '../../api/supabaseClient';
import { Login } from '../../components/auth/Login';
import { useNotebooks } from '../../api/hooks/useNotebooks';
import { useNotes } from '../../api/hooks/useNotes';
import styles from './Notes.module.css';

const TABS = [
  { key: 'notebooks', label: 'Notebooks' },
  { key: 'notes', label: 'Notes' },
];

export function Notes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notebooks');
  const [selectedNotebook, setSelectedNotebook] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const {
    notebooks,
    loading: notebooksLoading,
    error: notebooksError,
    getNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
  } = useNotebooks();

  const {
    notes,
    loading: notesLoading,
    error: notesError,
    getNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();

  // Auth
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
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

  // Load notebooks and notes on login
  useEffect(() => {
    if (user) {
      getNotebooks();
    }
  }, [user, getNotebooks]);

  useEffect(() => {
    if (selectedNotebook != null) {
      getNotes(selectedNotebook);
    }
  }, [selectedNotebook, getNotes]);

  // When selectedNote changes, update editingContent
  useEffect(() => {
    const note = notes.find(n => n.id === selectedNote);
    setEditingContent(note ? note.contents || '' : '');
  }, [selectedNote, notes]);

  // When notebooks load, select the first by default
  useEffect(() => {
    if (notebooks.length > 0 && selectedNotebook == null) {
      setSelectedNotebook(notebooks[0].id);
    }
  }, [notebooks, selectedNotebook]);

  if (loading || notebooksLoading) return <div>Loading...</div>;
  if (!user) return <Login />;

  // Helper: get note title (first line of contents)
  const getNoteTitle = (note) => {
    if (!note.contents) return '(Untitled)';
    return note.contents.split('\n')[0] || '(Untitled)';
  };

  // Handlers
  const handleAddNotebook = async () => {
    if (!newNotebookName.trim()) return;
    await createNotebook({ name: newNotebookName, description: null, color: null });
    setNewNotebookName('');
  };

  const handleDeleteNotebook = async (id: number) => {
    if (confirm('Delete this notebook and all its notes?')) {
      await deleteNotebook(id);
      if (selectedNotebook === id) setSelectedNotebook(null);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || selectedNotebook == null) return;
    await createNote({ contents: newNoteContent, notebook_id: selectedNotebook });
    setNewNoteContent('');
  };

  const handleDeleteNote = async (id: number) => {
    if (confirm('Delete this note?')) {
      await deleteNote(id);
      if (selectedNote === id) setSelectedNote(null);
    }
  };

  const handleSaveNote = async () => {
    if (selectedNote == null) return;
    await updateNote(selectedNote, { contents: editingContent });
  };

  return (
    <div className={styles.notesApp}>
      <div className={styles.header}>
        <div className={styles.title}>Ducky Notes (beta)</div>
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                activeTab === tab.key
                  ? `${styles.tabButton} ${styles.tabButtonActive}`
                  : styles.tabButton
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {activeTab === 'notebooks' && (
        <div>
          <h3>Notebooks</h3>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={newNotebookName}
              onInput={e => setNewNotebookName(e.currentTarget.value)}
              placeholder="New notebook name"
              className={styles.input}
            />
            <button onClick={handleAddNotebook} className={styles.addButton}>Add</button>
          </div>
          <ul className={styles.notebookList}>
            {notebooks.map(nb => (
              <li key={nb.id} className={styles.notebookItem}>
                <button
                  onClick={() => {
                    setSelectedNotebook(nb.id);
                    setActiveTab('notes');
                  }}
                  className={
                    nb.id === selectedNotebook
                      ? `${styles.notebookButton} ${styles.notebookButtonActive}`
                      : styles.notebookButton
                  }
                >
                  {nb.name || '(Untitled)'}
                </button>
                <button
                  onClick={() => handleDeleteNotebook(nb.id)}
                  className={styles.deleteButton}
                  title="Delete notebook"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          {notebooksError && <div className={styles.error}>{notebooksError}</div>}
        </div>
      )}
      {activeTab === 'notes' && selectedNotebook != null && (
        <div>
          <h3>Notes</h3>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={newNoteContent}
              onInput={e => setNewNoteContent(e.currentTarget.value)}
              placeholder="New note (first line = title)"
              className={styles.input}
            />
            <button onClick={handleAddNote} className={styles.addButton}>Add</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ul className={styles.noteList} style={{ flex: 1, maxHeight: 200, overflowY: 'auto' }}>
              {notes.filter(n => n.notebook_id === selectedNotebook).map(note => (
                <li key={note.id} className={styles.noteItem}>
                  <button
                    onClick={() => setSelectedNote(note.id)}
                    className={
                      note.id === selectedNote
                        ? `${styles.noteButton} ${styles.noteButtonActive}`
                        : styles.noteButton
                    }
                  >
                    {getNoteTitle(note)}
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className={styles.deleteButton}
                    title="Delete note"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.noteEditContainer}>
              {notes.find(n => n.id === selectedNote) ? (
                <div>
                  <textarea
                    value={editingContent}
                    onInput={e => setEditingContent(e.currentTarget.value)}
                    className={styles.textarea}
                  />
                  <button onClick={handleSaveNote} className={styles.saveButton}>Save</button>
                </div>
              ) : (
                <div className={styles.selectNoteText}>Select a note to edit</div>
              )}
            </div>
          </div>
          {notesError && <div className={styles.error}>{notesError}</div>}
        </div>
      )}
    </div>
  );
}

export default Notes;
