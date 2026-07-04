'use client';

import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { X, Play, Pause, Disc, Volume2, Shield } from 'lucide-react';

export default function FocusModeOverlay() {
  const { focusMode, toggleFocusMode, tickFocusTimer } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize background focus audio loop
  useEffect(() => {
    audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4; // Soft background volume

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync state with HTML5 audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (focusMode.isActive && focusMode.spotifyTrack?.isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Browser autoplay blocked audio playback. Gesture required:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [focusMode.isActive, focusMode.spotifyTrack?.isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (focusMode.isActive && focusMode.timeLeft > 0) {
      interval = setInterval(() => {
        tickFocusTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusMode.isActive, focusMode.timeLeft, tickFocusTimer]);

  if (!focusMode.isActive) return null;

  const minutes = Math.floor(focusMode.timeLeft / 60);
  const seconds = focusMode.timeLeft % 60;
  const progress = (focusMode.timeLeft / focusMode.duration) * 100;

  const toggleTrackPlay = () => {
    useStore.setState((state) => ({
      focusMode: {
        ...state.focusMode,
        spotifyTrack: state.focusMode.spotifyTrack
          ? { ...state.focusMode.spotifyTrack, isPlaying: !state.focusMode.spotifyTrack.isPlaying }
          : undefined
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-background/98 z-50 flex flex-col justify-between p-8 md:p-12 font-sans select-none dark:bg-black/95 transition-all duration-300">
      
      {/* Top Header */}
      <div className="flex justify-between items-center w-full max-w-5xl mx-auto">
        <div className="flex items-center space-x-2 font-mono text-2xs uppercase tracking-widest text-muted-custom">
          <Shield className="w-3.5 h-3.5 text-accent-blue" />
          <span>INTRUSION SHIELD ACTIVE (DND)</span>
        </div>
        <button
          onClick={toggleFocusMode}
          className="p-1.5 border border-border-custom hover:border-muted-custom transition rounded-sm text-muted-custom hover:text-foreground"
          title="Exit Focus Mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Pomodoro Timer */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full relative">
        {/* Large Typography Clock */}
        <span className="font-mono text-7xl md:text-9xl font-light tracking-tighter tabular-nums leading-none">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
        
        {/* Focus task indicator */}
        <p className="font-serif text-lg text-muted-custom mt-6 font-light italic">
          Focus Block: Core Codebase Architecture
        </p>

        {/* Minimal Progress Bar */}
        <div className="w-full max-w-xs bg-border-custom/50 h-[1.5px] mt-8 relative overflow-hidden">
          <div 
            className="bg-accent-blue h-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controller */}
        <div className="flex items-center space-x-6 mt-8">
          <button 
            onClick={toggleFocusMode}
            className="p-3 border border-border-custom hover:bg-card-custom transition text-muted-custom hover:text-foreground rounded-full"
            title={focusMode.isActive ? 'Pause' : 'Start'}
          >
            {focusMode.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Integrations (Spotify ambient player mockup) */}
      {focusMode.spotifyTrack && (
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center py-4 border-t border-border-custom gap-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleTrackPlay}
              className={`p-2 rounded-full border border-border-custom hover:bg-card-custom transition ${focusMode.spotifyTrack?.isPlaying ? 'animate-spin' : ''}`} 
              style={{ animationDuration: '6s' }}
              title={focusMode.spotifyTrack?.isPlaying ? "Pause music" : "Play music"}
            >
              <Disc className={`w-4 h-4 ${focusMode.spotifyTrack?.isPlaying ? 'text-accent-blue' : 'text-muted-custom'}`} />
            </button>
            <div>
              <p className="font-mono text-3xs uppercase tracking-widest text-muted-custom">AMBIENT FOCUS PLAYLIST</p>
              <p className="font-serif text-sm font-medium">{focusMode.spotifyTrack.title}</p>
              <p className="text-2xs text-muted-custom">{focusMode.spotifyTrack.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 font-mono text-2xs text-muted-custom border border-border-custom px-3 py-1.5 rounded-sm">
            <Volume2 className="w-3.5 h-3.5 text-accent-blue" />
            <span>connected audio play source</span>
          </div>
        </div>
      )}

    </div>
  );
}
