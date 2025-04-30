import { IssueType } from "../types";

interface ViewRecord {
  id: number;
  issueNumber: number;
  title: string;
  timestamp: number;
  readingTime: number; // in seconds
  source: string;
}

interface AnalyticsData {
  viewHistory: ViewRecord[];
  mostViewed: Record<number, number>; // issueNumber: viewCount
  readingTimeTotal: number; // in seconds
  lastActive: number; // timestamp
  tagsInteracted: Record<string, number>; // tagName: interactionCount
  searchQueries: string[];
}

const STORAGE_KEY = "grapevine_analytics";

const getDefaultAnalyticsData = (): AnalyticsData => ({
  viewHistory: [],
  mostViewed: {},
  readingTimeTotal: 0,
  lastActive: Date.now(),
  tagsInteracted: {},
  searchQueries: [],
});

// Load analytics data from localStorage
const loadAnalyticsData = (): AnalyticsData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load analytics data:", error);
  }
  return getDefaultAnalyticsData();
};

// Save analytics data to localStorage
const saveAnalyticsData = (data: AnalyticsData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save analytics data:", error);
  }
};

// Record a view of an issue
export const recordView = (issue: IssueType): void => {
  const data = loadAnalyticsData();

  // Calculate approximate reading time (5 words per second)
  const wordCount = issue.body ? issue.body.split(/\s+/).length : 0;
  const readingTime = Math.max(10, Math.round(wordCount / 5)); // At least 10 seconds

  // Add to view history
  const viewRecord: ViewRecord = {
    id: issue.id,
    issueNumber: issue.number,
    title: issue.title,
    timestamp: Date.now(),
    readingTime,
    source: issue.source || "unknown",
  };

  data.viewHistory.unshift(viewRecord);
  // Keep only the last 100 views
  data.viewHistory = data.viewHistory.slice(0, 100);

  // Update most viewed counter
  data.mostViewed[issue.number] = (data.mostViewed[issue.number] || 0) + 1;

  // Update reading time
  data.readingTimeTotal += readingTime;

  // Update last active
  data.lastActive = Date.now();

  // Record tag interactions
  if (issue.labels && issue.labels.length > 0) {
    issue.labels.forEach((label) => {
      data.tagsInteracted[label.name] =
        (data.tagsInteracted[label.name] || 0) + 1;
    });
  }

  saveAnalyticsData(data);
};

// Record a search query
export const recordSearch = (query: string): void => {
  if (!query.trim()) return;

  const data = loadAnalyticsData();

  // Add to search queries
  data.searchQueries.unshift(query);
  // Keep only the last 20 searches
  data.searchQueries = data.searchQueries.slice(0, 20);

  // Update last active
  data.lastActive = Date.now();

  saveAnalyticsData(data);
};

// Get view history
export const getViewHistory = (): ViewRecord[] => {
  const data = loadAnalyticsData();
  return data.viewHistory;
};

// Get most viewed issues
export const getMostViewed = (): Record<number, number> => {
  const data = loadAnalyticsData();
  return data.mostViewed;
};

// Get top N most viewed issues
export const getTopViewed = (
  n: number = 5
): { issueNumber: number; viewCount: number }[] => {
  const data = loadAnalyticsData();
  return Object.entries(data.mostViewed)
    .map(([issueNumber, viewCount]) => ({
      issueNumber: parseInt(issueNumber, 10),
      viewCount,
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, n);
};

// Get total reading time in seconds
export const getReadingTimeTotal = (): number => {
  const data = loadAnalyticsData();
  return data.readingTimeTotal;
};

// Get formatted reading time as string (e.g., "2h 15m")
export const getFormattedReadingTime = (): string => {
  const totalSeconds = getReadingTimeTotal();
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Get most interacted tags
export const getMostInteractedTags = (
  n: number = 10
): { tag: string; count: number }[] => {
  const data = loadAnalyticsData();
  return Object.entries(data.tagsInteracted)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
};

// Get recent search queries
export const getRecentSearches = (): string[] => {
  const data = loadAnalyticsData();
  return data.searchQueries;
};

// Clear all analytics data
export const clearAnalyticsData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Get days since first view
export const getDaysSinceFirstView = (): number => {
  const data = loadAnalyticsData();
  if (data.viewHistory.length === 0) return 0;

  const oldestView = [...data.viewHistory].sort(
    (a, b) => a.timestamp - b.timestamp
  )[0];
  const daysDiff = (Date.now() - oldestView.timestamp) / (1000 * 60 * 60 * 24);
  return Math.floor(daysDiff);
};

// Get activity by day of week (0 = Sunday, 6 = Saturday)
export const getActivityByDayOfWeek = (): number[] => {
  const data = loadAnalyticsData();
  const activityByDay = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday

  data.viewHistory.forEach((view) => {
    const day = new Date(view.timestamp).getDay();
    activityByDay[day]++;
  });

  return activityByDay;
};

// Get view counts by source
export const getViewsBySource = (): Record<string, number> => {
  const data = loadAnalyticsData();
  const sourceViews: Record<string, number> = {};

  data.viewHistory.forEach((view) => {
    sourceViews[view.source] = (sourceViews[view.source] || 0) + 1;
  });

  return sourceViews;
};
