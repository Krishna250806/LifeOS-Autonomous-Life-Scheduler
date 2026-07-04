import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, format, parseISO } from 'date-fns';

// ----------------------------------------------------
// Data Interfaces
// ----------------------------------------------------

export interface ScheduleBlock {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  duration: number;  // in minutes
  type: 'fixed' | 'flexible' | 'sleep' | 'buffer' | 'routine';
  category: 'work' | 'health' | 'education' | 'leisure' | 'essential';
  isCompleted: boolean;
  isSkipped: boolean;
  rationale?: string;
  goalId?: string;
  habitId?: string;
  taskId?: string;
  date?: string; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  title: string;
  category: 'exam' | 'fitness' | 'deadline' | 'habit' | 'custom';
  intensity: 'light' | 'moderate' | 'high';
  targetDate: string; // YYYY-MM-DD
  progress: number; // 0-100
  startDate?: string; // YYYY-MM-DD
  dailyFocusTime?: string; // HH:MM
  planSkeleton?: { dayNumber: number; date: string; taskTitle: string; details: string }[];
}

export interface Task {
  id: string;
  title: string;
  priority: 'now' | 'next' | 'this_week' | 'later';
  score: number;
  dueDate: string;
  estimatedMinutes: number;
  isCompleted: boolean;
}

export interface Memory {
  id: string;
  content: string;
  timestamp: string;
  category: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: string;
  streak: number;
  skips: number;
  recommendedAdjustment?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood: string;
  completedTasksCount: number;
  habitsCompletedCount: number;
  isDraft: boolean;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  diff?: {
    added: Partial<ScheduleBlock>[];
    deferred: Partial<ScheduleBlock>[];
  };
}

export interface LifeOSState {
  // Theme
  theme: 'paper' | 'graphite';
  setTheme: (theme: 'paper' | 'graphite') => void;

  // Data Lists
  blocks: ScheduleBlock[];
  goals: Goal[];
  tasks: Task[];
  memories: Memory[];
  habits: Habit[];
  journals: JournalEntry[];
  messages: Message[];
  
  // App States
  lifeState: {
    upcomingHighStakesDeadline?: string;
    focusStreaks: number;
    xp: number;
    level: number;
  };
  
  // Focus Mode
  focusMode: {
    isActive: boolean;
    timeLeft: number; // in seconds
    duration: number; // in seconds (default 25 mins)
    spotifyTrack?: { title: string; artist: string; isPlaying: boolean };
  };
  
  // Proposed re-plan diff (for confirmation steps)
  proposedDiff: {
    goal?: Goal;
    addedBlocks: ScheduleBlock[];
    deferredBlocks: ScheduleBlock[];
    originMessage?: string;
  } | null;

  selectedDate: string;

  // Actions
  setSelectedDate: (date: string) => void;
  setProposedDiff: (diff: LifeOSState['proposedDiff']) => void;
  commitProposedDiff: () => void;
  discardProposedDiff: () => void;
  
  addGoal: (goal: Omit<Goal, 'id' | 'progress'>, useAiPlanning?: boolean) => void;
  deleteGoal: (id: string) => void;
  generateAiPlanForGoal: (goalId: string) => void;
  
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'skips'>) => void;
  deleteHabit: (id: string) => void;
  completeHabitToday: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'isCompleted' | 'score'>, scheduledTime?: string) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  completeBlock: (id: string) => void;
  skipBlock: (id: string) => void;
  updateBlockTime: (id: string, startTime: string, endTime: string) => void;
  toggleFocusMode: () => void;
  tickFocusTimer: () => void;
  triggerOverwhelm: () => void;
  seedDefaultBlocksIfEmpty: () => void;
  
  // Intent Intake Parser & Chat API
  submitNaturalLanguageIntent: (text: string) => void;
  clearChat: () => void;
  syncMessagesWithSession: () => void;
  
  // Memory
  addMemory: (content: string, category: string) => void;
  
  // Journal
  saveJournalDraft: (id: string, content: string) => void;
  publishJournal: (id: string) => void;
  generateNightlyJournal: () => void;
}

// ----------------------------------------------------
// Mock Data Generation
// ----------------------------------------------------

const initialBlocks: ScheduleBlock[] = [];

const initialGoals: Goal[] = [];

const initialTasks: Task[] = [];

const initialHabits: Habit[] = [];

const initialMemories: Memory[] = [];

const initialMessages: Message[] = [
  { id: 'msg1', sender: 'assistant', content: 'Welcome to LifeOS. I am your autonomous scheduler. Your timeline is currently empty. Tell me about your goals, how you feel, or changes to your plans in natural language to initialize your daily plan.', timestamp: new Date().toISOString() }
];

// Helper to check overlaps in time strings
const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Helper for session storage messages
const saveMessagesToSession = (msgs: Message[]) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('lifeos_chat', JSON.stringify(msgs));
  }
};

const createDefaultBlocksForDate = (dateStr: string): ScheduleBlock[] => [
  {
    id: `b_sleep_morning_${dateStr}`,
    title: 'Sleep & Night Recovery',
    startTime: '00:00',
    endTime: '08:00',
    duration: 480,
    type: 'sleep',
    category: 'essential',
    isCompleted: false,
    isSkipped: false,
    date: dateStr
  },
  {
    id: `b_routine_morning_${dateStr}`,
    title: 'Morning Routine & Coffee',
    startTime: '08:00',
    endTime: '08:30',
    duration: 30,
    type: 'routine',
    category: 'essential',
    isCompleted: false,
    isSkipped: false,
    date: dateStr
  },
  {
    id: `b_breakfast_${dateStr}`,
    title: 'Breakfast & Plan Review',
    startTime: '08:30',
    endTime: '09:00',
    duration: 30,
    type: 'routine',
    category: 'essential',
    isCompleted: false,
    isSkipped: false,
    date: dateStr
  },
  {
    id: `b_break_morning_${dateStr}`,
    title: 'Mid-Morning Decompression Break',
    startTime: '11:00',
    endTime: '11:30',
    duration: 30,
    type: 'buffer',
    category: 'health',
    isCompleted: false,
    isSkipped: false,
    date: dateStr
  },
  {
    id: `b_lunch_${dateStr}`,
    title: 'Lunch Break & Walk',
    startTime: '12:30',
    endTime: '13:30',
    duration: 60,
    type: 'buffer',
    category: 'health',
    isCompleted: false,
    isSkipped: false,
    date: dateStr
  },
  {
    id: `b_break_afternoon_${dateStr}`,
    title: 'Mid-Afternoon Restoration Break',
    startTime: '15:30',
    endTime: '16:00',
    duration: 30,
    type: 'buffer',
    category: 'health',
    isCompleted: false,
    isSkipped: false,
    date: dateStr
  },
  {
    id: `b_dinner_${dateStr}`,
    title: 'Dinner & Decompress',
    startTime: '19:30',
    endTime: '20:30',
    duration: 60,
    type: 'routine',
    category: 'essential',
    isCompleted: false,
    isSkipped: false,
    date: dateStr
  },
  {
    id: `b_sleep_night_${dateStr}`,
    title: 'Night Sleep Preparation',
    startTime: '22:00',
    endTime: '00:00',
    duration: 120,
    type: 'sleep',
    category: 'essential',
    isCompleted: false,
    isSkipped: false,
    date: dateStr
  }
];

