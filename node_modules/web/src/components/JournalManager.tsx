'use client';

import React, { useState } from 'react';
import { useStore, JournalEntry } from '../store/useStore';
import { BookOpen, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

export default function JournalManager() {
  const { journals, saveJournalDraft, publishJournal, generateNightlyJournal } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState('');

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setDraftContent(entry.content);
  };

  const handleSave = (id: string) => {
    saveJournalDraft(id, draftContent);
    setEditingId(null);
  };

  const handlePublish = (id: string) => {
    publishJournal(id);
    setEditingId(null);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 bg-background h-full overflow-y-auto pb-24 select-none">
      
      {/* Page Header */}
      <div className="border-b border-border-custom pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-custom">REFLECTIONS</span>
          <h1 className="font-serif text-3xl font-light mt-1">Self-Reflective Journal</h1>
        </div>
        <button
          onClick={generateNightlyJournal}
          className="px-4 py-2 border border-border-custom hover:bg-card-custom font-mono text-xs hover:text-foreground text-muted-custom transition"
        >
          Draft Today&apos;s Entry
        </button>
      </div>

      <div className="space-y-6">
        {journals.length === 0 ? (
          <div className="border border-dashed border-border-custom p-12 text-center text-muted-custom">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-custom" />
            <p className="font-serif text-sm">No journal entries recorded.</p>
            <p className="text-2xs font-mono mt-1">Click the button above to generate a nightly draft summary.</p>
          </div>
        ) : (
          journals.map((j) => {
            const isEditing = editingId === j.id;

            return (
              <div 
                key={j.id} 
                className={`p-6 border border-border-custom ${j.isDraft ? 'bg-card-custom/25' : 'bg-card-custom/5'} space-y-4`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-3xs text-muted-custom uppercase tracking-widest">
                      {format(new Date(j.date), 'MMMM dd, yyyy')} • Mood: {j.mood}
                    </span>
                    {j.isDraft && (
                      <span className="font-mono text-3xs text-accent-custom font-semibold tracking-tighter ml-3">
                        [DRAFT]
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-3xs text-muted-custom">
                      Tasks Completed: {j.completedTasksCount}
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      rows={5}
                      className="w-full p-3 border border-border-custom bg-background text-foreground font-sans text-sm focus:outline-hidden leading-relaxed"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 border border-border-custom font-mono text-2xs hover:bg-background transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(j.id)}
                        className="px-3 py-1 bg-background border border-border-custom font-mono text-2xs hover:bg-card-custom transition text-foreground"
                      >
                        Save Copy
                      </button>
                      <button
                        onClick={() => handlePublish(j.id)}
                        className="px-3 py-1 bg-accent-custom text-white font-mono text-2xs hover:bg-opacity-90 transition font-medium"
                      >
                        Publish Journal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="font-sans text-sm font-light text-foreground leading-relaxed whitespace-pre-wrap">
                      {j.content}
                    </p>
                    
                    <div className="flex justify-end pt-2 border-t border-border-custom/30">
                      <button
                        onClick={() => handleStartEdit(j)}
                        className="flex items-center space-x-1.5 font-mono text-3xs text-muted-custom hover:text-foreground transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Reflection</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
