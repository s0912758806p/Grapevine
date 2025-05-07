import { IssueType } from "../types";
import {
  loadFromStorage,
  saveToStorage,
  formatTimeFromSeconds,
  getDaysSince,
} from "../utils";

interface ViewRecord {
  id: number;
  issueNumber: number;
  title: string;
  timestamp: number;
  readingTime: number; // in seconds
  source: string;
}

interface RepoActivity {
  repoId: string;
  repoOwner: string;
  repoName: string;
  created: number;
  updated: number;
  lastFetched: number;
}

interface AnalyticsData {
  viewHistory: ViewRecord[];
  mostViewed: Record<number, number>; // issueNumber: viewCount
  readingTimeTotal: number; // in seconds
  lastActive: number; // timestamp
  tagsInteracted: Record<string, number>; // tagName: interactionCount
  searchQueries: string[];
  repoActivity: Record<string, RepoActivity>; // repoId: RepoActivity
}

const STORAGE_KEY = "grapevine_analytics";

const getDefaultAnalyticsData = (): AnalyticsData => ({
  viewHistory: [],
  mostViewed: {},
  readingTimeTotal: 0,
  lastActive: Date.now(),
  tagsInteracted: {},
  searchQueries: [],
  repoActivity: {},
});

// Load analytics data from localStorage
const loadAnalyticsData = (): AnalyticsData => {
  const data = loadFromStorage<AnalyticsData>(
    STORAGE_KEY,
    getDefaultAnalyticsData()
  );

  // Ensure repoActivity exists in older data
  if (!data.repoActivity) {
    data.repoActivity = {};
  }

  return data;
};

// Save analytics data to localStorage
const saveAnalyticsData = (data: AnalyticsData): void => {
  saveToStorage(STORAGE_KEY, data);
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

  // Record repository activity if issue has repo information
  if (issue.source && issue.repoOwner && issue.repoName) {
    recordRepoActivity(issue.source, issue.repoOwner, issue.repoName, 0, 0);
  }

  saveAnalyticsData(data);
};

// Record repository issues activity
export const recordRepoActivity = (
  repoId: string,
  repoOwner: string,
  repoName: string,
  createdCount: number,
  updatedCount: number
): void => {
  const data = loadAnalyticsData();

  const now = Date.now();

  // Update or create repository activity
  if (!data.repoActivity[repoId]) {
    data.repoActivity[repoId] = {
      repoId,
      repoOwner,
      repoName,
      created: 0,
      updated: 0,
      lastFetched: now,
    };
  }

  // Update counts
  data.repoActivity[repoId].created += createdCount;
  data.repoActivity[repoId].updated += updatedCount;
  data.repoActivity[repoId].lastFetched = now;

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

// Get repository activity data
export const getRepoActivity = (): RepoActivity[] => {
  const data = loadAnalyticsData();
  return Object.values(data.repoActivity);
};

// Get total issues created across all repositories
export const getTotalIssuesCreated = (): number => {
  const data = loadAnalyticsData();
  return Object.values(data.repoActivity).reduce(
    (total, repo) => total + repo.created,
    0
  );
};

// Get total issues updated across all repositories
export const getTotalIssuesUpdated = (): number => {
  const data = loadAnalyticsData();
  return Object.values(data.repoActivity).reduce(
    (total, repo) => total + repo.updated,
    0
  );
};

// Get total repositories tracked
export const getTotalReposTracked = (): number => {
  const data = loadAnalyticsData();
  return Object.keys(data.repoActivity).length;
};

// Get most active repositories by created + updated issues
export const getMostActiveRepos = (n: number = 5): RepoActivity[] => {
  const data = loadAnalyticsData();
  return Object.values(data.repoActivity)
    .sort((a, b) => b.created + b.updated - (a.created + a.updated))
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
  return formatTimeFromSeconds(totalSeconds);
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

// Clear analytics data
export const clearAnalyticsData = (): void => {
  saveAnalyticsData(getDefaultAnalyticsData());
};

// Get days since first view
export const getDaysSinceFirstView = (): number => {
  const data = loadAnalyticsData();
  if (data.viewHistory.length === 0) {
    return 0;
  }

  // Find the earliest view
  const timestamps = data.viewHistory.map((record) => record.timestamp);
  const earliestTimestamp = Math.min(...timestamps);

  return getDaysSince(earliestTimestamp);
};

// Get activity by day of week (Sunday = 0, Saturday = 6)
export const getActivityByDayOfWeek = (): number[] => {
  const data = loadAnalyticsData();
  const activityByDay = [0, 0, 0, 0, 0, 0, 0]; // Initialize counts for each day

  data.viewHistory.forEach((record) => {
    const date = new Date(record.timestamp);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    activityByDay[dayOfWeek]++;
  });

  return activityByDay;
};

// Get views by source
export const getViewsBySource = (): Record<string, number> => {
  const data = loadAnalyticsData();
  const viewsBySource: Record<string, number> = {};

  data.viewHistory.forEach((record) => {
    const source = record.source || "unknown";
    viewsBySource[source] = (viewsBySource[source] || 0) + 1;
  });

  return viewsBySource;
};
