'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sparkles, Calendar, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { useStore } from '../store/useStore';
import { subDays, format } from 'date-fns';

export default function WeeklyReviewView() {
  const { blocks, tasks, habits } = useStore();

  // Generate date markers for the past 7 days ending today
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE') // Mon, Tue, etc.
    };
  });

  // Compile dynamic metrics per day
  const chartData = dates.map(({ dateStr, label }) => {
    const dayBlocks = blocks.filter(b => b.date === dateStr);
    
    // Focus hours: completed study, work, or custom tasks
    const focusMins = dayBlocks
      .filter(b => b.isCompleted && (b.category === 'education' || b.category === 'work'))
      .reduce((acc, b) => acc + b.duration, 0);
    const focusHours = parseFloat((focusMins / 60).toFixed(1));

    // Sleep hours: sum of sleep blocks not skipped
    const sleepMins = dayBlocks
      .filter(b => b.type === 'sleep')
      .reduce((acc, b) => acc + (b.isSkipped ? 0 : b.duration), 0);
    const sleepHours = parseFloat((sleepMins / 60).toFixed(1));

    // Tasks completed
    const tasksDone = dayBlocks.filter(b => b.taskId && b.isCompleted).length;

    return {
      day: label,
      focusHours,
      sleep: sleepMins > 0 ? sleepHours : 8.0, // Default to standard 8h if no sleep block seeded
      tasksDone
    };
  });

  // Calculate Hero Summary Stats
  const totalFocusHours = parseFloat(chartData.reduce((acc, d) => acc + d.focusHours, 0).toFixed(1));
  const avgFocusHours = parseFloat((totalFocusHours / 7).toFixed(1));
  const avgSleep = parseFloat((chartData.reduce((acc, d) => acc + d.sleep, 0) / 7).toFixed(1));

  // Productivity Score: Completed blocks vs scheduled blocks (excluding sleep & buffer)
  const relevantBlocks = blocks.filter(b => {
    const isPast7 = dates.some(d => d.dateStr === b.date);
    return isPast7 && b.type !== 'sleep' && b.type !== 'buffer' && !b.isSkipped;
  });
  const completedBlocks = relevantBlocks.filter(b => b.isCompleted);
  const productivityScore = relevantBlocks.length > 0 
    ? Math.round((completedBlocks.length / relevantBlocks.length) * 100) 
    : 0;

  // Habit completion rate
  const routineBlocks = blocks.filter(b => {
    const isPast7 = dates.some(d => d.dateStr === b.date);
    return isPast7 && b.type === 'routine';
  });
  const completedRoutines = routineBlocks.filter(b => b.isCompleted);
  const habitCompletionRate = routineBlocks.length > 0 
    ? Math.round((completedRoutines.length / routineBlocks.length) * 100) 
    : 0;

  const avgStreak = habits.length > 0
    ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length)
    : 0;

  // Week description
  const startOfWeekStr = format(subDays(new Date(), 6), 'MMMM dd');
  const endOfWeekStr = format(new Date(), 'MMMM dd, yyyy');

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 bg-background h-full overflow-y-auto pb-24 select-none">
      
      {/* Editorial Header */}
      <div className="border-b border-border-custom pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-custom">RETROSPECTIVE</span>
          <h1 className="font-serif text-3xl font-light mt-1">Weekly Alignment Review</h1>
        </div>
        <div className="font-mono text-xs text-muted-custom">
          {startOfWeekStr} — {endOfWeekStr}
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-border-custom divide-x divide-y md:divide-y-0 divide-border-custom bg-card-custom/20">
        <div className="p-6 text-center">
          <span className="font-mono text-3xs uppercase tracking-wider text-muted-custom block">Productivity Score</span>
          <span className="font-serif text-4xl font-light mt-1 block">{productivityScore}%</span>
          <span className="font-mono text-xxs text-muted-custom tracking-tight mt-1 block">
            {productivityScore === 0 ? 'Initialize timeline tasks' : 'Schedule completion rate'}
          </span>
        </div>
        <div className="p-6 text-center">
          <span className="font-mono text-3xs uppercase tracking-wider text-muted-custom block">Deep Focus Hours</span>
          <span className="font-serif text-4xl font-light mt-1 block">{totalFocusHours}h</span>
          <span className="font-mono text-xxs text-muted-custom tracking-tight mt-1 block">Avg {avgFocusHours}h / day</span>
        </div>
        <div className="p-6 text-center">
          <span className="font-mono text-3xs uppercase tracking-wider text-muted-custom block">Sleep Alignment</span>
          <span className="font-serif text-4xl font-light mt-1 block">{avgSleep}h</span>
          <span className="font-mono text-xxs text-muted-custom tracking-tight mt-1 block">Avg duration buffer</span>
        </div>
        <div className="p-6 text-center">
          <span className="font-mono text-3xs uppercase tracking-wider text-muted-custom block">Habit Adherence</span>
          <span className="font-serif text-4xl font-light mt-1 block">{habitCompletionRate}%</span>
          <span className="font-mono text-xxs text-muted-custom tracking-tight mt-1 block">Avg streak: {avgStreak}d</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Focus Hours Line Chart */}
        <div className="border border-border-custom p-6 bg-card-custom/10">
          <span className="font-mono text-2xs uppercase tracking-wider text-muted-custom">Focus Allocation</span>
          <h3 className="font-serif text-base font-medium mt-1 mb-6">Daily Deep Work Hours</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} stroke="var(--muted)" />
                <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} stroke="var(--muted)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    borderColor: 'var(--border)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="focusHours" 
                  stroke="var(--accent)" 
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: 'var(--accent)' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Duration Bar Chart */}
        <div className="border border-border-custom p-6 bg-card-custom/10">
          <span className="font-mono text-2xs uppercase tracking-wider text-muted-custom">Circadian Patterns</span>
          <h3 className="font-serif text-base font-medium mt-1 mb-6">Sleep Duration (Hours)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} stroke="var(--muted)" />
                <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} stroke="var(--muted)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    borderColor: 'var(--border)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                  }} 
                />
                <Bar 
                  dataKey="sleep" 
                  fill="var(--accent-secondary)" 
                  radius={[1, 1, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Suggestions (Insights) */}
      <div className="border border-border-custom p-6 bg-card-custom/20 space-y-4">
        <div className="flex items-center space-x-2 text-accent-custom">
          <Sparkles className="w-4 h-4" />
          <span className="font-mono text-2xs uppercase tracking-widest font-semibold">AI Generated Suggestions</span>
        </div>
        
        <div className="space-y-4 font-sans text-sm font-light leading-relaxed">
          {productivityScore === 0 ? (
            <div className="py-2 text-muted-custom text-xs font-mono">
              Proposing startup actions: Add task deadlines on Goals page, configure recurring rituals on Habits, and tick them complete on your Schedule timeline to trigger scheduling recommendations and diagnostic graphs.
            </div>
          ) : (
            <>
              <div className="border-l-2 border-accent-custom pl-4">
                <p className="font-medium text-foreground">
                  {avgFocusHours < 2.0 ? 'Establish Focus Blocks' : 'Focus Levels Optimal'}
                </p>
                <p className="text-muted-custom text-xs mt-1">
                  {avgFocusHours < 2.0 
                    ? `You are averaging ${avgFocusHours}h of deep work daily. Proposing scheduling structured 90-minute morning focus sessions to build learning momentum.`
                    : `Maintaining an average of ${avgFocusHours}h of daily focus. The scheduling algorithm projects solid goal blueprint acceleration if you continue protecting these deep work hours.`
                  }
                </p>
              </div>

              <div className="border-l-2 border-accent-blue pl-4">
                <p className="font-medium text-foreground">
                  {avgSleep < 7.0 ? 'Circadian Restoration Alert' : 'Healthy Circadian Rhythm'}
                </p>
                <p className="text-muted-custom text-xs mt-1">
                  {avgSleep < 7.0
                    ? `Average sleep duration is only ${avgSleep}h. Proposing wrapping up evening routine blocks 30 minutes earlier to safeguard night recovery.`
                    : `Average sleep duration is stable at ${avgSleep}h, which provides an optimal cognitive restoration score for learning performance.`
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
