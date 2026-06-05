import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { ArrowLeft, Save, CheckSquare, List, Type, Pin } from 'lucide-react';

export function NoteEditor({ noteId, onBack }) {
  const { workspaceNotes, addWorkspaceNote, updateWorkspaceNote, togglePinWorkspaceNote } = useFinanceStore();
  
  const existingNote = noteId === 'new' ? null : workspaceNotes.find(n => n.id === noteId);
  
  const [title, setTitle] = useState(existingNote ? existingNote.title : '');
  const [content, setContent] = useState(existingNote ? existingNote.content : '');
  const [type, setType] = useState(existingNote ? existingNote.type : 'General');
  const [isPinned, setIsPinned] = useState(existingNote ? existingNote.isPinned : false);

  const handleSave = () => {
    if (noteId === 'new') {
      if (title.trim() || content.trim()) {
        addWorkspaceNote({ title: title || 'Untitled', content, type, isPinned });
      }
    } else {
      updateWorkspaceNote(noteId, { title, content, type });
      if (existingNote.isPinned !== isPinned) togglePinWorkspaceNote(noteId);
    }
    onBack();
  };

  const insertText = (prefix) => {
    setContent(prev => prev + (prev.endsWith('\n') || prev === '' ? prefix : '\n' + prefix));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)', minHeight: '60vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Editor Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-warm)' }}>
            <ArrowLeft size={18} />
          </button>
          <select 
            value={type} 
            onChange={e => setType(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }}
          >
            <option value="General">General Note</option>
            <option value="Decision Log">Decision Log</option>
            <option value="Checklist">Checklist</option>
            <option value="Goal Plan">Goal Plan</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setIsPinned(!isPinned)}
            style={{ background: 'none', border: 'none', color: isPinned ? T.gold : 'var(--text-faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: 'var(--bg-warm)' }}
            title="Pin Note"
          >
            <Pin size={18} fill={isPinned ? T.gold : 'none'} />
          </button>
          <button 
            onClick={handleSave}
            style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 12, padding: '0 20px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Save size={16} /> Save Note
          </button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div style={{ padding: '10px 30px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--bg-warm)' }}>
        <button onClick={() => insertText('# ')} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Type size={14}/> H1</button>
        <button onClick={() => insertText('## ')} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Type size={14}/> H2</button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button onClick={() => insertText('- ')} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><List size={14}/> Bullet</button>
        <button onClick={() => insertText('[ ] ')} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><CheckSquare size={14}/> Task</button>
      </div>

      {/* Editor Body */}
      <div style={{ padding: 30, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <input 
          type="text" 
          placeholder="Note Title" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', fontSize: '2rem', fontWeight: 800, color: 'var(--text)', border: 'none', outline: 'none', background: 'transparent', marginBottom: 20 }}
        />
        <textarea 
          placeholder="Start writing..."
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ width: '100%', flex: 1, fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text)', border: 'none', outline: 'none', background: 'transparent', resize: 'none', fontFamily: 'inherit' }}
        />
      </div>
    </motion.div>
  );
}
