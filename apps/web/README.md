# LifeOS Client Workspace

A premium, state-of-the-art personal operating system, scheduling console, and habit-tracking dashboard built using **Next.js**, **Zustand**, and **Tailwind CSS**. The application adopts a highly polished, clean interface featuring dark slate sidebars, paper-grey workspaces, and emerald-green highlights.

---

## 🌟 Core Features & Modules

### 1. Chronological Schedule Timeline
* **Collision-Columns Overlap Layout:** Integrates a calendar collision-columns algorithm. When multiple tasks, goals, or routines occupy the same time slots, they automatically divide the width and align side-by-side in vertical columns instead of stacking on top of each other.
* **Click-to-Expand Cards:** Click on any timeline block to expand it. Expanded blocks adjust height dynamically (`height: auto`), disable text truncation, and display a detailed view of the task title and rationale.
* **Everyday Seeding:** Automatically seeds standard daily activities (Sleep, Morning Routine, Breakfast, Breaks, Lunch, Dinner, Night Wind-Down) on every navigated date.
* **Bi-directional Syncing:** Chronological blocks are directly linked to the checklist ledger via a unique `taskId`. Toggling completion on the timeline instantly checks off the sidebar ledger item, and vice versa.

### 2. Daily Tasks Ledger
* **Compulsory Times:** Creating a task requires a scheduled start time, ensuring it is automatically placed on the timeline.
* **Overlap Mitigation:** Padded container spacers (`pb-24`) ensure that scrolling checklist items are never hidden behind the floating AI bubble.

### 3. Goals & Plan Blueprints
* **AI Curriculum Generator:** Users can manual-input goals or toggle `"Use AI to generate prep timeline"`. The planning system generates highly customized day-by-day curriculums with actual topics and lesson names (e.g., *React Context API*, *Postgres SQL Foundations*) mapped to focus times and deadlines.
* **Expandable blueprinted roadmaps:** Goal cards expand on click to reveal a clean timeline grid of daily topics.

### 4. Habits & Routines Manager
* **Time-based Habits:** Add habits with specific start times and durations. Active habits are automatically seeded on your timeline for every calendar day.
* **Once-Per-Day Completion Lock:** The dashboard locks the completion trigger after a single click, changing the button style to `"Completed Today"` (disabled) and protecting streak values from duplicate increments.
* **Gamification Scorecard:** Computes dynamic adherence compliance scores and average active streaks.

### 5. Weekly Retrospective View
* **Dynamically Calculated Retro:** Scans active logs from the store over the past 7 days to chart productivity completion rates, deep focus hours, sleep logs, and habit completion percentages.
* **Contextual Suggestions:** The AI Generated Suggestions container analyzes computed stats to advise the user (e.g. warning of sleep debt or proposing morning focus blocks).

### 6. Floating AI Copilot Bubble
* **Summon Bubble:** Interactive bubble floating in the lower-right corner.
* **Session Persistence:** Chat records are maintained during active browser sessions but automatically wiped when the browser or page is closed.

---

## 🛠️ Technical Stack & Styling

* **Core Framework:** Next.js (App Router, Turbopack compiling).
* **State Management:** Zustand with local storage persistence (`name: 'lifeos-storage-production'`).
* **Branding & Design System:** Configuration tokens in `globals.css`:
  * Accent Colors: Emerald Green (`#04a85b` / `#05c46b`).
  * Dark Sidebar: Dark Navy-Slate (`#182c37` / `#091014`).
  * Canvas Layouts: Soft Paper-Grey (`#f3f5f8` / `#0e181e`).
* **Icons:** Lucide React.
* **Animation:** Framer Motion (spring transitions).

---

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run Development Server:**
   ```bash
   npm run dev --workspace=web
   ```
3. **Access Client Console:**
   Open [http://localhost:3001](http://localhost:3001) in your browser.
