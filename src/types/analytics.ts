// 仓库活动类型
export interface RepoActivity {
  repoId: string;
  repoOwner: string;
  repoName: string;
  created: number;
  updated: number;
  lastFetched: number;
}

// 视图记录类型
export interface ViewRecord {
  id: number;
  issueNumber: number;
  title: string;
  timestamp: number;
  readingTime: number;
  source: string;
}

// 每日活动类型
export interface DailyActivity {
  date: string;
  count: number;
}

// 增强的每日贡献类型，包含仓库信息
export interface DailyContribution {
  date: string;
  count: number;
  repos: string[];
}

// 贡献度量指标类型
export interface ContributionMetrics {
  totalContributions: number;
  issuesCreated: number;
  issuesUpdated: number;
  repos: number;
  avgContributionsPerRepo: number;
  mostActiveRepo?: string;
}

// 日期贡献分析结果
export interface DateContribution {
  date: string;
  contributions: number;
}

// 图表数据类型
export interface ChartDataItem {
  category: string;
  value: number;
}
