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
          <span className="font-sans text-3xs font-semibold uppercase tracking-wider text-muted-custom">REFLECTIONS</span>
          <h1 className="font-sans text-2xl font-semibold mt-1">Self-Reflective Journal</h1>
        </div>
        <button
          onClick={generateNightlyJournal}
          className="px-4 py-2 border border-border-custom bg-card-custom hover:bg-[#FAF9F7] font-sans text-xs font-semibold text-[#222222] transition rounded-xl cursor-pointer"
        >
          Draft Today&apos;s Entry
        </button>
      </div>

      <div className="space-y-6">
        {journals.length === 0 ? (
          <div className="border border-dashed border-border-custom p-12 text-center text-muted-custom rounded-2xl">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-custom/60" />
            <p className="font-sans text-sm font-medium">No journal entries recorded.</p>
            <p className="text-3xs font-sans mt-1 font-semibold uppercase tracking-wider">Click the button above to generate a nightly draft summary.</p>
          </div>
        ) : (
          journals.map((j) => {
            const isEditing = editingId === j.id;

            return (
              <div 
                key={j.id} 
                className="p-6 border border-border-custom bg-card-custom rounded-2xl shadow-xs space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">
                      {format(new Date(j.date), 'MMMM dd, yyyy')} • Mood: {j.mood}
                    </span>
                    {j.isDraft && (
                      <span className="font-sans text-3xs text-accent-custom font-semibold tracking-wider ml-3">
                        [DRAFT]
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">
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
                      className="w-full p-3 border border-border-custom bg-background text-foreground font-sans text-sm focus:outline-hidden leading-relaxed rounded-xl"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-border-custom font-sans text-xs font-semibold hover:bg-background transition rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(j.id)}
                        className="px-3 py-1.5 bg-card-custom border border-border-custom font-sans text-xs font-semibold hover:bg-[#FAF9F7] transition text-foreground rounded-xl cursor-pointer"
                      >
                        Save Copy
                      </button>
                      <button
                        onClick={() => handlePublish(j.id)}
                        className="px-3 py-1.5 bg-accent-blue text-white font-sans text-xs font-semibold hover:bg-[#3F5BE8] active:bg-[#3450D1] transition rounded-xl cursor-pointer border-none shadow-sm"
                      >
                        Publish Journal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="font-sans text-sm font-normal text-foreground leading-relaxed whitespace-pre-wrap">
                      {j.content}
                    </p>
                    
                    <div className="flex justify-end pt-2 border-t border-border-custom/30">
                      <button
                        onClick={() => handleStartEdit(j)}
                        className="flex items-center space-x-1.5 font-sans text-3xs font-semibold text-muted-custom hover:text-foreground transition cursor-pointer"
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
