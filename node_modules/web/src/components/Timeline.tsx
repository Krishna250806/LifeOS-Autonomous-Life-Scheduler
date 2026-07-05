'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore, ScheduleBlock } from '../store/useStore';
import { Check, X, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

const HOUR_HEIGHT = 80; // 80px per hour
const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // ~1.33px per minute

// Helper to convert "HH:MM" to minutes from 00:00
const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Overlap layout algorithm for side-by-side calendar blocks
interface BlockLayout {
  width: number;
  left: number;
}

const computeBlockLayouts = (blocksList: ScheduleBlock[]) => {
  const sorted = [...blocksList].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const layouts: Record<string, BlockLayout> = {};
  
  let activeGroup: ScheduleBlock[] = [];
  let groupEndMins = 0;

  const layoutGroup = (group: ScheduleBlock[]) => {
    const groupColumns: ScheduleBlock[][] = [];
    group.forEach((block) => {
      const startMins = timeToMinutes(block.startTime);
      let placed = false;

      for (let i = 0; i < groupColumns.length; i++) {
        const col = groupColumns[i];
        const lastBlockInCol = col[col.length - 1];
        const colEndMins = timeToMinutes(lastBlockInCol.startTime) + lastBlockInCol.duration;

        if (startMins >= colEndMins) {
          col.push(block);
          placed = true;
          break;
        }
      }

      if (!placed) {
        groupColumns.push([block]);
      }
    });

    const totalCols = groupColumns.length;
    groupColumns.forEach((col, colIndex) => {
      col.forEach((block) => {
        layouts[block.id] = {
          width: 100 / totalCols,
          left: colIndex * (100 / totalCols)
        };
      });
    });
  };

  sorted.forEach((block) => {
    const startMins = timeToMinutes(block.startTime);
    const endMins = startMins + block.duration;

    if (activeGroup.length === 0 || startMins < groupEndMins) {
      activeGroup.push(block);
      groupEndMins = Math.max(groupEndMins, endMins);
    } else {
      layoutGroup(activeGroup);
      activeGroup = [block];
      groupEndMins = endMins;
    }
  });

  if (activeGroup.length > 0) {
    layoutGroup(activeGroup);
  }

  return layouts;
};

export default function Timeline() {
  const { 
    blocks, 
    completeBlock, 
    skipBlock, 
    proposedDiff, 
    commitProposedDiff, 
    discardProposedDiff 
  } = useStore();

  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [nowOffset, setNowOffset] = useState<number | null>(null);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update "Now" line offset
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setCurrentTimeStr(formatted);
      
      const totalMins = hours * 60 + minutes;
      setNowOffset(totalMins * MINUTE_HEIGHT);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // Scroll to "Now" line on mount
  useEffect(() => {
    if (nowOffset !== null && containerRef.current) {
      // Scroll to a bit above the now line
      containerRef.current.scrollTop = Math.max(0, nowOffset - 200);
    }
  }, [nowOffset]);

  const selectedDate = useStore(state => state.selectedDate);
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const seedDefaultBlocksIfEmpty = useStore(state => state.seedDefaultBlocksIfEmpty);

  useEffect(() => {
    seedDefaultBlocksIfEmpty();
  }, [selectedDate, seedDefaultBlocksIfEmpty]);

  // Generate 24 hourly marks
  const hourMarks = Array.from({ length: 24 }, (_, i) => i);

  // Split active blocks and proposed updates (filtered by selectedDate)
  const activeBlocks = blocks.filter(b => b.date === selectedDate || (!b.date && isToday));
  
  // Create sets to mark blocks during a proposed re-plan diff
  const deferredBlockIds = new Set(proposedDiff?.deferredBlocks.map(b => b.id) || []);
  const proposedAddedBlocks = (proposedDiff?.addedBlocks || []).filter(b => b.date === selectedDate || (!b.date && isToday));

  // Compute collision columns layout maps
  const allBlocksForLayout = [...activeBlocks, ...proposedAddedBlocks];
  const blockLayouts = computeBlockLayouts(allBlocksForLayout);

  return (
    <div className="flex flex-col h-full bg-background border-r border-border-custom relative select-none">
      
      {/* Header Info */}
      <div className="p-6 border-b border-border-custom flex items-center justify-between bg-background z-20">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-custom">Daily Rhythm ({format(parseISO(selectedDate), 'MMM d, yyyy')})</span>
          <h2 className="font-serif text-2xl font-light mt-0.5">Chronological Ruler</h2>
        </div>
        {isToday && (
          <div className="flex items-center space-x-2 font-mono text-xs text-muted-custom">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-custom animate-pulse" />
            <span>Now: {currentTimeStr || '13:01'}</span>
          </div>
        )}
      </div>

      {/* Draft Plan Diff Banner (Top) */}
      <AnimatePresence>
        {proposedDiff && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-card-custom border-b border-accent-custom flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 z-10"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 text-accent-custom mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-serif text-sm font-medium">Proposed Schedule Re-Plan</p>
                <p className="text-xs text-muted-custom mt-0.5 max-w-lg">
                  {proposedDiff.originMessage || 'AI suggests adjusting your schedule to accommodate new priority guidelines.'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <button 
                onClick={discardProposedDiff}
                className="flex-1 md:flex-none px-3 py-1.5 border border-border-custom font-mono text-xs hover:bg-background transition"
              >
                Discard
              </button>
              <button 
                onClick={commitProposedDiff}
                className="flex-1 md:flex-none px-3 py-1.5 bg-accent-custom text-white font-mono text-xs hover:bg-opacity-90 transition shadow-sm"
              >
                Confirm Plan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Timeline Axis */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto relative scroll-smooth"
      >
        <div 
          className="relative w-full"
          style={{ height: 24 * HOUR_HEIGHT }}
        >
          {/* 1. Hour gridlines */}
          {hourMarks.map((hour) => {
            const topPos = hour * HOUR_HEIGHT;
            return (
              <div 
                key={hour} 
                className="absolute left-0 right-0 border-b border-border-custom border-dashed flex items-start"
                style={{ top: topPos, height: HOUR_HEIGHT }}
              >
                <div className="w-16 text-right pr-4 font-mono text-xxs text-muted-custom mt-1 tabular-nums">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 h-full border-l border-border-custom bg-grid opacity-10 pointer-events-none" />
              </div>
            );
          })}

          {/* 2. Now indicator line */}
          {isToday && nowOffset !== null && (
            <div 
              className="absolute left-0 right-0 flex items-center z-10 pointer-events-none transition-all duration-1000"
              style={{ top: nowOffset }}
            >
              <div className="w-16 pr-3 text-right">
                <span className="font-sans text-3xs font-bold text-accent-custom bg-background px-2 py-0.5 border border-accent-custom rounded-full">
                  NOW
                </span>
              </div>
              <div className="flex-1 border-t-2 border-accent-custom" />
              <div className="h-2 w-2 rounded-full bg-accent-custom -ml-1 border border-background" />
            </div>
          )}

          {/* 3. Schedule Blocks */}
          <div className="absolute left-16 right-4 top-0 bottom-0 pointer-events-none">
            
            {/* Render Active Blocks */}
            <AnimatePresence initial={false}>
              {activeBlocks.map((block) => {
                const startMins = timeToMinutes(block.startTime);
                const top = startMins * MINUTE_HEIGHT;
                const height = block.duration * MINUTE_HEIGHT;
                const isDeferred = deferredBlockIds.has(block.id);
                const isExpanded = expandedBlockId === block.id;

                return (
                  <motion.div
                    key={block.id}
                    layoutId={`block-${block.id}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ 
                      opacity: isDeferred ? 0.35 : 1, 
                      scale: 1,
                      x: 0,
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                    className={`absolute p-3 border rounded-xl flex flex-col justify-between pointer-events-auto group cursor-pointer transition-shadow duration-150 ${
                      isExpanded ? 'z-30 shadow-md border-muted-custom bg-card-custom' : 'z-10'
                    } ${
                      block.isCompleted 
                        ? 'bg-card-custom/50 border-border-custom text-muted-custom line-through' 
                        : block.isSkipped
                        ? 'bg-card-custom/20 border-dashed border-border-custom text-muted-custom opacity-50'
                        : isDeferred
                        ? 'bg-red-500/5 border-red-200 border-dashed border text-red-800 dark:text-red-300 dark:border-red-900/50'
                        : block.type === 'sleep'
                        ? 'bg-card-custom/40 border-border-custom/80 text-muted-custom font-light'
                        : block.category === 'health'
                        ? 'bg-emerald-500/5 border-emerald-200/50 text-emerald-800 dark:text-emerald-300 dark:border-emerald-900/50'
                        : block.category === 'education'
                        ? 'bg-accent-blue/5 border-accent-blue/20 text-accent-blue dark:text-blue-300'
                        : 'bg-card-custom border-border-custom hover:border-muted-custom shadow-2xs'
                    }`}
                    style={{ 
                      top, 
                      height: isExpanded ? 'auto' : Math.max(height - 4, 30),
                      minHeight: isExpanded ? Math.max(height - 4, 50) : undefined,
                      width: `calc(${(blockLayouts[block.id] || { width: 100 }).width}% - 6px)`,
                      left: `calc(${(blockLayouts[block.id] || { left: 0 }).left}% + 4px)`
                    }}
                  >
                    <div className={`flex justify-between w-full ${isExpanded ? 'flex-col space-y-2' : 'items-center'}`}>
                      <div className={`flex min-w-0 flex-1 ${isExpanded ? 'flex-col items-start space-y-1.5' : 'items-center space-x-2.5'}`}>
                        {/* Header metadata row */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {/* Bullet marker */}
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                            block.category === 'health' ? 'bg-emerald-500' :
                            block.category === 'education' ? 'bg-accent-blue' :
                            block.category === 'work' ? 'bg-accent-custom' : 'bg-muted-custom'
                          }`} />
                          
                          <span className="font-mono text-2xs uppercase tracking-wider text-muted-custom flex-shrink-0 tabular-nums">
                            {block.startTime} – {block.endTime}
                          </span>

                          {isDeferred && (
                            <span className="font-mono text-3xs text-red-600 dark:text-red-400 font-semibold tracking-tight flex-shrink-0">
                              [DEFERRING]
                            </span>
                          )}
                        </div>
                        
                        {!isExpanded && <span className="text-muted-custom/40 flex-shrink-0 text-3xs">•</span>}

                        <h3 className={`font-serif text-xs font-semibold text-foreground min-w-0 ${
                          isExpanded ? 'whitespace-normal break-words w-full' : 'truncate flex-1'
                        }`}>
                          {block.title}
                        </h3>

                        {/* Rationale displayed inline or block */}
                        {block.rationale && (
                          isExpanded ? (
                            <div className="text-3xs text-muted-custom border-t border-border-custom/30 pt-1.5 w-full leading-normal font-mono italic whitespace-normal break-words">
                              {block.rationale}
                            </div>
                          ) : (
                            height >= 50 && (
                              <span className="font-mono text-3xs text-muted-custom/75 truncate hidden sm:inline pl-1.5 italic max-w-[40%]">
                                — {block.rationale}
                              </span>
                            )
                          )
                        )}
                      </div>
                                       {/* Checkbox controls for actions */}
                      {!block.isCompleted && !block.isSkipped && !isDeferred && block.type !== 'sleep' && (
                        <div 
                          onClick={(e) => e.stopPropagation()} // Prevent collapse toggling when clicking action button
                          className={`flex items-center space-x-1 bg-background/90 dark:bg-card-custom p-0.5 rounded-full border border-border-custom transition-opacity duration-150 flex-shrink-0 z-20 ${
                            isExpanded ? 'self-end' : 'opacity-0 group-hover:opacity-100 pl-2'
                          }`}
                        >
                          <button
                            onClick={() => completeBlock(block.id)}
                            className="p-1 hover:bg-emerald-500/10 text-emerald-600 rounded-full"
                            title="Complete Block"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => skipBlock(block.id)}
                            className="p-1 hover:bg-red-500/10 text-red-600 rounded-full"
                            title="Skip / Reschedule"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
 
            {/* Render Proposed ADDED Blocks */}
            <AnimatePresence>
              {proposedAddedBlocks.map((block) => {
                const startMins = timeToMinutes(block.startTime);
                const top = startMins * MINUTE_HEIGHT;
                const height = block.duration * MINUTE_HEIGHT;
 
                return (
                  <motion.div
                    key={`prop-add-${block.id}`}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute p-3 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 dark:bg-emerald-950/20 rounded-xl flex flex-col justify-between"
                    style={{ 
                      top, 
                      height: Math.max(height - 4, 30),
                      width: `calc(${(blockLayouts[block.id] || { width: 100 }).width}% - 6px)`,
                      left: `calc(${(blockLayouts[block.id] || { left: 0 }).left}% + 4px)`,
                      borderStyle: 'dashed'
                    }}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="font-mono text-2xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {block.startTime} – {block.endTime} [PROPOSED NEW]
                        </span>
                      </div>
                      <h3 className="font-serif text-sm font-semibold mt-0.5 leading-snug">
                        {block.title}
                      </h3>
                      {block.rationale && (
                        <p className="text-2xs text-emerald-800 dark:text-emerald-300 italic leading-tight mt-1">
                          {block.rationale}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 text-2xs font-mono text-emerald-600 dark:text-emerald-400">
                      <Zap className="w-3 h-3" />
                      <span>AI Scheduled Slot</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
