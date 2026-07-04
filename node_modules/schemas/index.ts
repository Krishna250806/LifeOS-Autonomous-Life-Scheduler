import { z } from 'zod';

export const ScheduleBlockSchema = z.object({
  id: z.string(),
  title: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number(),
  type: z.enum(['fixed', 'flexible', 'sleep', 'buffer', 'routine']),
  category: z.enum(['work', 'health', 'education', 'leisure', 'essential']),
  isCompleted: z.boolean(),
  isSkipped: z.boolean(),
  rationale: z.string().optional(),
  goalId: z.string().optional(),
  habitId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const GoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(['exam', 'fitness', 'deadline', 'habit', 'custom']),
  intensity: z.enum(['light', 'moderate', 'high']),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  progress: z.number().min(0).max(100),
});

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.enum(['now', 'next', 'this_week', 'later']),
  score: z.number(),
  dueDate: z.string(),
  estimatedMinutes: z.number(),
  isCompleted: z.boolean(),
});

export const HabitSchema = z.object({
  id: z.string(),
  title: z.string(),
  frequency: z.string(),
  streak: z.number(),
  skips: z.number(),
  recommendedAdjustment: z.string().optional(),
});

export const JournalEntrySchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string(),
  mood: z.string(),
  completedTasksCount: z.number(),
  habitsCompletedCount: z.number(),
  isDraft: z.boolean(),
});
