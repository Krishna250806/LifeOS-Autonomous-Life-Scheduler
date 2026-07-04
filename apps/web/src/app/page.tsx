'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Timeline from '../components/Timeline';
import GoalIntake from '../components/GoalIntake';
import AIAssistant from '../components/AIAssistant';
import DailyTasksPanel from '../components/DailyTasksPanel';
import FocusModeOverlay from '../components/FocusModeOverlay';
import WeeklyReviewView from '../components/WeeklyReviewView';
import GoalsManager from '../components/GoalsManager';
import HabitsManager from '../components/HabitsManager';
import JournalManager from '../components/JournalManager';
import { 
  Calendar, 
  Target, 
  RefreshCw, 
  BookOpen, 
  Network, 
  TrendingUp, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Focus
} from 'lucide-react';

export default function Home() {
  const { 
    theme, 
    setTheme, 
    lifeState, 
    toggleFocusMode, 
    triggerOverwhelm
  } = useStore();

  const [activeView, setActiveView] = useState<'schedule' | 'goals' | 'habits' | 'notes' | 'journal' | 'review'>('schedule');
  const [scheduleTab, setScheduleTab] = useState<'timeline' | 'tasks'>('timeline');
  const [mounted, setMounted] = useState(false);

  // Sync theme with HTML class
  useEffect(() => {
    setMounted(true);
    const root = window.document.documentElement;
    if (theme === 'graphite') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F6] text-[#1C1C1C] font-mono text-xs">
        System Calibration...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      
      {/* 1. Focus Mode Screen overlay */}
      <FocusModeOverlay />

      {/* 2. Top Header Navigation */}
      <header className="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-b border-border-custom bg-background z-30 gap-4">
        {/* Branding & Level Status */}
        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-baseline space-x-1.5">
            <span className="font-serif italic text-2xl font-semibold tracking-tighter">LifeOS</span>
            <span className="font-mono text-3xs text-muted-custom">v1.2.0</span>
          </div>

          <div className="h-4 w-[1px] bg-border-custom hidden md:block" />

          {/* Gamification Core Indicator */}
          <div className="flex items-center space-x-2">
            <span className="font-mono text-2xs uppercase tracking-wider text-muted-custom">Lvl {lifeState.level}</span>
            <div className="w-20 md:w-24 bg-border-custom h-[3px] rounded-full overflow-hidden" title="Level Experience progress">
              <div 
                className="bg-accent-custom h-full transition-all duration-300"
                style={{ width: `${(lifeState.xp % 200) / 2}%` }}
              />
            </div>
            <span className="font-mono text-3xs text-muted-custom" title="XP Points">
              {lifeState.xp % 200}/200 XP
            </span>
          </div>
        </div>

        {/* Global Controls & Integration triggers */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end flex-wrap">
          {/* Overwhelm trigger */}
          <button
            onClick={triggerOverwhelm}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-dashed border-red-300 dark:border-red-900 bg-red-500/5 hover:bg-red-500/10 text-red-700 dark:text-red-400 font-mono text-3xs tracking-widest uppercase transition"
            title="Calm Overwhelm mode"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Overwhelm</span>
          </button>

          {/* Focus Mode button */}
          <button
            onClick={toggleFocusMode}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-accent-blue bg-accent-blue/5 hover:bg-accent-blue/10 text-accent-blue font-mono text-3xs tracking-widest uppercase transition"
            title="Engage DND Focus block"
          >
            <Focus className="w-3.5 h-3.5" />
            <span>Focus Mode</span>
          </button>

          {/* Theme Selector */}
          <button
            onClick={() => setTheme(theme === 'paper' ? 'graphite' : 'paper')}
            className="p-1.5 border border-border-custom hover:bg-card-custom transition rounded-sm text-muted-custom hover:text-foreground"
            title="Toggle theme colorway"
          >
            {theme === 'paper' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 3. Main Split View Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Side: Navigation Strip */}
        <nav className="w-full lg:w-48 bg-sidebar-bg text-sidebar-fg lg:border-r border-b lg:border-b-0 border-sidebar-border flex flex-row lg:flex-col justify-between py-2 lg:py-6 px-4 z-20">
          <div className="flex lg:flex-col w-full justify-around lg:justify-start lg:space-y-1.5 overflow-x-auto lg:overflow-visible">
            <button
              onClick={() => setActiveView('schedule')}
              className={`flex items-center space-x-2.5 px-3 py-2 text-xs font-mono tracking-wide w-auto lg:w-full rounded-sm transition cursor-pointer ${activeView === 'schedule' ? 'bg-sidebar-border border-l-2 border-accent-custom text-sidebar-fg font-semibold' : 'text-sidebar-fg/60 hover:text-sidebar-fg hover:bg-sidebar-border/35'}`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">Schedule</span>
            </button>

            <button
              onClick={() => setActiveView('goals')}
              className={`flex items-center space-x-2.5 px-3 py-2 text-xs font-mono tracking-wide w-auto lg:w-full rounded-sm transition cursor-pointer ${activeView === 'goals' ? 'bg-sidebar-border border-l-2 border-accent-custom text-sidebar-fg font-semibold' : 'text-sidebar-fg/60 hover:text-sidebar-fg hover:bg-sidebar-border/35'}`}
            >
              <Target className="w-4 h-4" />
              <span className="hidden lg:inline">Goals</span>
            </button>

            <button
              onClick={() => setActiveView('habits')}
              className={`flex items-center space-x-2.5 px-3 py-2 text-xs font-mono tracking-wide w-auto lg:w-full rounded-sm transition cursor-pointer ${activeView === 'habits' ? 'bg-sidebar-border border-l-2 border-accent-custom text-sidebar-fg font-semibold' : 'text-sidebar-fg/60 hover:text-sidebar-fg hover:bg-sidebar-border/35'}`}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden lg:inline">Habits</span>
            </button>

            <button
              onClick={() => setActiveView('journal')}
              className={`flex items-center space-x-2.5 px-3 py-2 text-xs font-mono tracking-wide w-auto lg:w-full rounded-sm transition cursor-pointer ${activeView === 'journal' ? 'bg-sidebar-border border-l-2 border-accent-custom text-sidebar-fg font-semibold' : 'text-sidebar-fg/60 hover:text-sidebar-fg hover:bg-sidebar-border/35'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Journal</span>
            </button>

            <button
              onClick={() => setActiveView('review')}
              className={`flex items-center space-x-2.5 px-3 py-2 text-xs font-mono tracking-wide w-auto lg:w-full rounded-sm transition cursor-pointer ${activeView === 'review' ? 'bg-sidebar-border border-l-2 border-accent-custom text-sidebar-fg font-semibold' : 'text-sidebar-fg/60 hover:text-sidebar-fg hover:bg-sidebar-border/35'}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">Weekly Review</span>
            </button>
          </div>
        </nav>

        {/* Center Panel (Active Sub View) */}
        <main className="flex-1 overflow-hidden h-full z-10">
          {activeView === 'schedule' && (
            <div className="flex flex-col h-full overflow-hidden">
              <GoalIntake />
              
              {/* Tab Selector for Mobile (hidden on lg) */}
              <div className="flex lg:hidden border-b border-border-custom bg-background z-10 px-4 py-2 space-x-2">
                <button
                  onClick={() => setScheduleTab('timeline')}
                  className={`flex-1 py-2 text-center font-mono text-xs rounded-sm transition cursor-pointer ${
                    scheduleTab === 'timeline'
                      ? 'bg-foreground text-background font-semibold shadow-2xs'
                      : 'bg-card-custom/40 border border-border-custom text-muted-custom hover:bg-card-custom transition'
                  }`}
                >
                  Chronological Timeline
                </button>
                <button
                  onClick={() => setScheduleTab('tasks')}
                  className={`flex-1 py-2 text-center font-mono text-xs rounded-sm transition cursor-pointer ${
                    scheduleTab === 'tasks'
                      ? 'bg-foreground text-background font-semibold shadow-2xs'
                      : 'bg-card-custom/40 border border-border-custom text-muted-custom hover:bg-card-custom transition'
                  }`}
                >
                  Checklist Milestones
                </button>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className={`flex-1 h-full overflow-hidden ${scheduleTab === 'timeline' ? 'block' : 'hidden lg:block'}`}>
                  <Timeline />
                </div>
                <div className={`w-full lg:w-80 h-full overflow-hidden flex-shrink-0 ${scheduleTab === 'tasks' ? 'block' : 'hidden lg:block'}`}>
                  <DailyTasksPanel />
                </div>
              </div>
            </div>
          )}
          {activeView === 'goals' && <GoalsManager />}
          {activeView === 'habits' && <HabitsManager />}
          {activeView === 'journal' && <JournalManager />}
          {activeView === 'review' && <WeeklyReviewView />}
        </main>

        {/* Floating Copilot console (Assistant) */}
        <AIAssistant />

      </div>

    </div>
  );
}
