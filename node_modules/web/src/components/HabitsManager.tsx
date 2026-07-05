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
        <span className="font-sans text-3xs font-semibold uppercase tracking-wider text-muted-custom">ROUTINES & COMPLIANCE</span>
        <h1 className="font-sans text-2xl font-semibold mt-1">Habits & Routine Audits</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Habits List & Scorecard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Consistency Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-border-custom bg-card-custom p-5 rounded-2xl shadow-xs">
            <div className="space-y-1">
              <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">Rhythm Adherence Score</span>
              <div className="flex items-baseline space-x-2">
                <span className="font-sans text-3xl font-semibold text-accent-blue">{safeCompliance}%</span>
                <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">target status</span>
              </div>
              <p className="text-3xs text-muted-custom leading-snug">
                Based on skipping margins over the past 30 days. Maintain above 80% to ensure active streak level-ups.
              </p>
            </div>

            <div className="space-y-1 border-t md:border-t-0 md:border-l border-border-custom pt-4 md:pt-0 md:pl-5">
              <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">Ritual Consistency</span>
              <div className="flex items-baseline space-x-2">
                <span className="font-sans text-3xl font-semibold text-foreground">{averageStreak}d</span>
                <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">avg streak</span>
              </div>
              <p className="text-3xs text-muted-custom leading-snug">
                Your cumulative ritual momentum. Each consecutive execution builds experience points.
              </p>
            </div>
          </div>

          {/* Active Rituals List */}
          <div className="space-y-4">
            <h2 className="font-sans text-lg font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-accent-blue" />
              <span>Active Rituals</span>
            </h2>

            {habits.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center border border-dashed border-border-custom p-6 text-center rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-muted-custom/60 mb-2" />
                <p className="font-sans text-sm font-medium text-muted-custom">Nothing planned yet.</p>
                <p className="font-sans text-3xs text-muted-custom mt-1 font-semibold uppercase tracking-wider">Enjoy a calm day.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map((h) => {
                  const isCompletedToday = blocks.some(b => b.habitId === h.id && b.date === selectedDate && b.isCompleted);
                  return (
                    <div 
                      key={h.id} 
                      className="p-5 border border-border-custom bg-card-custom flex flex-col justify-between min-h-44 shadow-sm rounded-2xl hover:border-muted-custom/30 transition duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider block">
                            {h.frequency} frequency
                          </span>
                          <h3 className="font-sans text-sm font-semibold mt-0.5 truncate">{h.title}</h3>
                          {h.startTime && h.duration && (
                            <div className="flex items-center space-x-1.5 mt-1 font-sans text-3xs text-muted-custom">
                              <Clock className="w-3 h-3 text-accent-blue" />
                              <span>{h.startTime} ({h.duration} mins)</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deleteHabit(h.id)}
                          className="p-1.5 hover:bg-red-500/10 text-muted-custom hover:text-red-600 rounded-xl transition"
                          title="Delete Routine Habit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-end border-t border-border-custom/30 pt-3">
                        <div className="flex items-center space-x-3">
                          <div>
                            <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider block">Streak</span>
                            <span className="font-sans text-sm font-semibold text-foreground flex items-center">
                              <Flame className="w-3.5 h-3.5 text-accent-custom mr-0.5" />
                              <span>{h.streak}d</span>
                            </span>
                          </div>
                          <div>
                            <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider block">Skips</span>
                            <span className="font-sans text-sm font-semibold text-muted-custom">{h.skips}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => completeHabitToday(h.id)}
                          disabled={isCompletedToday}
                          className={`px-3.5 py-2 font-sans text-3xs uppercase tracking-wider transition flex items-center space-x-1.5 rounded-xl font-semibold cursor-pointer ${
                            isCompletedToday 
                              ? 'bg-[#7CBF8E]/10 border border-[#7CBF8E]/25 text-[#7CBF8E] cursor-not-allowed' 
                              : 'bg-accent-blue text-white hover:bg-[#3F5BE8] active:bg-[#3450D1] shadow-sm'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCompletedToday ? 'Completed' : 'Complete'}</span>
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
          <div className="border border-border-custom p-6 bg-card-custom rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-sans text-sm font-semibold">Establish Daily Ritual</h3>
            
            <form onSubmit={handleCreateHabit} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">Ritual Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Guided Core Stretch"
                  className="w-full p-2.5 border border-border-custom bg-background focus:outline-hidden text-xs font-sans placeholder-muted-custom rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs font-sans rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Math.max(5, parseInt(e.target.value, 10) || 5))}
                    className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs font-sans rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">Recurrence</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs rounded-xl"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekdays">Weekdays Only</option>
                  <option value="Weekends">Weekends Only</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-accent-blue text-white font-sans text-xs font-semibold hover:bg-[#3F5BE8] active:bg-[#3450D1] transition flex items-center justify-center space-x-1.5 rounded-xl cursor-pointer border-none shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Establish Daily Ritual</span>
              </button>
            </form>
          </div>

          {/* Quick Preset Blueprints */}
          <div className="border border-border-custom p-6 bg-card-custom rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-sans text-sm font-semibold flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-accent-blue" />
              <span>Ritual Presets</span>
            </h3>
            <p className="text-2xs text-muted-custom leading-normal">
              Quickly incorporate these recommended, highly structured routines directly into your everyday timeline checklist:
            </p>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => addPresetHabit('Morning Hydration & Planning', '08:00', 15, 'Daily')}
                className="w-full p-3.5 border border-border-custom bg-card-custom hover:bg-[#FAF9F7] transition flex items-center justify-between text-left rounded-xl cursor-pointer"
              >
                <div>
                  <p className="font-sans text-xs font-semibold">Morning Alignment</p>
                  <p className="font-sans text-3xs text-muted-custom mt-0.5 font-medium">08:00 • 15 minutes</p>
                </div>
                <Plus className="w-4 h-4 text-accent-blue" />
              </button>

              <button 
                onClick={() => addPresetHabit('Gratitude Journaling', '21:30', 15, 'Daily')}
                className="w-full p-3.5 border border-border-custom bg-card-custom hover:bg-[#FAF9F7] transition flex items-center justify-between text-left rounded-xl cursor-pointer"
              >
                <div>
                  <p className="font-sans text-xs font-semibold">Evening Reflection</p>
                  <p className="font-sans text-3xs text-muted-custom mt-0.5 font-medium">21:30 • 15 minutes</p>
                </div>
                <Plus className="w-4 h-4 text-accent-blue" />
              </button>

              <button 
                onClick={() => addPresetHabit('Deep Work Session', '09:00', 120, 'Weekdays')}
                className="w-full p-3.5 border border-border-custom bg-card-custom hover:bg-[#FAF9F7] transition flex items-center justify-between text-left rounded-xl cursor-pointer"
              >
                <div>
                  <p className="font-sans text-xs font-semibold">Deep Focus Block</p>
                  <p className="font-sans text-3xs text-muted-custom mt-0.5 font-medium">09:00 • 120 minutes</p>
                </div>
                <Plus className="w-4 h-4 text-accent-blue" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
