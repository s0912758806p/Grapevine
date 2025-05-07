// Repository activity type
export interface RepoActivity {
  repoId: string;
  repoOwner: string;
  repoName: string;
  created: number;
  updated: number;
  lastFetched: number;
}

// View record type
export interface ViewRecord {
  id: number;
  issueNumber: number;
  title: string;
  timestamp: number;
  readingTime: number;
  source: string;
}

// Daily activity type
export interface DailyActivity {
  date: string;
  count: number;
}

// Enhanced daily contribution type with repository information
export interface DailyContribution {
  date: string;
  count: number;
  repos: string[];
}

// Contribution metrics type
export interface ContributionMetrics {
  totalContributions: number;
  issuesCreated: number;
  issuesUpdated: number;
  repos: number;
  avgContributionsPerRepo: number;
  mostActiveRepo?: string;
}

// Date contribution analysis result
export interface DateContribution {
  date: string;
  contributions: number;
}

// Chart data type
export interface ChartDataItem {
  category: string;
  value: number;
}