const generatePlanDetails = (title: string, category: string, days: number, startDate: Date) => {
  const plan = [];
  const query = title.toLowerCase();
  
  const isCoding = query.includes('code') || query.includes('web') || query.includes('dev') || query.includes('react') || query.includes('js') || query.includes('html') || query.includes('css') || query.includes('programming');
  const isFitness = category === 'fitness' || query.includes('fit') || query.includes('run') || query.includes('gym') || query.includes('marathon') || query.includes('workout') || query.includes('exercise');
  const isLanguage = query.includes('french') || query.includes('spanish') || query.includes('german') || query.includes('japanese') || query.includes('language') || query.includes('speak');

  const codingTopics = [
    { title: "HTML5 Semantics & DOM Structure", details: "Study HTML5 page outline layouts, structural tags, and DOM tree configurations." },
    { title: "CSS Box Model & Basic Styling", details: "Practice CSS margins, paddings, borders, select rules, and text formatting." },
    { title: "Flexbox Grids & Alignment Rules", details: "Build grid interfaces using Flexbox flex-direction, justify-content, and align-items." },
    { title: "CSS Grid Layouts & Template Areas", details: "Design two-dimensional layouts using grid-template-columns and grid-area coordinates." },
    { title: "Media Queries & Responsive Styling", details: "Implement mobile-first viewport design guidelines and viewport break points." },
    { title: "JavaScript Variables & Data Types", details: "Study JS primitive types, variables scoping, objects, arrays, and type checking." },
    { title: "JS Functions, Scopes & Closures", details: "Write standard arrow functions, callback flows, and scopes closures." },
    { title: "JS DOM Manipulation & Listeners", details: "Practice selecting DOM elements, modifying class lists, and adding event click listeners." },
    { title: "Asynchronous JS: Promises & Async/Await", details: "Study asynchronous flow pipelines, resolve/reject promises, and fetch API queries." },
    { title: "Modern JS: ES6 Modules & Destructuring", details: "Practice array/object destructuring, imports, exports, and spread operators." },
    { title: "Introduction to React & JSX Syntax", details: "Configure a basic React project, draft JSX tags, and understand rendering mechanisms." },
    { title: "React Components: Props & Nesting", details: "Build functional components, pass props variables, and organize view components." },
    { title: "React State Management: useState Hook", details: "Manage internal component states, event changes, and conditional layout rendering." },
    { title: "React Side Effects: useEffect Hook", details: "Implement side effect data fetch logs, event listener cleanups, and load triggers." },
    { title: "Custom React Hooks & Reuse Logic", details: "Extract stateful component logic into reusable custom React hook functions." },
    { title: "Next.js App Router Architecture", details: "Learn folder-based routing, layout configurations, page files, and metadata setup." },
    { title: "Client vs Server React Components", details: "Understand server component rendering advantages and client-side hook interactions." },
    { title: "Styling React: Tailwind CSS Tokens", details: "Implement utility-first styling classes, hover triggers, and theme setups." },
    { title: "Interactive UI Forms in React", details: "Create controlled form input fields, validate forms state, and submit handlers." },
    { title: "Global State: React Context API", details: "Avoid prop drilling by configuring state providers, consumer contexts, and values." },
    { title: "Global State: Zustand Store Setup", details: "Define state variables, store action triggers, and select variables reactively." },
    { title: "Backend: Node.js & Express Basics", details: "Spin up a local server, configure route handlers, and send JSON payloads." },
    { title: "Designing Rest APIs & HTTP Verbs", details: "Design CRUD routes (GET, POST, PUT, DELETE) and handle query params/request body." },
    { title: "Databases: Postgres SQL Foundations", details: "Install Postgres database locally, write SELECT/INSERT scripts, and set tables." },
    { title: "ORM: Prisma Schemas & Migrations", details: "Define database models in schema file, run migrations, and inspect client queries." },
    { title: "Connecting Frontend to API Server", details: "Setup CORS headers, fetch endpoints, and manage loading/error state displays." },
    { title: "API Security: JWT Authorization", details: "Protect backend routes, sign JWT tokens on login, and verify authorization headers." },
    { title: "Writing Unit Tests with Jest & React Library", details: "Draft component tests, mock fetch API queries, and verify assertion checks." },
    { title: "Production Build: Bundlers & Next Build", details: "Check bundle sizes, optimize lazy loads, and run Next.js compilation audit." },
    { title: "Full Stack Deployment: Vercel & Railway", details: "Configure environment variables, connect git branches, and deploy build live." }
  ];

  const fitnessTopics = [
    { title: "Conditioning Baseline Assessment", details: "Jog 15 mins at low heart rate zone to establish baseline recovery metrics." },
    { title: "Core Stability: Plank Form Drill", details: "Practice forearm planks, side planks, and bird-dogs to stabilize pelvic alignment." },
    { title: "Lower Body Squat Progression", details: "Practice bodyweight squat sets focusing on knees tracking and core tightening." },
    { title: "Aerobic Conditioning: Zone 2 Run", details: "Sustain steady running pace for 30 minutes keeping heart rate in conversational zone." },
    { title: "Upper Body Strength: Push-Up Progression", details: "Execute clean push-ups or incline variations focusing on shoulder alignment." },
    { title: "Full Body Flexibility & Mobility", details: "Stretch hip flexors, hamstrings, and thoracic spine coordinates." },
    { title: "Active Decompression & Fast Walk", details: "Go for a brisk 45-minute recovery walk; check hydration levels." },
    { title: "Interval Training: Speed Drills", details: "Perform 5 sets of 400m fast paces with 90 seconds active walk recovery blocks." },
    { title: "Lower Body Strength: Lunge Metrics", details: "Perform walking lunges and step-up exercises to balance single-leg stability." },
    { title: "Core Focus: Deadbugs & Russian Twists", details: "Strengthen obliques and deep transverse abdominis using slow motion." },
    { title: "Upper Body: Pull-Up Hangs & Rows", details: "Practice active shoulder packing hangs and dumbbell rows for back posture." },
    { title: "Thoracic Spine & Hip Opening Yoga", details: "Run through dynamic yoga vinyasas focusing on stretching tight joints." },
    { title: "Aerobic Endurance: 45 Min Run", details: "Increase conversational running time to 45 mins at steady heart beats." },
    { title: "Plyometric Basics: Box Step-Ups", details: "Practice explosive step power and soft landings to protect joint spaces." },
    { title: "Active Restoration Rest Day", details: "Relax, execute deep diaphragmatic breathing drills, and review weekly sleep logs." },
    { title: "Tempo Run: Sustain Threshold Pace", details: "Maintain challenging lactate-threshold pace for 20 mins; focus on posture." },
    { title: "Posterior Chain: Glute Bridges", details: "Activate glutes and hamstrings using single-leg bridges and hip thrusts." },
    { title: "Shoulder Stability & Scapular Drills", details: "Strengthen rotator cuff muscles and scapular retractors using light bands." },
    { title: "Aerobic Recovery: Cycle or Swim", details: "Execute 40 mins low impact cross-training to wash out lactic assets." },
    { title: "HIIT Conditioning Circuit", details: "Complete 4 rounds of jump-squats, push-ups, and mountain climbers." },
    { title: "Endurance Progression: 60 Min Run", details: "Push steady zone 2 conditioning to a full hour; track electrolyte usage." },
    { title: "Soft Tissue Recovery: Foam Rolling", details: "Release tension in calves, IT bands, and quads using slow roll pressures." },
    { title: "Interval Running: Hill Repeat Paces", details: "Run 6 uphill sprint intervals focusing on drive mechanics and breathing." },
    { title: "Upper Body Strength: Overhead Press", details: "Sustain clean posture while pressing dumbbells overhead to check core control." },
    { title: "Core Intensity: Leg Raises & Planks", details: "Perform hanging knee raises and extended planks to challenge stability." },
    { title: "Full Body Stretching & Hydration Review", details: "Practice long static stretches (30s holds) and check electrolyte status." },
    { title: "Aerobic Endurance: 75 Min Run", details: "Sustain conversational pace for 75 mins; focus on smooth stride mechanics." },
    { title: "HIIT: Kettlebell & Bodyweight Complexes", details: "Complete high heart rate complexes (swings, clean & press, burpees)." },
    { title: "Tapering Baseline: 20 Min Easy Jog", details: "Begin tapering down volume; maintain dynamic mobility warm-ups." },
    { title: "Fitness Target Horizon Evaluation", details: "Complete test run or physical circuit benchmark; check final recovery rates." }
  ];

  const studyTopics = [
    { title: "Syllabus Breakdown & Outline Mapping", details: "Deconstruct study curriculum, draft timeline chapters, and gather textbook/course assets." },
    { title: "Chapter 1: Primary Terminology Definitions", details: "Define foundational vocabulary terms and compile main concept index cards." },
    { title: "Chapter 1: Theoretical Models Analysis", details: "Analyze the core paradigms and theoretical frameworks underlying Chapter 1." },
    { title: "Chapter 1: Practical Applications & Quiz", details: "Solve simple scenario problems and test term retention with a quick self-quiz." },
    { title: "Chapter 2: Formulas & Mathematical Proofs", details: "Write down core mathematical equations, derivation coordinates, and assumptions." },
    { title: "Chapter 2: Step-by-Step Problem Set Drills", details: "Solve 10 textbook problem sets focusing on formula applications and mechanics." },
    { title: "Consolidation Mind-Map & Review Day", details: "Link Chapter 1 & 2 concepts visually using a detailed whiteboard mind-map." },
    { title: "Chapter 3: System Implementations & Cases", details: "Study practical case studies illustrating Chapter 3 guidelines in action." },
    { title: "Chapter 3: Edge Cases & Constraint Analysis", details: "Investigate scenario limitations, exception handling, and model boundaries." },
    { title: "Chapter 4: Chronological Timelines & Figures", details: "Map historical milestones, core authors, and comparative contributions." },
    { title: "Chapter 4: Arguments Contrast Analysis", details: "Analyze opposing schools of thought and draft summarizing bullet points." },
    { title: "Self-Assessment: Midterm Mock Simulation", details: "Sit for a timed 60-minute mock exam covering Chapters 1 through 4." },
    { title: "Error Deconstruction & Targeted Study", details: "Review mock exam mistakes, clarify misunderstandings, and re-read weak pages." },
    { title: "Chapter 5: Flow Diagrams & Integrations", details: "Analyze operational flow charts, process steps, and integration inputs." },
    { title: "Chapter 5: Architectural Patterns Analysis", details: "Study standard architectural layouts and compare performance trade-offs." },
    { title: "Chapter 6: Regulatory Compliance & Guidelines", details: "Read legal standards, audit requirements, and professional code of ethics." },
    { title: "Chapter 6: Practical Scenarios Assessment", details: "Resolve complex decision-making scenarios applying Chapter 6 standards." },
    { title: "Consolidation: Chapters 5 & 6 Summaries", details: "Draft concise cheat-sheets and summaries for Chapters 5 & 6." },
    { title: "Topic Presentations: Explain to a Peer", details: "Simulate teaching key concepts aloud to verify verbal subject mastery." },
    { title: "Revision Focus: Chapters 1-3 Review", details: "Run rapid flashcard drill cycles on vocabulary and formulas from early chapters." },
    { title: "Revision Focus: Chapters 4-6 Review", details: "Review late chapter summaries, key arguments, and diagram flows." },
    { title: "Self-Assessment: Full Mock Exam Run", details: "Simulate actual exam timing constraints under strict zero-resource test rules." },
    { title: "Mock Exam Errors Review & Checkups", details: "Trace root errors, consult reference materials, and rewrite formula steps." },
    { title: "Speed Drill: Formula Recall Tests", details: "Test raw memorization speeds for equations, laws, dates, and glossary terms." },
    { title: "Summary Sheets Consolidation", details: "Draft a final, high-density cheatsheet summarizing all high-priority exam facts." },
    { title: "Reviewing Edge Cases & Hardest Homeworks", details: "Re-solve the most challenging homework problems and check derivation steps." },
    { title: "Light Vocabulary Flashcard Refresher", details: "Execute low-stress visual drills to reinforce vocabulary memory triggers." },
    { title: "Stress Decompression & Mindset Alignment", details: "Optimize sleep cycle, prepare test logistics, and do breathing exercises." },
    { title: "Final Cheatsheet Walkthrough", details: "Scan final summary cheatsheets, review past mock exams, and rest." },
    { title: "Horizon Target Assessment Day", details: "Conduct final subject examination or official evaluation under mock rules." }
  ];

  const languageTopics = [
    { title: "Alphabet & Pronunciation Triggers", details: "Practice vowel sounds, accent modifications, and alphabetical letter drills." },
    { title: "Core Pronouns & Basic Verbs", details: "Learn pronouns (I, you, he/she) and high-priority verbs (to be, to have)." },
    { title: "Present Tense Conjugation Patterns", details: "Study standard regular verb conjugation endings in the present tense." },
    { title: "Common Nouns: Family & Household", details: "Memorize 30 core nouns representing family relatives and household objects." },
    { title: "Constructing Simple Sentences", details: "Practice Subject-Verb-Object sentence setups and simple statements." },
    { title: "Definite vs Indefinite Articles", details: "Study masculine/feminine article designations and singular/plural rules." },
    { title: "Numbers 1-100 & Asking for Time", details: "Count to 100, study basic digit patterns, and practice telling the time." },
    { title: "Interactive Dialogues: Basic Greetings", details: "Practice common introductory phrases, handshakes, and polite greetings." },
    { title: "Listening Drill: Simple Audio Scenarios", details: "Listen to 5 minutes of conversational podcasts and identify familiar nouns." },
    { title: "Adjective Agreement Rules", details: "Learn how adjectives adjust to match the gender and number of nouns." },
    { title: "Common Nouns: Food & Restaurant", details: "Memorize food ingredients, dining phrases, and how to order meals." },
    { title: "Expressing Preferences & Desires", details: "Learn verbs like (to want, to like) to state options and selections." },
    { title: "Prepositions of Place & Direction", details: "Study positional words (in, on, under, next to) and directional coordinates." },
    { title: "Simple Questions: Who, What, Where", details: "Practice asking questions about coordinates, locations, and identities." },
    { title: "Conversational Drill: Introduce Yourself", details: "Draft and speak aloud a 1-minute intro covering name, job, and origin." },
    { title: "Past Tense Conjugation Foundations", details: "Introduce the primary past tense structure and auxiliary verbs." },
    { title: "Common Nouns: Work & Daily Activities", details: "Learn nouns for career fields, office tools, and routine chores." },
    { title: "Reflexive Verbs & Morning Routine", details: "Conjugate verbs associated with washing, dressing, waking up, and sleeping." },
    { title: "Possessive Adjectives & Ownership", details: "Practice words like (my, your, their) to express possessive associations." },
    { title: "Listening Drill: News & Weather Reports", details: "Listen to slow news broadcasts and summarize the main events." },
    { title: "Future Tense Verb Formations", details: "Learn how to state upcoming plans using (going to / will) conjugations." },
    { title: "Common Nouns: Travel & Directions", details: "Learn vocab for train stations, flights, hotel reservations, and asking maps." },
    { title: "Expressing Emotions & Physical State", details: "Learn to describe feelings (tired, happy, cold) and body parts." },
    { title: "Negative Sentence Constructions", details: "Practice using negative markers to deny statements or express lack." },
    { title: "Writing Drill: A Short Diary Entry", details: "Draft a 100-word paragraph describing your daily schedule in the target language." },
    { title: "Conjunctions & Compound Sentences", details: "Link ideas using connectors (but, because, and, therefore) smoothly." },
    { title: "Common Nouns: Weather & Seasons", details: "Describe weather conditions, temperature scales, and seasonal metrics." },
    { title: "Imperfect Tense & Childhood Memories", details: "Learn descriptive past tense to outline ongoing situations or habits." },
    { title: "Conversational Drill: Customer Service Mock", details: "Roleplay resolving a simple issue (e.g. returning a package) verbally." },
    { title: "Horizon Target Language Evaluation", details: "Complete comprehensive listening/reading quiz and record final audio checkpoint." }
  ];

  let sourceArray = studyTopics;
  if (isCoding) sourceArray = codingTopics;
  else if (isFitness) sourceArray = fitnessTopics;
  else if (isLanguage) sourceArray = languageTopics;

  for (let i = 0; i < days; i++) {
    const sourceIndex = days <= 30
      ? Math.floor((i / days) * sourceArray.length) % sourceArray.length
      : i % sourceArray.length;

    const topic = sourceArray[sourceIndex];
    const dateStr = format(addDays(startDate, i), 'yyyy-MM-dd');

    plan.push({
      dayNumber: i + 1,
      date: dateStr,
      taskTitle: topic.title,
      details: topic.details
    });
  }
  return plan;
};

