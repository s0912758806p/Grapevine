export interface IssueType {
  id: number;
  number: number;
  title: string;
  body: string;
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
