'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, Message } from '../store/useStore';
import { Send, Terminal, Sparkles, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistant() {
  const { 
    messages, 
    submitNaturalLanguageIntent, 
    proposedDiff, 
    commitProposedDiff, 
    discardProposedDiff, 
    clearChat,
    syncMessagesWithSession
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync messages from sessionStorage on mount
  useEffect(() => {
    syncMessagesWithSession();
  }, [syncMessagesWithSession]);

  // Scroll to bottom when messages or proposedDiff updates
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, proposedDiff, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    submitNaturalLanguageIntent(input);
    setInput('');
  };

  return (
    <>
      {/* 1. Floating AI Assistant Bubble */}
      <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition duration-300 border focus:outline-hidden hover:scale-105 active:scale-95 group ${
            isOpen 
              ? 'bg-accent-custom border-accent-custom text-white' 
              : 'bg-foreground border-border-custom text-background hover:bg-opacity-90'
          }`}
          title="Summon Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6 animate-spin-once" />
          ) : (
            <div className="relative">
              <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
              {/* Active proposed mutation notification dot */}
              {proposedDiff && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-custom opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-custom border border-background"></span>
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {/* 2. Siri/Google Assistant Siri-style Immersive Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Darkened Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#FAF9F6]/30 dark:bg-[#181818]/45 backdrop-blur-xs z-40 transition-opacity"
            />

            {/* Assistant Floating Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="fixed bottom-20 md:bottom-24 right-4 md:right-6 left-4 md:left-auto w-auto md:w-[430px] h-[calc(100vh-7rem)] md:h-[620px] max-h-[620px] md:max-h-[calc(100vh-8rem)] z-40 flex flex-col bg-background border border-border-custom shadow-2xl rounded-sm overflow-hidden"
            >
              {/* Assistant Header */}
              <div className="p-5 border-b border-border-custom flex items-center justify-between bg-card-custom/20">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1 bg-accent-custom/10 text-accent-custom rounded-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-semibold leading-tight">LifeOS Copilot</h2>
                    <span className="font-mono text-3xs text-muted-custom uppercase tracking-wider">Natural Language Coordinator</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={clearChat}
                    className="p-1.5 hover:bg-background border border-transparent hover:border-border-custom text-muted-custom hover:text-foreground transition rounded-xs"
                    title="Clear Chat History"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-background border border-transparent hover:border-border-custom text-muted-custom hover:text-foreground transition rounded-xs"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages View */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 font-sans text-xs scroll-smooth bg-background">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {/* Timestamp & Sender */}
                    <span className="font-mono text-3xs text-muted-custom tracking-wider mb-1">
                      {msg.sender === 'user' ? 'USER' : 'COPMETRIC'} • {format(new Date(msg.timestamp), 'HH:mm:ss')}
                    </span>

                    {/* Chat bubble body */}
                    <div 
                      className={`p-3.5 border rounded-sm leading-relaxed max-w-[90%] whitespace-pre-wrap ${
                        msg.sender === 'user' 
                          ? 'bg-foreground text-background border-transparent font-medium shadow-2xs' 
                          : 'bg-card-custom border-border-custom text-foreground font-light shadow-3xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Inline Schedule Mutations Preview (Diff Console) */}
                {proposedDiff && (
                  <div className="p-4 border border-accent-custom bg-accent-custom/5 rounded-xs space-y-4 shadow-3xs">
                    <div className="flex items-center space-x-1.5 font-mono text-3xs text-accent-custom font-bold tracking-widest">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>MUTATION CONSOLE (DRAFT)</span>
                    </div>

                    {proposedDiff.goal && (
                      <div className="p-2.5 bg-background border border-border-custom rounded-xs">
                        <span className="font-mono text-3xs text-accent-custom uppercase tracking-widest font-semibold">[NEW GOAL]</span>
                        <p className="font-serif text-xs font-semibold mt-0.5">{proposedDiff.goal.title}</p>
                        <p className="font-mono text-3xs text-muted-custom mt-1">Target: {proposedDiff.goal.targetDate} ({proposedDiff.goal.intensity} intensity)</p>
                      </div>
                    )}

                    {proposedDiff.addedBlocks.length > 0 || proposedDiff.deferredBlocks.length > 0 ? (
                      <div className="space-y-2">
                        <span className="font-mono text-3xs text-muted-custom uppercase tracking-widest">[SCHEDULE MUTATIONS]</span>
                        
                        {/* Deferred Blocks (Red) */}
                        {proposedDiff.deferredBlocks.map((b) => (
                          <div key={`diff-del-${b.id}`} className="flex items-center justify-between p-2 bg-red-500/5 border border-red-200/50 text-red-900 dark:text-red-300 dark:border-red-950/50 text-xxs rounded-xs">
                            <div className="truncate pr-2">
                              <span className="font-mono text-3xs text-red-600 dark:text-red-400 block">{b.startTime} - {b.endTime}</span>
                              <span className="line-through font-serif font-medium">{b.title}</span>
                            </div>
                            <span className="text-3xs font-mono bg-red-100 dark:bg-red-950 px-1 py-0.5 rounded-xs border border-red-200/50">DEFERRED</span>
                          </div>
                        ))}

                        {/* Added Blocks (Green) */}
                        {proposedDiff.addedBlocks.map((b) => (
                          <div key={`diff-add-${b.id}`} className="flex items-center justify-between p-2 bg-emerald-500/5 border border-emerald-200/50 text-emerald-900 dark:text-emerald-300 dark:border-emerald-950/50 text-xxs rounded-xs">
                            <div className="truncate pr-2">
                              <span className="font-mono text-3xs text-emerald-600 dark:text-emerald-400 block">{b.startTime} - {b.endTime}</span>
                              <span className="font-serif font-medium">{b.title}</span>
                            </div>
                            <span className="text-3xs font-mono bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded-xs border border-emerald-200/50">ADD</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex space-x-2 pt-2 border-t border-border-custom/50">
                      <button 
                        onClick={discardProposedDiff}
                        className="flex-1 py-1.5 border border-border-custom bg-background font-mono text-3xs hover:bg-card-custom transition uppercase tracking-wider rounded-xs"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={commitProposedDiff}
                        className="flex-1 py-1.5 bg-accent-custom text-white font-mono text-3xs hover:bg-opacity-90 transition font-semibold shadow-xs uppercase tracking-wider rounded-xs"
                      >
                        Commit Re-Plan
                      </button>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input Box */}
              <form onSubmit={handleSend} className="p-4 border-t border-border-custom bg-card-custom/10 flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask or command (e.g. 'add goal Read 10 books')"
                  className="flex-1 py-2 px-3 border border-border-custom bg-background focus:outline-hidden focus:border-accent-custom/50 text-xs font-sans placeholder-muted-custom"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 border border-border-custom bg-background text-muted-custom hover:text-foreground hover:bg-card-custom transition disabled:opacity-30 disabled:pointer-events-none rounded-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