// ----------------------------------------------------
// Zustand Store Implementation
// ----------------------------------------------------

export const useStore = create<LifeOSState>()(
  persist(
    (set, get) => ({
      theme: 'paper',
      setTheme: (theme) => set({ theme }),

      // Lists
      blocks: createDefaultBlocksForDate(format(new Date(), 'yyyy-MM-dd')),
      goals: initialGoals,
      tasks: initialTasks,
      memories: initialMemories,
      habits: initialHabits,
      journals: [],
      messages: initialMessages,
      proposedDiff: null,
      selectedDate: format(new Date(), 'yyyy-MM-dd'),

      setSelectedDate: (selectedDate) => {
        set({ selectedDate });
        const existing = get().blocks.some(b => b.date === selectedDate);
        if (!existing) {
          set((state) => ({
            blocks: [...state.blocks, ...createDefaultBlocksForDate(selectedDate)].sort((a, b) => {
              const aMins = a.startTime.split(':').map(Number)[0] * 60 + a.startTime.split(':').map(Number)[1];
              const bMins = b.startTime.split(':').map(Number)[0] * 60 + b.startTime.split(':').map(Number)[1];
              return aMins - bMins;
            })
          }));
        }
      },

      lifeState: {
        upcomingHighStakesDeadline: undefined,
        focusStreaks: 0,
        xp: 0,
        level: 1,
      },

      focusMode: {
        isActive: false,
        timeLeft: 1500, // 25 minutes
        duration: 1500,
        spotifyTrack: { title: 'Deep Focus Flow', artist: 'Focus Audio', isPlaying: false }
      },

      setProposedDiff: (proposedDiff) => set({ proposedDiff }),

      commitProposedDiff: () => {
        const diff = get().proposedDiff;
        if (!diff) return;

        let updatedBlocks = [...get().blocks];
        
        // Remove deferred blocks or filter them out
        const deferredIds = new Set(diff.deferredBlocks.map(b => b.id));
        updatedBlocks = updatedBlocks.filter(b => !deferredIds.has(b.id));

        // Add new blocks (attach selectedDate if not present)
        const targetDate = get().selectedDate;
        const blocksWithDate = diff.addedBlocks.map(b => ({
          ...b,
          date: b.date || targetDate
        }));
        updatedBlocks = [...updatedBlocks, ...blocksWithDate];

        // Sort blocks by start time
        updatedBlocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        // Add Goal if it is proposed
        const updatedGoals = [...get().goals];
        if (diff.goal) {
          updatedGoals.push(diff.goal);
        }

        // Add assistant confirmation message
        const confirmMessage: Message = {
          id: `msg_conf_${Date.now()}`,
          sender: 'assistant',
          content: diff.originMessage || 'Schedule successfully updated. The daily timeline has adjusted accordingly.',
          timestamp: new Date().toISOString()
        };

        const nextMessages = [...get().messages, confirmMessage];
        saveMessagesToSession(nextMessages);

        set((state) => ({
          blocks: updatedBlocks,
          goals: updatedGoals,
          proposedDiff: null,
          messages: nextMessages,
          lifeState: {
            ...state.lifeState,
            xp: currentXp,
            level: newLevel
          }
        }));
      },

      discardProposedDiff: () => {
        const discardMessage: Message = {
          id: `msg_disc_${Date.now()}`,
          sender: 'assistant',
          content: 'Proposed scheduling changes discarded.',
          timestamp: new Date().toISOString()
        };
        const nextMessages = [...get().messages, discardMessage];
        saveMessagesToSession(nextMessages);
        set({
          proposedDiff: null,
          messages: nextMessages
        });
      },

      addGoal: (newGoal, useAiPlanning) => {
        const goalId = `g_${Date.now()}`;
        const goal: Goal = {
          ...newGoal,
          id: goalId,
          progress: 0
        };
        set((state) => ({ goals: [...state.goals, goal] }));

        if (useAiPlanning) {
          get().generateAiPlanForGoal(goalId);
        }
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter(g => g.id !== id),
          blocks: state.blocks.map(b => b.goalId === id ? { ...b, goalId: undefined } : b)
        }));
      },

      addHabit: (newHabit) => {
        const habitId = `h_${Date.now()}`;
        const habit: Habit = {
          ...newHabit,
          id: habitId,
          streak: 0,
          skips: 0
        };
        set((state) => ({ habits: [...state.habits, habit] }));
        get().seedDefaultBlocksIfEmpty();
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter(h => h.id !== id),
          blocks: state.blocks.filter(b => b.habitId !== id)
        }));
      },

      completeHabitToday: (id) => {
        const date = get().selectedDate;
        const habitBlockId = `b_habit_${id}_${date}`;
        
        const alreadyCompleted = get().blocks.some(b => b.id === habitBlockId && b.isCompleted);
        if (alreadyCompleted) return;

        set((state) => {
          const hasBlock = state.blocks.some(b => b.id === habitBlockId);
          let nextBlocks = [...state.blocks];
          
          if (hasBlock) {
            nextBlocks = nextBlocks.map(b => b.id === habitBlockId ? { ...b, isCompleted: true, isSkipped: false } : b);
          } else {
            const h = state.habits.find(x => x.id === id);
            if (h && h.startTime && h.duration) {
              const [sh, sm] = h.startTime.split(':').map(Number);
              const totalMins = sh * 60 + sm + h.duration;
              const eh = Math.floor(totalMins / 60) % 24;
              const em = totalMins % 60;
              const endTime = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
              
              nextBlocks.push({
                id: habitBlockId,
                title: `Routine: ${h.title}`,
                startTime: h.startTime,
                endTime,
                duration: h.duration,
                type: 'routine',
                category: 'essential',
                isCompleted: true,
                isSkipped: false,
                date,
                habitId: id,
                rationale: `Daily ritual: ${h.title}`
              });
              nextBlocks.sort((a, b) => {
                const aMins = a.startTime.split(':').map(Number)[0] * 60 + a.startTime.split(':').map(Number)[1];
                const bMins = b.startTime.split(':').map(Number)[0] * 60 + b.startTime.split(':').map(Number)[1];
                return aMins - bMins;
              });
            }
          }

          const updatedHabits = state.habits.map(x => x.id === id ? { ...x, streak: x.streak + 1 } : x);
          
          return {
            blocks: nextBlocks,
            habits: updatedHabits
          };
        });
      },

      generateAiPlanForGoal: (goalId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return;

        const start = goal.startDate ? parseISO(goal.startDate) : new Date();
        const target = parseISO(goal.targetDate);
        const diffTime = target.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const daysToSchedule = Math.min(Math.max(diffDays, 1), 30);
        const planSkeleton = generatePlanDetails(goal.title, goal.category, daysToSchedule, start);

        const newBlocks: ScheduleBlock[] = [];
        let category: ScheduleBlock['category'] = 'work';
        if (goal.category === 'fitness') category = 'health';
        else if (goal.category === 'exam') category = 'education';

        const focusTime = goal.dailyFocusTime || '09:00';
        const [h, m] = focusTime.split(':').map(Number);
        const duration = 120;
        const endH = Math.floor((h * 60 + m + duration) / 60) % 24;
        const endM = (h * 60 + m + duration) % 60;
        const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

        planSkeleton.forEach((dayPlan) => {
          newBlocks.push({
            id: `b_ai_plan_${goalId}_${dayPlan.dayNumber}_${Date.now()}`,
            title: `AI Prep: ${dayPlan.taskTitle}`,
            startTime: focusTime,
            endTime,
            duration,
            type: 'flexible',
            category,
            isCompleted: false,
            isSkipped: false,
            rationale: dayPlan.details,
            goalId: goal.id,
            date: dayPlan.date
          });
        });

        set((state) => ({
          goals: state.goals.map(g => g.id === goalId ? { ...g, planSkeleton } : g),
          blocks: [...state.blocks, ...newBlocks]
        }));

        const systemMsg: Message = {
          id: `msg_ai_plan_${Date.now()}`,
          sender: 'assistant',
          content: `AI Planning Agent activated for **"${goal.title}"**.\nScheduled a ${daysToSchedule}-day curriculum at ${focusTime} daily leading up to your deadline on ${goal.targetDate}.`,
          timestamp: new Date().toISOString()
        };
        const nextMessages = [...get().messages, systemMsg];
        set({ messages: nextMessages });
        saveMessagesToSession(nextMessages);
      },

      addTask: (newTask, scheduledTime) => {
        const taskId = `t_${Date.now()}`;
        const task: Task = {
          ...newTask,
          id: taskId,
          isCompleted: false,
          score: 50 + Math.floor(Math.random() * 40)
        };
        set((state) => ({ tasks: [...state.tasks, task] }));

        if (scheduledTime) {
          const [h, m] = scheduledTime.split(':').map(Number);
          const totalMins = h * 60 + m + newTask.estimatedMinutes;
          const endH = Math.floor(totalMins / 60) % 24;
          const endM = totalMins % 60;
          const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

          const categoryMap: Record<Task['priority'], ScheduleBlock['category']> = {
            now: 'work',
            next: 'work',
            this_week: 'leisure',
            later: 'essential'
          };

          const newBlock: ScheduleBlock = {
            id: `b_task_${taskId}_${Date.now()}`,
            title: `Task: ${newTask.title}`,
            startTime: scheduledTime,
            endTime,
            duration: newTask.estimatedMinutes,
            type: 'flexible',
            category: categoryMap[newTask.priority] || 'work',
            isCompleted: false,
            isSkipped: false,
            rationale: `Scheduled from Task Milestone: "${newTask.title}"`,
            taskId,
            date: newTask.dueDate
          };

          set((state) => ({
            blocks: [...state.blocks, newBlock].sort((a, b) => {
              const aMins = a.startTime.split(':').map(Number)[0] * 60 + a.startTime.split(':').map(Number)[1];
              const bMins = b.startTime.split(':').map(Number)[0] * 60 + b.startTime.split(':').map(Number)[1];
              return aMins - bMins;
            })
          }));
        }
      },

      toggleTaskComplete: (id) => {
        set((state) => {
          const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
          const task = updatedTasks.find(t => t.id === id);
          if (!task) return { tasks: updatedTasks };

          const updatedBlocks = state.blocks.map(b => {
            if (b.taskId === id) {
              return { ...b, isCompleted: task.isCompleted, isSkipped: false };
            }
            return b;
          });

          return {
            tasks: updatedTasks,
            blocks: updatedBlocks
          };
        });
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== id),
          blocks: state.blocks.filter(b => b.taskId !== id)
        }));
      },

      completeBlock: (id) => {
        const currentXp = get().lifeState.xp + 15;
        const newLevel = Math.floor(currentXp / 200) + 1;

        let updatedTasks = [...get().tasks];
        let updatedHabits = [...get().habits];
        const block = get().blocks.find(b => b.id === id);

        if (block) {
          if (block.taskId) {
            updatedTasks = updatedTasks.map(t => t.id === block.taskId ? { ...t, isCompleted: true } : t);
          }
          if (block.habitId) {
            updatedHabits = updatedHabits.map(h => h.id === block.habitId ? { ...h, streak: h.streak + 1 } : h);
          }
        }

        set((state) => ({
          blocks: state.blocks.map(b => b.id === id ? { ...b, isCompleted: true, isSkipped: false } : b),
          tasks: updatedTasks,
          habits: updatedHabits,
          lifeState: {
            ...state.lifeState,
            xp: currentXp,
            level: newLevel
          }
        }));
      },

      skipBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.map(b => b.id === id ? { ...b, isSkipped: true, isCompleted: false } : b)
        }));
      },

      updateBlockTime: (id, startTime, endTime) => {
        // Find if this is a block update
        set((state) => {
          const blocksCopy = state.blocks.map(b => {
            if (b.id === id) {
              const duration = timeToMinutes(endTime) - timeToMinutes(startTime);
              return { ...b, startTime, endTime, duration };
            }
            return b;
          });
          blocksCopy.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
          return { blocks: blocksCopy };
        });
      },

      toggleFocusMode: () => {
        set((state) => {
          const currentIsActive = state.focusMode.isActive;
          const spotify = state.focusMode.spotifyTrack;
          return {
            focusMode: {
              ...state.focusMode,
              isActive: !currentIsActive,
              timeLeft: 1500,
              spotifyTrack: spotify ? { ...spotify, isPlaying: !currentIsActive } : undefined
            }
          };
        });
      },

      tickFocusTimer: () => {
        set((state) => {
          if (state.focusMode.timeLeft <= 1) {
            // Timer expired, add XP
            const currentXp = state.lifeState.xp + 30;
            const newLevel = Math.floor(currentXp / 200) + 1;
            return {
              focusMode: { ...state.focusMode, isActive: false, timeLeft: 0 },
              lifeState: {
                ...state.lifeState,
                xp: currentXp,
                level: newLevel,
                focusStreaks: state.lifeState.focusStreaks + 1
              }
            };
          }
          return {
            focusMode: { ...state.focusMode, timeLeft: state.focusMode.timeLeft - 1 }
          };
        });
      },

      triggerOverwhelm: () => {
        // Overwhelm mode reduces schedule to absolute essentials, deferring flexible/work tasks
        const blocks = get().blocks;
        const deferredBlocks: ScheduleBlock[] = [];
        const addedBlocks: ScheduleBlock[] = [];

        blocks.forEach(b => {
          if (b.type === 'flexible' && (b.category === 'work' || b.category === 'education')) {
            deferredBlocks.push(b);
          } else {
            addedBlocks.push(b);
          }
        });

        // Insert a restorative break block
        addedBlocks.push({
          id: `b_break_${Date.now()}`,
          title: 'Unstructured Rest (AI Prescribed)',
          startTime: '15:00',
          endTime: '16:30',
          duration: 90,
          type: 'buffer',
          category: 'health',
          isCompleted: false,
          isSkipped: false,
          rationale: 'Overwhelm protocol triggered: Postponed intensive development. Scheduled walks, tea, and offline decompression.'
        });

        set({
          proposedDiff: {
            addedBlocks,
            deferredBlocks,
            originMessage: 'Overwhelm protocol initiated. Deferring low-priority projects and inserting structured decompression blocks.'
          }
        });
      },

      addMemory: (content, category) => {
        const mem: Memory = {
          id: `m_${Date.now()}`,
          content,
          timestamp: new Date().toISOString(),
          category
        };
        set((state) => ({ memories: [mem, ...state.memories] }));
      },

      saveJournalDraft: (id, content) => {
        set((state) => ({
          journals: state.journals.map(j => j.id === id ? { ...j, content } : j)
        }));
      },

      publishJournal: (id) => {
        set((state) => ({
          journals: state.journals.map(j => j.id === id ? { ...j, isDraft: false } : j)
        }));
      },

      generateNightlyJournal: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const exists = get().journals.find(j => j.date === today);
        if (exists) return;

        const completedBlocks = get().blocks.filter(b => b.isCompleted).length;
        const completedTasks = get().tasks.filter(t => t.isCompleted).length;

        const journal: JournalEntry = {
          id: `j_${Date.now()}`,
          date: today,
          content: `Reflecting on a structured day. Completed ${completedTasks} high-priority items and stayed aligned with ${completedBlocks} daily schedule blocks. The rhythm felt sustainable, particularly during the morning design sprints. Mid-afternoon energy levels were stabilized by offline walk intervals.`,
          mood: 'Balanced',
          completedTasksCount: completedTasks,
          habitsCompletedCount: 2,
          isDraft: true
        };

        set((state) => ({ journals: [journal, ...state.journals] }));
      },

      submitNaturalLanguageIntent: (text) => {
        const userMsg: Message = {
          id: `msg_u_${Date.now()}`,
          sender: 'user',
          content: text,
          timestamp: new Date().toISOString()
        };

        const userMsgs = [...get().messages, userMsg];
        set({ messages: userMsgs });
        saveMessagesToSession(userMsgs);

        // Simulate local AI Intent classification & re-planning engine
        const query = text.toLowerCase();
        
        setTimeout(() => {
          let replyText = "";
          const addedBlocks: ScheduleBlock[] = [];
          const deferredBlocks: ScheduleBlock[] = [];
          let proposedGoal: Goal | undefined;

          // RAG Search Simulation - Find matching memory items
          const matchingMemories = get().memories.filter(m => 
            query.split(' ').some(word => word.length > 3 && m.content.toLowerCase().includes(word))
          );
          
          const memoryContextString = matchingMemories.length > 0 
            ? `\n\n*(Recalling memory: "${matchingMemories[0].content}")*`
            : "";

          // 1. Explicit trigger checks (Hardcoded templates)
          if (query.includes('exam in 10 days') || query.includes('math exams in 10 days')) {
            // Exam Intake Goal Pipeline
            proposedGoal = {
              id: `g_exam_${Date.now()}`,
              title: `Prepare for Math Exam`,
              category: 'exam',
              intensity: 'high',
              targetDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
              progress: 0
            };

            replyText = `I have parsed your exam intent. Based on your target deadline in 10 days and historical study capacity, I have structured an incremental prep skeleton. This schedules focused morning study blocks and evening reviews, pushing flexible leisure blocks to later dates.${memoryContextString}`;

            const overlapBlock = get().blocks.find(b => b.id === '3');
            if (overlapBlock) {
              deferredBlocks.push(overlapBlock);
            }

            addedBlocks.push({
              id: `b_study_1_${Date.now()}`,
              title: 'Focused Exam Study: Practice Questions',
              startTime: '09:00',
              endTime: '11:00',
              duration: 120,
              type: 'flexible',
              category: 'education',
              isCompleted: false,
              isSkipped: false,
              rationale: `Intake Plan: 2h study block inserted. Pushed "${overlapBlock?.title || 'other blocks'}" to tomorrow.`,
              goalId: proposedGoal.id
            });

            addedBlocks.push({
              id: `b_study_2_${Date.now()}`,
              title: 'Evening Exam Review: Self-Assessment',
              startTime: '18:30',
              endTime: '19:30',
              duration: 60,
              type: 'flexible',
              category: 'education',
              isCompleted: false,
              isSkipped: false,
              rationale: 'Review block scheduled in evening low-energy slot.',
              goalId: proposedGoal.id
            });

          } else if (query.includes('tired') || query.includes('exhausted') || query.includes('too tired today')) {
            // Low energy adjustment
            replyText = `Understood. Detecting exhaustion. I am proposing to adjust today's schedule by deferring the intensive development blocks and scheduling restorative recovery slots.${memoryContextString}`;
            
            const intenseBlock = get().blocks.find(b => b.id === '7');
            if (intenseBlock) {
              deferredBlocks.push(intenseBlock);
            }

            addedBlocks.push({
              id: `b_rec_${Date.now()}`,
              title: 'Rest & Guided Breathing (AI Prescribed)',
              startTime: '14:30',
              endTime: '16:00',
              duration: 90,
              type: 'buffer',
              category: 'health',
              isCompleted: false,
              isSkipped: false,
              rationale: 'Substituted intense coding for guided recovery due to user fatigue report.'
            });

          } else if (query.includes('overwhelmed') || query.includes('overwhelm')) {
            // Overwhelm trigger via chat
            replyText = `Overwhelm protocol identified. I've prepared a stripped-down schedule containing only critical fixed events and added a 90-minute walk & tea break.`;
            
            get().blocks.forEach(b => {
              if (b.type === 'flexible' && (b.category === 'work' || b.category === 'education')) {
                deferredBlocks.push(b);
              }
            });

            addedBlocks.push({
              id: `b_break_chat_${Date.now()}`,
              title: 'Restorative Offline Buffer',
              startTime: '15:00',
              endTime: '16:30',
              duration: 90,
              type: 'buffer',
              category: 'health',
              isCompleted: false,
              isSkipped: false,
              rationale: 'Overwhelm protocol: inserting offline recovery time.'
            });

          // 2. Custom goal adding parser
          } else if (query.match(/(?:add|create|new)\s+goal/i) || query.match(/goal\s*:\s*/i)) {
            const goalMatch = text.match(/(?:add|create|new)\s+goal\s*(?::|to)?\s*(.+)/i) || 
                              text.match(/goal\s*:\s*(.+)/i);
            if (goalMatch) {
              let title = goalMatch[1].trim();
              
              let intensity: Goal['intensity'] = 'moderate';
              if (query.includes('high intensity') || query.includes('intensity high')) {
                intensity = 'high';
                title = title.replace(/with high intensity|intensity high/gi, '');
              } else if (query.includes('light intensity') || query.includes('intensity light') || query.includes('low intensity')) {
                intensity = 'light';
                title = title.replace(/with light intensity|intensity light|with low intensity|low intensity/gi, '');
              }

              let targetDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');
              const dateMatch = title.match(/by\s+(\d{4}-\d{2}-\d{2})/i) || title.match(/target\s+(\d{4}-\d{2}-\d{2})/i);
              if (dateMatch) {
                targetDate = dateMatch[1];
                title = title.replace(new RegExp(`by\\s+${targetDate}|target\\s+${targetDate}`, 'gi'), '');
              } else {
                const daysMatch = title.match(/in\s+(\d+)\s+days/i);
                if (daysMatch) {
                  targetDate = format(addDays(new Date(), parseInt(daysMatch[1], 10)), 'yyyy-MM-dd');
                  title = title.replace(daysMatch[0], '');
                }
              }

              title = title.replace(/\s+by\s*$/i, '').trim();
              
              let category: Goal['category'] = 'custom';
              if (query.includes('exam') || query.includes('test') || query.includes('study')) category = 'exam';
              else if (query.includes('fit') || query.includes('run') || query.includes('gym') || query.includes('health')) category = 'fitness';
              else if (query.includes('deadline') || query.includes('project') || query.includes('finish')) category = 'deadline';
              else if (query.includes('habit') || query.includes('routine')) category = 'habit';

              proposedGoal = {
                id: `g_custom_${Date.now()}`,
                title: title.charAt(0).toUpperCase() + title.slice(1),
                category,
                intensity,
                targetDate,
                progress: 0
              };

              replyText = `I have parsed your intent and generated a custom goal: **"${proposedGoal.title}"**.\n\n• **Category:** ${proposedGoal.category.toUpperCase()}\n• **Intensity:** ${proposedGoal.intensity.toUpperCase()}\n• **Deadline:** ${proposedGoal.targetDate}\n\nReview this in the Mutation Console below to commit it to your active horizons.`;
            } else {
              replyText = "Goal format unrecognized. Try: 'add goal [Goal Title] by YYYY-MM-DD'";
            }

          // 3. Custom task adding parser
          } else if (query.match(/(?:add|create|new)\s+task/i) || query.match(/task\s*:\s*/i) || query.match(/remind\s+me\s+to/i) || query.match(/todo\s*:\s*/i)) {
            const taskMatch = text.match(/(?:add|create|new)\s+task\s*(?::|to)?\s*(.+)/i) || 
                              text.match(/(?:todo|to-do)\s*:\s*(.+)/i) ||
                              text.match(/remind\s+me\s+to\s+(.+)/i);
            if (taskMatch) {
              let title = taskMatch[1].trim();

              let priority: Task['priority'] = 'next';
              if (query.includes('priority now') || query.includes('priority: now') || query.includes('high priority') || query.includes('urgent')) {
                priority = 'now';
                title = title.replace(/priority\s*(?::)?\s*now|high priority|urgent/gi, '');
              } else if (query.includes('priority next') || query.includes('priority: next') || query.includes('medium priority')) {
                priority = 'next';
                title = title.replace(/priority\s*(?::)?\s*next|medium priority/gi, '');
              } else if (query.includes('priority this week') || query.includes('this week priority') || query.includes('this_week')) {
                priority = 'this_week';
                title = title.replace(/priority\s*(?::)?\s*this week|this week priority|this_week/gi, '');
              } else if (query.includes('priority later') || query.includes('low priority')) {
                priority = 'later';
                title = title.replace(/priority\s*(?::)?\s*later|low priority/gi, '');
              }

              let estimatedMinutes = 30;
              const durationMatch = title.match(/(\d+)\s*(?:minutes|mins|min)/i);
              if (durationMatch) {
                estimatedMinutes = parseInt(durationMatch[1], 10);
                title = title.replace(durationMatch[0], '');
              } else {
                const hoursMatch = title.match(/(\d+)\s*(?:hours|hour|hrs|hr)/i);
                if (hoursMatch) {
                  estimatedMinutes = parseInt(hoursMatch[1], 10) * 60;
                  title = title.replace(hoursMatch[0], '');
                }
              }

              let dueDate = format(new Date(), 'yyyy-MM-dd');
              const dateMatch = title.match(/due\s+(\d{4}-\d{2}-\d{2})/i) || title.match(/by\s+(\d{4}-\d{2}-\d{2})/i);
              if (dateMatch) {
                dueDate = dateMatch[1];
                title = title.replace(new RegExp(`due\\s+${dueDate}|by\\s+${dueDate}`, 'gi'), '');
              } else if (query.includes('tomorrow')) {
                dueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
                title = title.replace(/tomorrow/gi, '');
              }

              title = title.trim().replace(/\s+due\s*$/i, '').trim();

              const task: Task = {
                id: `t_custom_${Date.now()}`,
                title: title.charAt(0).toUpperCase() + title.slice(1),
                priority,
                score: 50 + Math.floor(Math.random() * 40),
                dueDate,
                estimatedMinutes,
                isCompleted: false
              };

              set((state) => ({ tasks: [...state.tasks, task] }));

              replyText = `I have registered your new task: **"${task.title}"**.\n\n• **Priority:** ${task.priority.toUpperCase()}\n• **Estimate:** ${task.estimatedMinutes} mins\n• **Due Date:** ${task.dueDate}`;
            } else {
              replyText = "Task format unrecognized. Try: 'add task [Task Title] due YYYY-MM-DD'";
            }

          // 4. Custom block scheduling parser
          } else if (query.match(/(?:schedule|add\s+block|add\s+event)/i)) {
            const scheduleMatch = text.match(/(?:schedule|add\s+block|add\s+event)\s*(?::)?\s*(.+)/i);
            if (scheduleMatch) {
              let title = scheduleMatch[1].trim();
              
              const timeMatch = title.match(/(?:from\s+)?(\d{2}:\d{2})\s*(?:to|-)\s*(\d{2}:\d{2})/i);
              let startTime = '10:00';
              let endTime = '11:00';
              if (timeMatch) {
                startTime = timeMatch[1];
                endTime = timeMatch[2];
                title = title.replace(timeMatch[0], '');
              }

              let category: ScheduleBlock['category'] = 'work';
              if (query.includes('health') || query.includes('walk') || query.includes('gym') || query.includes('rest') || query.includes('sleep')) {
                category = 'health';
              } else if (query.includes('learn') || query.includes('study') || query.includes('read')) {
                category = 'education';
              } else if (query.includes('routine') || query.includes('brush') || query.includes('eat') || query.includes('lunch') || query.includes('dinner')) {
                category = 'essential';
              }

              const startMins = timeToMinutes(startTime);
              const endMins = timeToMinutes(endTime);
              const duration = endMins - startMins;

              title = title.trim();

              const newBlock: ScheduleBlock = {
                id: `b_custom_block_${Date.now()}`,
                title: title.charAt(0).toUpperCase() + title.slice(1),
                startTime,
                endTime,
                duration,
                type: 'flexible',
                category,
                isCompleted: false,
                isSkipped: false,
                rationale: 'Manually scheduled via natural language intent.'
              };

              get().blocks.forEach(b => {
                const bStart = timeToMinutes(b.startTime);
                const bEnd = timeToMinutes(b.endTime);
                if ((startMins >= bStart && startMins < bEnd) || (endMins > bStart && endMins <= bEnd) || (startMins <= bStart && endMins >= bEnd)) {
                  deferredBlocks.push(b);
                }
              });

              addedBlocks.push(newBlock);

              replyText = `I have parsed your scheduling request to add **"${newBlock.title}"** (${newBlock.startTime} - ${newBlock.endTime}).\n\nReview this in the Mutation Console below to commit it to your schedule.`;
            } else {
              replyText = "Schedule format unrecognized. Try: 'schedule [Title] from HH:MM to HH:MM'";
            }

          } else {
            // General query response
            replyText = `Stated intent: "${text}". I have logged this into your memory graph. You can say 'add goal ...' to define a goal or 'add task ...' to register a task.`;
            get().addMemory(text, 'journal');
          }

          // If scheduling mutations are proposed, show them in a diff state
          if (addedBlocks.length > 0 || deferredBlocks.length > 0 || proposedGoal) {
            set({
              proposedDiff: {
                goal: proposedGoal,
                addedBlocks,
                deferredBlocks,
                originMessage: replyText
              }
            });

            // Post a system notification to review changes
            const systemMsg: Message = {
              id: `msg_sys_${Date.now()}`,
              sender: 'assistant',
              content: 'I have generated a new schedule configuration. Review the draft mutations on the timeline above or in the assistant console.',
              timestamp: new Date().toISOString()
            };
            const nextMessages = [...get().messages, systemMsg];
            set({ messages: nextMessages });
            saveMessagesToSession(nextMessages);
          } else {
            const assistantMsg: Message = {
              id: `msg_a_${Date.now()}`,
              sender: 'assistant',
              content: replyText,
              timestamp: new Date().toISOString()
            };
            const nextMessages = [...get().messages, assistantMsg];
            set({ messages: nextMessages });
            saveMessagesToSession(nextMessages);
          }
        }, 1200);
      },

      clearChat: () => {
        const msgs = [initialMessages[0]];
        set({ messages: msgs });
        saveMessagesToSession(msgs);
      },

      syncMessagesWithSession: () => {
        if (typeof window !== 'undefined') {
          const stored = sessionStorage.getItem('lifeos_chat');
          if (stored) {
            try {
              const msgs = JSON.parse(stored);
              set({ messages: msgs });
            } catch (e) {
              console.error('Error parsing session chat:', e);
            }
          }
        }
      },

      seedDefaultBlocksIfEmpty: () => {
        const date = get().selectedDate;
        const hasSleep = get().blocks.some(b => b.date === date && b.id.startsWith('b_sleep_morning_'));
        let currentBlocks = [...get().blocks];

        if (!hasSleep) {
          const defaults = createDefaultBlocksForDate(date);
          const otherBlocks = currentBlocks.filter(b => b.date !== date || (!b.id.startsWith('b_sleep_') && !b.id.startsWith('b_routine_') && !b.id.startsWith('b_breakfast_') && !b.id.startsWith('b_lunch_') && !b.id.startsWith('b_break_') && !b.id.startsWith('b_dinner_')));
          currentBlocks = [...otherBlocks, ...defaults];
        }

        const habits = get().habits;
        let blocksAdded = false;

        habits.forEach(h => {
          if (h.startTime && h.duration) {
            const habitBlockId = `b_habit_${h.id}_${date}`;
            const hasHabitBlock = currentBlocks.some(b => b.id === habitBlockId);

            if (!hasHabitBlock) {
              const [sh, sm] = h.startTime.split(':').map(Number);
              const totalMins = sh * 60 + sm + h.duration;
              const eh = Math.floor(totalMins / 60) % 24;
              const em = totalMins % 60;
              const endTime = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;

              currentBlocks.push({
                id: habitBlockId,
                title: `Routine: ${h.title}`,
                startTime: h.startTime,
                endTime,
                duration: h.duration,
                type: 'routine',
                category: 'essential',
                isCompleted: false,
                isSkipped: false,
                date,
                habitId: h.id,
                rationale: `Daily ritual: ${h.title}`
              });
              blocksAdded = true;
            }
          }
        });

        if (!hasSleep || blocksAdded) {
          currentBlocks.sort((a, b) => {
            const aMins = a.startTime.split(':').map(Number)[0] * 60 + a.startTime.split(':').map(Number)[1];
            const bMins = b.startTime.split(':').map(Number)[0] * 60 + b.startTime.split(':').map(Number)[1];
            return aMins - bMins;
          });
          set({ blocks: currentBlocks });
        }
      }
    }),
    {
      name: 'lifeos-storage-production',
      partialize: (state) => ({
        blocks: state.blocks,
        goals: state.goals,
        tasks: state.tasks,
        memories: state.memories,
        habits: state.habits,
        journals: state.journals,
        lifeState: state.lifeState,
        theme: state.theme,
        selectedDate: state.selectedDate
      }),
    }
  )
);
