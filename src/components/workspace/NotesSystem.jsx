import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { NoteEditor } from './NoteEditor';
import { T } from '../../theme/tokens';
import { Plus, Pin, Trash2, Edit3, FileText, LayoutGrid } from 'lucide-react';

export function NotesSystem({ searchQuery }) {
  const { workspaceNotes, addWorkspaceNote, deleteWorkspaceNote, togglePinWorkspaceNote } = useFinanceStore();
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const filteredNotes = workspaceNotes.filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const regularNotes = filteredNotes.filter(n => !n.isPinned);

  const handleCreateNew = () => {
    const newNote = { title: 'Untitled Note', content: '', type: 'General', isPinned: false };
    const tempId = `temp-${Date.now()}`; // Just for UI until saved
    setActiveNoteId('new');
  };

  if (activeNoteId) {
    return <NoteEditor noteId={activeNoteId} onBack={() => setActiveNoteId(null)} />;
  }

  const renderNoteCard = (note) => (
    <motion.div 
      key={note.id}
      whileHover={{ y: -4, boxShadow: 'var(--sh-lg)' }}
      style={{ 
        background: 'var(--bg-card)', 
        borderRadius: 20, 
        padding: 24, 
        border: '1px solid var(--border)',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: viewMode === 'grid' ? 220 : 'auto'
      }}
      onClick={() => setActiveNoteId(note.id)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', paddingRight: 30 }}>{note.title}</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); togglePinWorkspaceNote(note.id); }}
          style={{ background: 'none', border: 'none', color: note.isPinned ? T.gold : 'var(--text-faint)', cursor: 'pointer', position: 'absolute', right: 20, top: 24 }}
        >
          <Pin size={18} fill={note.isPinned ? T.gold : 'none'} />
        </button>
      </div>
      
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, display: '-webkit-box', WebkitLineClamp: viewMode === 'grid' ? 4 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
        {note.content || 'Empty note...'}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', background: note.type === 'Decision Log' ? 'var(--rose-lt)' : 'var(--sky-lt)', color: note.type === 'Decision Log' ? 'var(--rose)' : T.sky, borderRadius: 6 }}>
          {note.type}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={(e) => { e.stopPropagation(); deleteWorkspaceNote(note.id); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button 
          onClick={handleCreateNew}
          style={{ 
            background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 12, 
            padding: '12px 20px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <Plus size={18} /> New Note
        </button>
        
        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-card)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: 8, borderRadius: 8, background: viewMode === 'grid' ? 'var(--bg-warm)' : 'transparent', border: 'none', color: viewMode === 'grid' ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer' }}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} style={{ padding: 8, borderRadius: 8, background: viewMode === 'list' ? 'var(--bg-warm)' : 'transparent', border: 'none', color: viewMode === 'list' ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer' }}>
            <FileText size={16} />
          </button>
        </div>
      </div>

      {pinnedNotes.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pin size={16} color={T.gold} /> Pinned
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 20 }}>
            {pinnedNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          All Notes
        </h2>
        {regularNotes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 20 }}>
            {regularNotes.map(renderNoteCard)}
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)', background: 'var(--bg-card)', borderRadius: 20, border: '1px dashed var(--border-mid)' }}>
            <FileText size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <p>No notes found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
