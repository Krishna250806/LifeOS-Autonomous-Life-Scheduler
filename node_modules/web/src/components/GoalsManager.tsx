'use client';

import React, { useState } from 'react';
import { useStore, Goal } from '../store/useStore';
import { Target, Calendar, Sparkles, BookOpen, HeartPulse, Code, Trash2, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function GoalsManager() {
  const { goals, addGoal, deleteGoal, submitNaturalLanguageIntent } = useStore();
  
  // Custom states for manual creation form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Goal['category']>('custom');
  const [newIntensity, setNewIntensity] = useState<Goal['intensity']>('moderate');
  const [newDate, setNewDate] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dailyFocusTime, setDailyFocusTime] = useState('09:00');
  const [useAiPlanning, setUseAiPlanning] = useState(false);

  // Manage which goal's plan details are expanded
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    addGoal({
      title: newTitle.trim(),
      category: newCategory,
      intensity: newIntensity,
      targetDate: newDate || format(new Date(), 'yyyy-MM-dd'),
      startDate,
      dailyFocusTime
    }, useAiPlanning);

    setNewTitle('');
    setNewDate('');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setDailyFocusTime('09:00');
    setUseAiPlanning(false);
  };

  // Run structured template
  const triggerTemplate = (category: string) => {
    if (category === 'exam') {
      submitNaturalLanguageIntent('I want to schedule preparation for an exam in 10 days.');
    } else if (category === 'fitness') {
      submitNaturalLanguageIntent('I need a moderate fitness habit schedule starting next week.');
    } else {
      submitNaturalLanguageIntent('Create a project deadline goal template for coding React components.');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 bg-background h-full overflow-y-auto pb-24 select-none">
      
      {/* Page Header */}
      <div className="border-b border-border-custom pb-6">
        <span className="font-mono text-2xs uppercase tracking-widest text-muted-custom">METRICS & GOALS</span>
        <h1 className="font-serif text-3xl font-light mt-1">Goals & Plan Blueprints</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: List of Goals */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-xl font-medium flex items-center space-x-2">
            <Target className="w-5 h-5 text-accent-custom" />
            <span>Active Goal Horizons</span>
          </h2>
          
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center border border-dashed border-border-custom p-6 text-center">
                <Target className="w-6 h-6 text-muted-custom/60 mb-2" />
                <p className="font-serif text-sm font-medium text-muted-custom">No goal horizons registered</p>
                <p className="font-mono text-xs text-muted-custom/70 mt-1 uppercase">Define a custom target on the right</p>
              </div>
            ) : (
              goals.map((g) => {
                const isExpanded = expandedGoalId === g.id;
                return (
                  <div 
                    key={g.id} 
                    className="border border-border-custom bg-card-custom/10 flex flex-col justify-between shadow-3xs hover:border-muted-custom/75 transition duration-200"
                  >
                    {/* Header Clickable Row to Toggle Details */}
                    <div 
                      onClick={() => setExpandedGoalId(isExpanded ? null : g.id)}
                      className="p-5 flex justify-between items-start cursor-pointer select-none"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="font-mono text-3xs uppercase tracking-widest text-muted-custom">
                          {g.category} horizon // {g.intensity} intensity
                        </span>
                        <h3 className="font-serif text-base font-semibold mt-1 flex items-center space-x-2 truncate">
                          <span>{g.title}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-custom" /> : <ChevronDown className="w-4 h-4 text-muted-custom" />}
                        </h3>
                        {g.startDate && g.dailyFocusTime && (
                          <div className="flex items-center space-x-3 mt-1.5 font-mono text-4xs text-muted-custom uppercase">
                            <span>Start: {g.startDate}</span>
                            <span>•</span>
                            <span>Prep Time: {g.dailyFocusTime}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <div className="font-mono text-2xs text-muted-custom flex items-center space-x-1 bg-card-custom/40 px-2 py-1 border border-border-custom">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Deadline: {g.targetDate}</span>
                        </div>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1 hover:bg-red-500/10 text-muted-custom hover:text-red-600 rounded-xs transition"
                          title="Delete Goal Horizon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar (Always Visible) */}
                    <div className="px-5 pb-5">
                      <div className="flex justify-between text-2xs font-mono text-muted-custom mb-1.5">
                        <span>Milestone Roadmap Completion</span>
                        <span>{g.progress}%</span>
                      </div>
                      <div className="w-full bg-border-custom/50 h-[2px]">
                        <div 
                          className="bg-accent-custom h-full transition-all duration-500" 
                          style={{ width: `${g.progress}%` }} 
                        />
                      </div>
                    </div>

                    {/* Expandable Plan Details Curriculum */}
                    {isExpanded && g.planSkeleton && (
                      <div className="px-5 pb-5 pt-4 border-t border-border-custom/50 bg-background/50 space-y-3">
                        <div className="flex items-center space-x-1.5 text-accent-custom">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-serif text-xs font-semibold">AI Generated Daily Curriculum Blueprint</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
                          {g.planSkeleton.map((step) => (
                            <div 
                              key={step.dayNumber} 
                              className="p-3 border border-border-custom/40 bg-card-custom/20 rounded-xs space-y-1 font-sans text-xs"
                            >
                              <div className="flex justify-between items-baseline font-mono text-3xs text-muted-custom">
                                <span className="font-bold text-foreground">DAY {step.dayNumber}</span>
                                <span>{step.date}</span>
                              </div>
                              <p className="font-serif text-xxs font-semibold text-accent-blue leading-snug mt-0.5">{step.taskTitle}</p>
                              <p className="text-3xs text-muted-custom leading-tight mt-1">{step.details}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Manual Add (TOP) & Template Skeletons (BOTTOM) */}
        <div className="space-y-8">
          
          {/* Manual Intake form (Swapped to Top) */}
          <div className="border border-border-custom p-6 bg-card-custom/5 space-y-4 shadow-3xs">
            <h3 className="font-serif text-base font-medium">Record Goal Horizon</h3>
            
            <form onSubmit={handleCreateGoal} className="space-y-3 font-sans text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-mono text-3xs text-muted-custom uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Learn Full Stack Web Development"
                  className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs font-sans placeholder-muted-custom"
                />
              </div>

              {/* Category & Intensity */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-mono text-3xs text-muted-custom uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Goal['category'])}
                    className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs"
                  >
                    <option value="custom">Custom</option>
                    <option value="exam">Exam</option>
                    <option value="fitness">Fitness</option>
                    <option value="deadline">Deadline</option>
                    <option value="habit">Habit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-3xs text-muted-custom uppercase">Intensity</label>
                  <select
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(e.target.value as Goal['intensity'])}
                    className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs"
                  >
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-mono text-3xs text-muted-custom uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-3xs text-muted-custom uppercase">Target Deadline</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs font-mono"
                  />
                </div>
              </div>

              {/* Prep Focus Time */}
              <div className="space-y-1">
                <label className="font-mono text-3xs text-muted-custom uppercase">Daily Focus Time</label>
                <input
                  type="time"
                  required
                  value={dailyFocusTime}
                  onChange={(e) => setDailyFocusTime(e.target.value)}
                  className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs font-mono"
                />
              </div>

              {/* Planning Mode Checkbox */}
              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="useAiPlanning"
                  checked={useAiPlanning}
                  onChange={(e) => setUseAiPlanning(e.target.checked)}
                  className="rounded-xs border-border-custom text-accent-custom focus:ring-0 cursor-pointer h-3.5 w-3.5 bg-background"
                />
                <label htmlFor="useAiPlanning" className="font-mono text-3xs text-muted-custom uppercase cursor-pointer select-none">
                  Use AI to generate prep timeline
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-foreground text-background font-mono text-xxs hover:bg-opacity-95 transition"
              >
                Insert Goal Horizon
              </button>
            </form>
          </div>

          {/* Quick AI Templates (Swapped to Bottom) */}
          <div className="border border-border-custom p-6 bg-card-custom/20 space-y-4">
            <h3 className="font-serif text-base font-medium flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-accent-custom" />
              <span>Blueprint Templates</span>
            </h3>
            <p className="text-2xs text-muted-custom leading-normal">
              Inject template-assisted schedules directly. The AI will customize dates and distribute events study-first.
            </p>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => triggerTemplate('exam')}
                className="w-full p-3 border border-border-custom bg-background hover:bg-card-custom transition flex items-center space-x-3 text-left"
              >
                <BookOpen className="w-4 h-4 text-accent-custom" />
                <div>
                  <p className="font-serif text-xs font-semibold">10-Day Exam Preparation</p>
                  <p className="font-mono text-3xs text-muted-custom mt-0.5">High intensity study/review intervals</p>
                </div>
              </button>

              <button 
                onClick={() => triggerTemplate('fitness')}
                className="w-full p-3 border border-border-custom bg-background hover:bg-card-custom transition flex items-center space-x-3 text-left"
              >
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="font-serif text-xs font-semibold">Fitness Alignment Routine</p>
                  <p className="font-mono text-3xs text-muted-custom mt-0.5">Active habit blocks scheduled at energy peaks</p>
                </div>
              </button>

              <button 
                onClick={() => triggerTemplate('custom')}
                className="w-full p-3 border border-border-custom bg-background hover:bg-card-custom transition flex items-center space-x-3 text-left"
              >
                <Code className="w-4 h-4 text-accent-blue" />
                <div>
                  <p className="font-serif text-xs font-semibold">React Project Sprint</p>
                  <p className="font-mono text-3xs text-muted-custom mt-0.5">Structured technical design & code blocks</p>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
