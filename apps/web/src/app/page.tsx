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

  const getNavButtonClass = (view: 'schedule' | 'goals' | 'habits' | 'notes' | 'journal' | 'review') => {
    const base = "flex items-center justify-center lg:justify-start space-x-2.5 p-2.5 lg:px-3 lg:py-2 text-xs font-sans tracking-wide w-auto lg:w-full transition cursor-pointer";
    const active = "bg-accent-custom text-white rounded-full lg:bg-sidebar-border lg:text-sidebar-fg lg:border-l-2 lg:border-accent-custom lg:rounded-xl font-semibold";
    const inactive = "text-sidebar-fg/60 hover:text-sidebar-fg hover:bg-sidebar-border/35 rounded-full lg:rounded-xl";
    return `${base} ${activeView === view ? active : inactive}`;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      
      {/* 1. Focus Mode Screen overlay */}
      <FocusModeOverlay />

      {/* 2. Top Header Navigation */}
      <header className="flex flex-row justify-between items-center px-4 py-3 md:px-6 md:py-4 border-b border-border-custom bg-background z-30 gap-2">
        {/* Branding & Level Status */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-baseline space-x-1">
            <span className="font-serif italic text-lg md:text-2xl font-semibold tracking-tighter">LifeOS</span>
            <span className="font-sans text-3xs text-muted-custom hidden md:inline">v1.2.0</span>
          </div>

          <div className="h-4 w-[1px] bg-border-custom hidden md:block" />

          {/* Gamification Core Indicator */}
          <div className="flex items-center space-x-1.5 md:space-x-2">
            <span className="font-sans text-3xs md:text-xs font-semibold uppercase tracking-wider text-muted-custom">Lvl {lifeState.level}</span>
            <div className="w-12 md:w-24 bg-border-custom h-[2px] md:h-[3px] rounded-full overflow-hidden" title="Level Experience progress">
              <div 
                className="bg-accent-custom h-full transition-all duration-300"
                style={{ width: `${(lifeState.xp % 200) / 2}%` }}
              />
            </div>
            <span className="font-sans text-3xs text-muted-custom hidden sm:inline" title="XP Points">
              {lifeState.xp % 200}/200 XP
            </span>
          </div>
        </div>

        {/* Global Controls & Integration triggers */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Overwhelm trigger */}
          <button
            onClick={triggerOverwhelm}
            className="p-2 md:px-3 md:py-1.5 flex items-center gap-1.5 border border-dashed border-red-300 dark:border-red-900 bg-red-500/5 hover:bg-red-500/10 text-red-700 dark:text-red-400 font-sans text-2xs font-semibold transition rounded-full md:rounded-lg"
            title="Calm Overwhelm mode"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Overwhelm</span>
          </button>

          {/* Focus Mode button */}
          <button
            onClick={toggleFocusMode}
            className="p-2 md:px-3 md:py-1.5 flex items-center gap-1.5 border border-accent-blue bg-accent-blue/5 hover:bg-accent-blue/10 text-accent-blue font-sans text-2xs font-semibold transition rounded-full md:rounded-lg"
            title="Engage DND Focus block"
          >
            <Focus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Focus Mode</span>
          </button>

          {/* Theme Selector */}
          <button
            onClick={() => setTheme(theme === 'paper' ? 'graphite' : 'paper')}
            className="p-2 border border-border-custom hover:bg-card-custom transition rounded-full text-muted-custom hover:text-foreground"
            title="Toggle theme colorway"
          >
            {theme === 'paper' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 3. Main Split View Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Side: Navigation Strip */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto bg-sidebar-bg/95 backdrop-blur-md border border-sidebar-border rounded-full py-1.5 px-2 shadow-xl flex flex-row items-center gap-1 lg:relative lg:bottom-auto lg:left-auto lg:translate-x-0 lg:w-48 lg:border-r lg:border-b-0 lg:rounded-none lg:shadow-none lg:flex-col lg:py-6 lg:px-4 lg:z-20 lg:bg-sidebar-bg lg:text-sidebar-fg">
          <div className="flex flex-row lg:flex-col w-full justify-around lg:justify-start gap-1 lg:gap-0 lg:space-y-1.5">
            <button
              onClick={() => setActiveView('schedule')}
              className={getNavButtonClass('schedule')}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">Schedule</span>
            </button>

            <button
              onClick={() => setActiveView('goals')}
              className={getNavButtonClass('goals')}
            >
              <Target className="w-4 h-4" />
              <span className="hidden lg:inline">Goals</span>
            </button>

            <button
              onClick={() => setActiveView('habits')}
              className={getNavButtonClass('habits')}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden lg:inline">Habits</span>
            </button>

            <button
              onClick={() => setActiveView('journal')}
              className={getNavButtonClass('journal')}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Journal</span>
            </button>

            <button
              onClick={() => setActiveView('review')}
              className={getNavButtonClass('review')}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">Weekly Review</span>
            </button>
          </div>
        </nav>

        {/* Center Panel (Active Sub View) */}
        <main className="flex-1 overflow-hidden h-full z-10 pb-20 lg:pb-0">
          {activeView === 'schedule' && (
            <div className="flex flex-col h-full overflow-hidden">
              <GoalIntake />
              
              {/* Tab Selector for Mobile (hidden on lg) */}
              <div className="flex lg:hidden border-b border-border-custom bg-background z-10 px-4 py-2 space-x-2">
                <button
                  onClick={() => setScheduleTab('timeline')}
                  className={`flex-1 py-2 text-center font-sans text-xs rounded-full transition cursor-pointer ${
                    scheduleTab === 'timeline'
                      ? 'bg-foreground text-background font-semibold shadow-xs'
                      : 'bg-card-custom/40 border border-border-custom text-muted-custom hover:bg-card-custom transition'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setScheduleTab('tasks')}
                  className={`flex-1 py-2 text-center font-sans text-xs rounded-full transition cursor-pointer ${
                    scheduleTab === 'tasks'
                      ? 'bg-foreground text-background font-semibold shadow-xs'
                      : 'bg-card-custom/40 border border-border-custom text-muted-custom hover:bg-card-custom transition'
                  }`}
                >
                  Checklist
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
