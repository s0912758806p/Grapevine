export interface IssueType {
  id: number;
  number: number;
  title: string;
  body: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  comments: number;
  labels: {
    name: string;
    color: string;
  }[];
  state: string;
  html_url?: string;
  comments_url?: string;
  source?: string;
  repoOwner?: string;
  repoName?: string;
}

export interface RepositorySource {
  id: string;
  name: string;
  owner: string;
  repo: string;
  description?: string;
  isActive: boolean;
  category?: string;
  icon?: string;
}

export interface CategoryType {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  order?: number;
  icon?: string;
}

export interface SearchFilter {
  id?: string;
  name?: string;
  keyword?: string;
  repositories?: string[];
  labels?: string[];
  authors?: string[];
  dateRange?: [string | null, string | null] | null;
  sortBy?: 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export interface CommentType {
  id: number;
  body: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
}

export interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  reactionsEnabled: string;
  emitMetadata: string;
  inputPosition: string;
  theme: string;
  lang: string;
}
