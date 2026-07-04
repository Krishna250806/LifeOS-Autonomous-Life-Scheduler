'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CornerDownLeft, Sparkles, Mic } from 'lucide-react';

export default function GoalIntake() {
  const [inputValue, setInputValue] = useState('');
  const submitNaturalLanguageIntent = useStore(state => state.submitNaturalLanguageIntent);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    submitNaturalLanguageIntent(inputValue);
    setInputValue('');
  };

  // Web Speech API Integration
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error(event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      // Optional: automatically submit voice input
      submitNaturalLanguageIntent(transcript);
      setInputValue('');
    };

    recognition.start();
  };

  return (
    <div className="p-6 bg-background border-b border-border-custom z-10">
      <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto">
        <div className="relative flex items-center border border-border-custom hover:border-muted-custom bg-card-custom/40 focus-within:border-accent-custom/60 focus-within:ring-0 transition duration-200">
          
          {/* Sparkle AI Icon */}
          <div className="pl-4 pr-2 text-muted-custom">
            <Sparkles className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="State a goal, feeling, or constraint (e.g. 'I have exams in 10 days' or 'I feel tired')"
            className="w-full py-4 pr-16 bg-transparent text-foreground placeholder-muted-custom/75 focus:outline-hidden font-sans text-sm"
          />

          <div className="absolute right-3 flex items-center space-x-2">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-1.5 rounded-sm hover:bg-background transition text-muted-custom ${isListening ? 'text-accent-custom animate-pulse bg-accent-custom/10' : ''}`}
              title="Voice Intake (Web Speech API)"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Enter Button */}
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-1.5 rounded-sm border border-border-custom bg-background text-muted-custom hover:text-foreground hover:bg-card-custom transition disabled:opacity-30 disabled:pointer-events-none"
              title="Submit Intent"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Suggestion tags under the search bar */}
        <div className="flex flex-wrap gap-2 mt-3 text-2xs font-mono text-muted-custom justify-center md:justify-start">
          <span className="text-xxs uppercase tracking-wider font-semibold self-center mr-1">Suggestions:</span>
          <button 
            type="button"
            onClick={() => setInputValue("I have math exams in 10 days")}
            className="px-2 py-0.5 border border-border-custom hover:bg-card-custom hover:text-foreground transition rounded-xs"
          >
            &quot;I have exams in 10 days&quot;
          </button>
          <button 
            type="button"
            onClick={() => setInputValue("I'm feeling too tired today")}
            className="px-2 py-0.5 border border-border-custom hover:bg-card-custom hover:text-foreground transition rounded-xs"
          >
            &quot;I&apos;m feeling tired&quot;
          </button>
          <button 
            type="button"
            onClick={() => setInputValue("I feel overwhelmed with work")}
            className="px-2 py-0.5 border border-border-custom hover:bg-card-custom hover:text-foreground transition rounded-xs"
          >
            &quot;I feel overwhelmed&quot;
          </button>
        </div>
      </form>
    </div>
  );
}
