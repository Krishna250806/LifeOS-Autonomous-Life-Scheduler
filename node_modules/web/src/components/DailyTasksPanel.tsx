'use client';

import React, { useState } from 'react';
import { useStore, Task } from '../store/useStore';
import { Plus, Check, Trash2, Calendar, Clock, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { format, addDays, subDays, parseISO } from 'date-fns';

export default function DailyTasksPanel() {
  const { 
    selectedDate, 
    setSelectedDate, 
    tasks, 
    addTask, 
    toggleTaskComplete, 
    deleteTask,
    goals 
  } = useStore();
  
  // Form states
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('next');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [scheduledTime, setScheduledTime] = useState('');

  const parsedDate = parseISO(selectedDate);

  const handlePrevDay = () => {
    setSelectedDate(format(subDays(parsedDate, 1), 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    setSelectedDate(format(addDays(parsedDate, 1), 'yyyy-MM-dd'));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledTime) return;

    addTask({
      title: title.trim(),
      priority,
      dueDate: selectedDate,
      estimatedMinutes
    }, scheduledTime);

    setTitle('');
    setEstimatedMinutes(30);
    setScheduledTime('');
  };

  // Filter tasks and goals for the selected date
  const dailyTasks = tasks.filter(t => t.dueDate === selectedDate);
  const dailyGoals = goals.filter(g => g.targetDate === selectedDate);
  
  // Sort tasks: uncompleted first, then by priority (now -> next -> this_week -> later)
  const priorityOrder = { now: 0, next: 1, this_week: 2, later: 3 };
  const sortedTasks = [...dailyTasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="flex flex-col h-full bg-background/5 border-l border-border-custom select-none">
      
      {/* 1. Date Switcher Header (Pinned) */}
      <div className="p-4 border-b border-border-custom flex items-center justify-between bg-background z-10">
        <button 
          onClick={handlePrevDay}
          className="p-1.5 hover:bg-card-custom border border-transparent hover:border-border-custom rounded-full transition text-muted-custom hover:text-foreground"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="font-sans text-3xs uppercase tracking-wider text-muted-custom font-semibold">Ledger</span>
          <span className="font-serif text-sm font-semibold mt-0.5">
            {format(parsedDate, 'EEEE, MMM d')}
          </span>
        </div>

        <button 
          onClick={handleNextDay}
          className="p-1.5 hover:bg-card-custom border border-transparent hover:border-border-custom rounded-full transition text-muted-custom hover:text-foreground"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Add Task Form (Pinned at the Top below Header) */}
      <div className="p-4 border-b border-border-custom bg-background z-10">
        <h4 className="font-sans text-xs font-semibold mb-2 flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-accent-blue" />
          <span>Add Scheduled Milestone</span>
        </h4>
        
        <form onSubmit={handleAddTask} className="space-y-2.5 font-sans text-xs">
          <div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title (e.g. Code auth router)"
              className="w-full p-2.5 border border-border-custom bg-card-custom/40 focus:outline-hidden focus:border-accent-custom/50 text-xs font-sans placeholder-muted-custom rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-sans text-3xs text-muted-custom uppercase font-semibold">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs rounded-xl"
              >
                <option value="now">Now (High)</option>
                <option value="next">Next (Medium)</option>
                <option value="this_week">This Week</option>
                <option value="later">Later (Low)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-sans text-3xs text-muted-custom uppercase font-semibold">Est. Mins</label>
              <input
                type="number"
                min="5"
                step="5"
                required
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Math.max(5, parseInt(e.target.value, 10) || 5))}
                className="w-full p-2 border border-border-custom bg-background focus:outline-hidden text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Time Selector (Compulsory) */}
          <div className="space-y-1">
            <label className="font-sans text-3xs text-accent-custom uppercase font-semibold">Start Time</label>
            <input
              type="time"
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full p-2 border border-accent-custom/45 focus:border-accent-custom bg-background focus:outline-hidden text-xs rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-accent-blue text-white font-sans text-xs font-semibold hover:bg-[#3F5BE8] active:bg-[#3450D1] transition flex items-center justify-center space-x-1.5 rounded-xl cursor-pointer border-none shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Task Milestone</span>
          </button>
        </form>
      </div>

      {/* 3. Scrollable List Section (Goals + Tasks) with Bottom Padding for Bubble */}
      <div className="flex-1 overflow-y-auto pb-24 space-y-4">
        
        {/* Daily Target Goals Section */}
        {dailyGoals.length > 0 && (
          <div className="p-4 bg-accent-custom/5 border-b border-border-custom/50 space-y-2">
            <div className="flex items-center space-x-1.5 text-accent-custom">
              <Target className="w-3.5 h-3.5" />
              <span className="font-sans text-3xs uppercase tracking-wider font-semibold">Target Deadlines Today</span>
            </div>
            <div className="space-y-1.5">
              {dailyGoals.map(g => (
                <div key={g.id} className="p-2.5 bg-background border border-border-custom/50 rounded-xl flex flex-col justify-between shadow-xs">
                  <span className="font-sans text-xs font-semibold text-foreground">{g.title}</span>
                  <span className="font-sans text-3xs text-muted-custom mt-0.5">{g.category} horizon • {g.intensity} intensity</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Checklist List */}
        <div className="p-4 space-y-3">
          <span className="font-sans text-3xs uppercase tracking-wider font-semibold text-muted-custom block mb-1">Tasks</span>
          
          {sortedTasks.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center border border-dashed border-border-custom p-6 text-center rounded-2xl">
              <Calendar className="w-5 h-5 text-muted-custom/60 mb-2" />
              <p className="font-sans text-xs font-medium text-muted-custom">Nothing planned yet.</p>
              <p className="font-sans text-3xs text-muted-custom mt-1 font-semibold uppercase tracking-wider">Enjoy a calm day.</p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const isCompleted = task.isCompleted;
              return (
                <div 
                  key={task.id}
                  className={`p-3.5 border flex items-start justify-between space-x-2 transition duration-200 group rounded-2xl ${
                    isCompleted 
                      ? 'bg-card-custom/25 border-border-custom/50 text-muted-custom line-through opacity-75' 
                      : 'bg-card-custom border-border-custom hover:border-muted-custom shadow-xs'
                  }`}
                >
                  <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                    {/* Custom Checkbox */}
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-border-custom hover:border-muted-custom bg-background'
                      }`}
                    >
                      {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        {/* Priority Tag */}
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                          task.priority === 'now' ? 'bg-accent-custom' :
                          task.priority === 'next' ? 'bg-accent-blue' :
                          task.priority === 'this_week' ? 'bg-amber-500' : 'bg-muted-custom'
                        }`} />
                        <span className="font-sans text-3xs text-muted-custom font-semibold uppercase tracking-wider">
                          {task.priority === 'this_week' ? 'this week' : task.priority}
                        </span>
                      </div>

                      <p className={`font-sans text-xs font-semibold mt-0.5 leading-snug break-words ${
                        isCompleted ? 'text-muted-custom' : 'text-foreground'
                      }`}>
                        {task.title}
                      </p>

                      <div className="flex items-center space-x-1.5 mt-1 font-sans text-3xs text-muted-custom">
                        <Clock className="w-3 h-3 text-muted-custom/75" />
                        <span>{task.estimatedMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-muted-custom hover:text-red-600 rounded-full transition-opacity duration-150 cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
