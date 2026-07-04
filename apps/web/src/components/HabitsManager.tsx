'use client';

import React, { useState } from 'react';
import { useStore, Habit } from '../store/useStore';
import { RefreshCw, Zap, CheckCircle2, Trash2, Plus, Clock, Award, Flame, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function HabitsManager() {
  const { habits, blocks, selectedDate, addHabit, deleteHabit, completeHabitToday, submitNaturalLanguageIntent } = useStore();

  // Custom habit form states
  const [newTitle, setNewTitle] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState(30);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addHabit({
      title: newTitle.trim(),
      frequency,
      startTime,
      duration
    });

    setNewTitle('');
    setStartTime('08:00');
    setDuration(30);
  };

  const addPresetHabit = (title: string, start: string, dur: number, freq: string) => {
    addHabit({
      title,
      frequency: freq,
      startTime: start,
      duration: dur
    });
  };

  // Consistency Score calculation
  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
  const averageStreak = habits.length > 0 ? Math.round(totalStreaks / habits.length) : 0;
  const complianceRate = habits.length > 0 ? Math.round(100 - (habits.reduce((acc, h) => acc + h.skips, 0) * 5)) : 100;
  const safeCompliance = Math.max(0, Math.min(100, complianceRate));

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 bg-background h-full overflow-y-auto pb-24 select-none">
      
      {/* Page Header */}
      <div className="border-b border-border-custom pb-6">
        <span className="font-mono text-2xs uppercase tracking-widest text-muted-custom">ROUTINES & COMPLIANCE</span>
        <h1 className="font-serif text-3xl font-light mt-1">Habits & Routine Audits</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Habits List & Scorecard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Consistency Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-border-custom bg-card-custom/5 p-5 shadow-3xs">
            <div className="space-y-1">
              <span className="font-mono text-3xs text-muted-custom uppercase tracking-wider">Rhythm Adherence Score</span>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif text-4xl font-light text-accent-custom">{safeCompliance}%</span>
                <span className="font-mono text-3xs text-muted-custom uppercase">target status</span>
              </div>
              <p className="text-3xs text-muted-custom leading-snug">
                Based on skipping margins over the past 30 days. Maintain above 80% to ensure active streak level-ups.
              </p>
            </div>

            <div className="space-y-1 border-t md:border-t-0 md:border-l border-border-custom pt-4 md:pt-0 md:pl-5">
              <span className="font-mono text-3xs text-muted-custom uppercase tracking-wider">Ritual Consistency</span>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif text-4xl font-light text-foreground">{averageStreak}d</span>
                <span className="font-mono text-3xs text-muted-custom uppercase">avg streak</span>
              </div>
              <p className="text-3xs text-muted-custom leading-snug">
                Your cumulative ritual momentum. Each consecutive execution builds gamified experience points.
              </p>
            </div>
          </div>

          {/* Active Rituals List */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-accent-custom" />
              <span>Active Rituals</span>
            </h2>

            {habits.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center border border-dashed border-border-custom p-6 text-center">
                <CheckCircle2 className="w-6 h-6 text-muted-custom/60 mb-2" />
                <p className="font-serif text-sm font-medium text-muted-custom">No routine habits defined</p>
                <p className="font-mono text-xs text-muted-custom/70 mt-1 uppercase">Configure a daily ritual on the right</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map((h) => {
                  const isCompletedToday = blocks.some(b => b.habitId === h.id && b.date === selectedDate && b.isCompleted);
                  return (
                    <div 
                      key={h.id} 
                      className="p-5 border border-border-custom bg-card-custom/10 flex flex-col justify-between h-44 shadow-3xs"
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-mono text-3xs text-muted-custom uppercase tracking-widest block">
                            {h.frequency} frequency
                          </span>
                          <h3 className="font-serif text-base font-semibold mt-0.5 truncate">{h.title}</h3>
                          {h.startTime && h.duration && (
                            <div className="flex items-center space-x-1.5 mt-1 font-mono text-3xs text-muted-custom">
                              <Clock className="w-3 h-3 text-accent-custom" />
                              <span>{h.startTime} ({h.duration} mins)</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deleteHabit(h.id)}
                          className="p-1 hover:bg-red-500/10 text-muted-custom hover:text-red-600 rounded-xs transition"
                          title="Delete Routine Habit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-end border-t border-border-custom/30 pt-3">
                        <div className="flex items-center space-x-3">
                          <div>
                            <span className="font-mono text-4xs text-muted-custom uppercase tracking-wider block">Streak</span>
                            <span className="font-serif text-xl font-light text-foreground flex items-center">
                              <Flame className="w-3.5 h-3.5 text-accent-custom mr-0.5" />
                              <span>{h.streak}d</span>
                            </span>
                          </div>
                          <div>
                            <span className="font-mono text-4xs text-muted-custom uppercase tracking-wider block">Skips</span>
                            <span className="font-serif text-xl font-light text-muted-custom">{h.skips}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => completeHabitToday(h.id)}
                          disabled={isCompletedToday}
                          className={`px-3 py-1.5 font-mono text-3xs uppercase tracking-wider transition flex items-center space-x-1.5 ${
                            isCompletedToday 
                              ? 'bg-card-custom/50 border border-border-custom/50 text-muted-custom cursor-not-allowed' 
                              : 'bg-foreground text-background hover:bg-opacity-90'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCompletedToday ? 'Completed Today' : 'Complete Today'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Add Habit Form & Presets */}
        <div className="space-y-8">
          
          {/* Custom routine add form */}
          <div className="border border-border-custom p-6 bg-card-custom/5 space-y-4 shadow-3xs">
            <h3 className="font-serif text-base font-medium">Establish Daily Ritual</h3>
            
            <form onSubmit={handleCreateHabit} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-mono text-3xs text-muted-custom uppercase">Ritual Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Guided Core Stretch"
                  className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs font-sans placeholder-muted-custom"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-mono text-3xs text-muted-custom uppercase">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-3xs text-muted-custom uppercase">Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Math.max(5, parseInt(e.target.value, 10) || 5))}
                    className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-3xs text-muted-custom uppercase">Recurrence</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekdays">Weekdays Only</option>
                  <option value="Weekends">Weekends Only</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-foreground text-background font-mono text-xxs hover:bg-opacity-95 transition flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Establish Daily Ritual</span>
              </button>
            </form>
          </div>

          {/* Quick Preset Blueprints */}
          <div className="border border-border-custom p-6 bg-card-custom/20 space-y-4">
            <h3 className="font-serif text-base font-medium flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-accent-custom" />
              <span>Ritual Presets</span>
            </h3>
            <p className="text-2xs text-muted-custom leading-normal">
              Quickly incorporate these recommended, highly structured routines directly into your everyday timeline checklist:
            </p>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => addPresetHabit('Morning Hydration & Planning', '08:00', 15, 'Daily')}
                className="w-full p-3 border border-border-custom bg-background hover:bg-card-custom transition flex items-center justify-between text-left"
              >
                <div>
                  <p className="font-serif text-xs font-semibold">Morning Alignment</p>
                  <p className="font-mono text-3xs text-muted-custom mt-0.5">08:00 • 15 minutes</p>
                </div>
                <Plus className="w-4 h-4 text-accent-custom" />
              </button>

              <button 
                onClick={() => addPresetHabit('Gratitude Journaling', '21:30', 15, 'Daily')}
                className="w-full p-3 border border-border-custom bg-background hover:bg-card-custom transition flex items-center justify-between text-left"
              >
                <div>
                  <p className="font-serif text-xs font-semibold">Evening Reflection</p>
                  <p className="font-mono text-3xs text-muted-custom mt-0.5">21:30 • 15 minutes</p>
                </div>
                <Plus className="w-4 h-4 text-accent-custom" />
              </button>

              <button 
                onClick={() => addPresetHabit('Deep Work Session', '09:00', 120, 'Weekdays')}
                className="w-full p-3 border border-border-custom bg-background hover:bg-card-custom transition flex items-center justify-between text-left"
              >
                <div>
                  <p className="font-serif text-xs font-semibold">Deep Focus Block</p>
                  <p className="font-mono text-3xs text-muted-custom mt-0.5">09:00 • 120 minutes</p>
                </div>
                <Plus className="w-4 h-4 text-accent-custom" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
