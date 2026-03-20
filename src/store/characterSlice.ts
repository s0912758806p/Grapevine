import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ── Level definitions ─────────────────────────────────────
export const LEVELS = [
  { level: 1, title: "Seedling",       minXp: 0    },
  { level: 2, title: "Sprouting Vine", minXp: 50   },
  { level: 3, title: "Branch",         minXp: 150  },
  { level: 4, title: "Canopy",         minXp: 350  },
  { level: 5, title: "Elder Grapevine",minXp: 700  },
  { level: 6, title: "Vintner",        minXp: 1200 },
  { level: 7, title: "Grand Vintner",  minXp: 2000 },
];

// ── Badge definitions ─────────────────────────────────────
export type BadgeId =
  | "first_post"
  | "weekly_reader"
  | "rumor_mill"
  | "curator"
  | "voice_of_vine";

export const BADGES: Record<BadgeId, { label: string; icon: string; description: string }> = {
  first_post:     { label: "First Post",         icon: "✍️",  description: "Posted your first issue" },
  weekly_reader:  { label: "Weekly Reader",       icon: "📅",  description: "7-day visit streak" },
  rumor_mill:     { label: "Rumor Mill",          icon: "🗣️",  description: "Cast 20 rumor votes" },
  curator:        { label: "Curator",             icon: "📚",  description: "Read 50 articles" },
  voice_of_vine:  { label: "Voice of the Vine",   icon: "🌿",  description: "Posted 10 rumors" },
};

// ── XP event types ────────────────────────────────────────
export type XPEvent =
  | "view_article"    // +2
  | "post_issue"      // +25
  | "post_rumor"      // +10
  | "vote_rumor"      // +1
  | "daily_visit";    // +5

export const XP_REWARDS: Record<XPEvent, number> = {
  view_article: 2,
  post_issue:   25,
  post_rumor:   10,
  vote_rumor:   1,
  daily_visit:  5,
};

// ── State ─────────────────────────────────────────────────
export interface CharacterState {
  xp: number;
  level: number;
  levelTitle: string;
  badges: BadgeId[];
  streak: number;
  lastVisit: string | null;   // ISO date string
  totalArticlesRead: number;
  totalRumorsPosted: number;
  totalVotesCast: number;
  totalIssuesPosted: number;
}

const STORAGE_KEY = "grapevine_character";

function getLevelForXp(xp: number): { level: number; title: string } {
  let result = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) result = l;
  }
  return { level: result.level, title: result.title };
}

function loadFromStorage(): CharacterState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    xp: 0,
    level: 1,
    levelTitle: "Seedling",
    badges: [],
    streak: 0,
    lastVisit: null,
    totalArticlesRead: 0,
    totalRumorsPosted: 0,
    totalVotesCast: 0,
    totalIssuesPosted: 0,
  };
}

function saveToStorage(state: CharacterState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function checkBadges(state: CharacterState): BadgeId[] {
  const earned: BadgeId[] = [...state.badges];

  const earn = (id: BadgeId) => {
    if (!earned.includes(id)) earned.push(id);
  };

  if (state.totalIssuesPosted >= 1) earn("first_post");
  if (state.streak >= 7)            earn("weekly_reader");
  if (state.totalVotesCast >= 20)   earn("rumor_mill");
  if (state.totalArticlesRead >= 50) earn("curator");
  if (state.totalRumorsPosted >= 10) earn("voice_of_vine");

  return earned;
}

const initialState: CharacterState = loadFromStorage();

// ── Slice ─────────────────────────────────────────────────
const characterSlice = createSlice({
  name: "character",
  initialState,
  reducers: {
    gainXP(state, action: PayloadAction<XPEvent>) {
      const amount = XP_REWARDS[action.payload];
      state.xp += amount;

      // Track counters
      if (action.payload === "view_article")  state.totalArticlesRead++;
      if (action.payload === "post_issue")    state.totalIssuesPosted++;
      if (action.payload === "post_rumor")    state.totalRumorsPosted++;
      if (action.payload === "vote_rumor")    state.totalVotesCast++;

      // Level up
      const { level, title } = getLevelForXp(state.xp);
      state.level = level;
      state.levelTitle = title;

      // Badges
      state.badges = checkBadges(state);

      saveToStorage({ ...state });
    },

    recordDailyVisit(state) {
      const today = new Date().toISOString().slice(0, 10);
      if (state.lastVisit === today) return; // already visited today

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      state.streak = state.lastVisit === yesterday ? state.streak + 1 : 1;
      state.lastVisit = today;

      // Grant daily visit XP
      state.xp += XP_REWARDS.daily_visit;
      const { level, title } = getLevelForXp(state.xp);
      state.level = level;
      state.levelTitle = title;
      state.badges = checkBadges(state);

      saveToStorage({ ...state });
    },

    resetCharacter(state) {
      const fresh: CharacterState = {
        xp: 0,
        level: 1,
        levelTitle: "Seedling",
        badges: [],
        streak: 0,
        lastVisit: null,
        totalArticlesRead: 0,
        totalRumorsPosted: 0,
        totalVotesCast: 0,
        totalIssuesPosted: 0,
      };
      Object.assign(state, fresh);
      saveToStorage(fresh);
    },
  },
});

export const { gainXP, recordDailyVisit, resetCharacter } = characterSlice.actions;
export default characterSlice.reducer;
