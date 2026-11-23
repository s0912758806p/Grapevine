/**
 * Forum domain model. Every data source (GitHub Discussions, mirrored issue
 * trackers, local fixtures) is mapped into these shapes by an adapter in
 * src/lib/forum/ before it reaches a page or component.
 */

export interface Member {
  login: string;
  /** Display name; falls back to login. */
  name: string;
  avatarUrl?: string;
  bio?: string;
}

export interface ReactionCount {
  kind: "up" | "helpful" | "thanks";
  count: number;
}

export interface PollOption {
  id?: string;
  label: string;
  votes: number;
}

export interface Reply {
  /** GitHub node id (or a stable fixture id). */
  id: string;
  author: Member;
  /** Markdown source. */
  body: string;
  createdAt: string;
  ups: number;
  isAnswer?: boolean;
  replies?: Reply[];
}

export interface Thread {
  /** Discussion number (or mirrored issue number for mirror boards). */
  number: number;
  /** GitHub node id, needed for writes (replies, reactions). Absent for fixtures. */
  id?: string;
  /** Page link; defaults to /t/[number]. Mirrored issues use /c/[board]/[number]. */
  href?: string;
  /** Mirrored from an external repo: read-only here, discussed on GitHub. */
  external?: boolean;
  board: string;
  title: string;
  /** Plain-text summary used on cards and in meta descriptions. */
  excerpt: string;
  /** Markdown source. */
  body: string;
  author: Member;
  anonymous?: boolean;
  createdAt: string;
  lastActivityAt: string;
  tags: string[];
  replyCount: number;
  reactions: ReactionCount[];
  solved?: boolean;
  featured?: boolean;
  pinned?: boolean;
  poll?: PollOption[];
  pollQuestion?: string;
  /** Link to the original discussion or issue on GitHub. */
  url?: string;
  /** Job boards only. */
  job?: {
    company: string;
    place: "tpe" | "hsc" | "txg" | "remote" | "other";
    placeLabel: string;
    type: "full" | "part" | "contract";
    pay: string;
  };
  /** Meetup board only. */
  meetup?: { city: string; when: string; venue: string; going: number; lat: number; lng: number };
  /** Rumor board only: credibility votes. */
  credibility?: { believe: number; doubt: number };
}

export interface ThreadDetail extends Thread {
  answer?: Reply;
  replies: Reply[];
  participants: Member[];
  related: Pick<Thread, "number" | "board" | "title" | "replyCount" | "solved">[];
}

export type SortKey = "hot" | "new" | "top" | "open";

export interface ThreadQuery {
  board?: string;
  sort?: SortKey;
  /** Free-text search over title, excerpt and tags. */
  q?: string;
  tag?: string;
  author?: string;
  limit?: number;
}

export interface LeaderboardEntry {
  member: Member;
  replies: number;
  xp: number;
}

export interface MemberProfile {
  member: Member;
  joinedAt: string;
  stats: { threads: number; replies: number; accepted: number; upsReceived: number; meetups: number; weeklyStreak: number };
  /** Daily activity counts for the last 182 days, oldest first. */
  activity: number[];
  threads: Thread[];
}

export interface ForumStats {
  threadsThisWeek: number;
  repliesThisWeek: number;
  medianFirstReplyHours: number;
  qaSolvedRate: number;
  /** New threads per day for the last 14 days, oldest first. */
  daily: number[];
  /** Replies this week per board slug. */
  repliesByBoard: { board: string; count: number }[];
}

export interface CreateThreadInput {
  board: string;
  title: string;
  body: string;
  tags: string[];
  poll?: string[];
}

export interface ForumAdapter {
  /** Human-readable source label, shown in the footer. */
  readonly source: "github" | "fixtures";
  /** Repository that hosts the Discussions (github source only). */
  readonly repoUrl?: string;
  listThreads(query: ThreadQuery): Promise<Thread[]>;
  getThread(number: number): Promise<ThreadDetail | null>;
  /** A read-only item from a mirrored board (週刊共讀, 職缺). */
  getMirrorThread(board: string, number: number): Promise<Thread | null>;
  /** Which boards can accept new threads (their Discussions category exists). */
  boardStatus(): Promise<Record<string, boolean>>;
  getProfile(login: string): Promise<MemberProfile | null>;
  leaderboard(): Promise<LeaderboardEntry[]>;
  hotTags(): Promise<string[]>;
  stats(): Promise<ForumStats>;
}
