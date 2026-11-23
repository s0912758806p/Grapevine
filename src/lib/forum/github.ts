import "server-only";

/**
 * GitHub Discussions adapter (reads). Active when GITHUB_FORUM_REPO and
 * GITHUB_READ_TOKEN are set. All requests use the server-side read token;
 * callers wrap these in `use cache` (src/lib/forum/index.ts).
 *
 * Mapping:
 * - board ⇄ Discussions category (`discussionCategory` in src/lib/boards.ts)
 * - 推 = upvotes, 有幫助 = 🎉 HOORAY, 感謝 = ❤️ HEART
 * - 八卦牆 credibility: 👍 THUMBS_UP = 可信, 👎 THUMBS_DOWN = 存疑; authors are hidden
 * - tags and meetup details: trailing metadata comment (src/lib/forum/meta.ts)
 * - 精華 (featured): FEATURED_UPVOTES or more upvotes
 */
import { BOARDS, getBoard, type Board } from "../boards";
import type { ForumRepo } from "../config";
import { graphql, GitHubError, rest } from "../github/graphql";
import { MEETUP_CITIES, excerptOf, parseMeta } from "./meta";
import { mapIssue, type RawIssue } from "./mirror";
import { applyQuery } from "./query";
import type {
  ForumAdapter,
  ForumStats,
  LeaderboardEntry,
  Member,
  MemberProfile,
  Reply,
  Thread,
  ThreadDetail,
  ThreadQuery,
} from "./types";

export const FEATURED_UPVOTES = 5;
const ANON: Member = { login: "anonymous", name: "匿名葡萄" };
const DAY = 86_400_000;

// ── GraphQL shapes ────────────────────────────────────────
interface GqlAuthor {
  login: string;
  avatarUrl: string;
  name?: string | null;
}
interface GqlReactionGroup {
  content: string;
  reactors: { totalCount: number };
}
interface GqlDiscussion {
  id: string;
  number: number;
  title: string;
  body: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  upvoteCount: number;
  isAnswered: boolean | null;
  category: { name: string };
  author: GqlAuthor | null;
  commentCount: { totalCount: number };
  reactionGroups: GqlReactionGroup[];
  poll: { question: string; options: { nodes: { id: string; option: string; totalVoteCount: number }[] } } | null;
}
interface GqlComment {
  id: string;
  body: string;
  createdAt: string;
  upvoteCount: number;
  isAnswer: boolean;
  author: GqlAuthor | null;
}

const AUTHOR = "author { login avatarUrl ... on User { name } }";
const DISCUSSION = `
  id number title body url createdAt updatedAt upvoteCount isAnswered
  category { name }
  ${AUTHOR}
  commentCount: comments { totalCount }
  reactionGroups { content reactors { totalCount } }
  poll { question options(first: 10) { nodes { id option totalVoteCount } } }
`;
const COMMENT = `id body createdAt upvoteCount isAnswer ${AUTHOR}`;

// ── Mapping ───────────────────────────────────────────────
function member(a: GqlAuthor | null): Member {
  if (!a) return { login: "ghost", name: "ghost" };
  return { login: a.login, name: a.name || a.login, avatarUrl: a.avatarUrl };
}

const count = (groups: GqlReactionGroup[], content: string) => groups.find((g) => g.content === content)?.reactors.totalCount ?? 0;

export function boardForCategory(category: string): Board | undefined {
  return BOARDS.find((b) => b.discussionCategory.toLowerCase() === category.toLowerCase());
}

export function mapDiscussion(d: GqlDiscussion, pinned: Set<number>): Thread | null {
  const board = boardForCategory(d.category.name);
  if (!board) return null; // categories without a board (e.g. Ideas) stay on GitHub only
  const { body, meta } = parseMeta(d.body);
  const anonymous = board.kind === "anonymous";
  const city = meta.meetup?.city;
  const coords = city ? MEETUP_CITIES[city] : undefined;
  return {
    number: d.number,
    id: d.id,
    board: board.slug,
    title: d.title,
    excerpt: excerptOf(body) || d.title,
    body,
    author: anonymous ? ANON : member(d.author),
    anonymous,
    createdAt: d.createdAt,
    lastActivityAt: d.updatedAt,
    tags: meta.tags ?? [],
    replyCount: d.commentCount.totalCount,
    reactions: [
      { kind: "up", count: d.upvoteCount },
      { kind: "helpful", count: count(d.reactionGroups, "HOORAY") },
      { kind: "thanks", count: count(d.reactionGroups, "HEART") },
    ],
    solved: d.isAnswered === true,
    featured: d.upvoteCount >= FEATURED_UPVOTES,
    pinned: pinned.has(d.number),
    poll: d.poll?.options.nodes.map((o) => ({ id: o.id, label: o.option, votes: o.totalVoteCount })),
    pollQuestion: d.poll?.question,
    url: d.url,
    meetup:
      meta.meetup && coords
        ? { ...meta.meetup, going: count(d.reactionGroups, "THUMBS_UP"), lat: coords.lat, lng: coords.lng }
        : undefined,
    credibility: anonymous ? { believe: count(d.reactionGroups, "THUMBS_UP"), doubt: count(d.reactionGroups, "THUMBS_DOWN") } : undefined,
  };
}

function mapComment(c: GqlComment & { replies?: { nodes: GqlComment[] } }): Reply {
  return {
    id: c.id,
    author: member(c.author),
    body: c.body,
    createdAt: c.createdAt,
    ups: c.upvoteCount,
    isAnswer: c.isAnswer,
    replies: c.replies?.nodes.map((r) => mapComment(r)),
  };
}

// ── Adapter ───────────────────────────────────────────────
export function createGithubAdapter(repo: ForumRepo, token: string): ForumAdapter {
  const vars = { owner: repo.owner, name: repo.name };

  async function repoInfo() {
    const data = await graphql<{
      repository: {
        id: string;
        discussionCategories: { nodes: { id: string; name: string }[] };
        pinnedDiscussions: { nodes: { discussion: { number: number } }[] };
      } | null;
    }>(
      `query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) {
        id
        discussionCategories(first: 25) { nodes { id name } }
        pinnedDiscussions(first: 10) { nodes { discussion { number } } }
      } }`,
      vars,
      token,
    );
    if (!data.repository) throw new GitHubError(`Repository ${repo.owner}/${repo.name} not found or not readable`, 404);
    return {
      id: data.repository.id,
      categories: data.repository.discussionCategories.nodes,
      pinned: new Set(data.repository.pinnedDiscussions.nodes.map((n) => n.discussion.number)),
    };
  }

  async function recentDiscussions(categoryId?: string): Promise<{ list: GqlDiscussion[]; pinned: Set<number> }> {
    const info = await repoInfo();
    const data = await graphql<{ repository: { discussions: { nodes: GqlDiscussion[] } } }>(
      `query($owner: String!, $name: String!, $categoryId: ID) { repository(owner: $owner, name: $name) {
        discussions(first: 100, categoryId: $categoryId, orderBy: { field: CREATED_AT, direction: DESC }) { nodes { ${DISCUSSION} } }
      } }`,
      { ...vars, categoryId: categoryId ?? null },
      token,
    );
    return { list: data.repository.discussions.nodes, pinned: info.pinned };
  }

  async function mirrorIssues(board: Board): Promise<Thread[]> {
    if (!board.mirror) return [];
    const issues = await rest<RawIssue[]>(
      `/repos/${board.mirror.owner}/${board.mirror.repo}/issues?state=open&per_page=50&sort=created&direction=desc`,
      token,
    );
    return issues.filter((i) => !i.pull_request).map((i) => mapIssue(i, board));
  }

  async function categoryIdFor(board: Board): Promise<string | undefined> {
    const info = await repoInfo();
    return info.categories.find((c) => c.name.toLowerCase() === board.discussionCategory.toLowerCase())?.id;
  }

  const adapter: ForumAdapter = {
    source: "github",
    repoUrl: `https://github.com/${repo.owner}/${repo.name}`,

    async listThreads(query: ThreadQuery) {
      // Free-text search uses GitHub search; everything else filters the recent window.
      if (query.q) {
        const data = await graphql<{ search: { nodes: (GqlDiscussion | Record<string, never>)[] } }>(
          `query($q: String!) { search(type: DISCUSSION, query: $q, first: 30) { nodes { ... on Discussion { ${DISCUSSION} } } } }`,
          { q: `repo:${repo.owner}/${repo.name} ${query.q}` },
          token,
        );
        const info = await repoInfo();
        const found = data.search.nodes
          .filter((n): n is GqlDiscussion => "number" in n)
          .map((d) => mapDiscussion(d, info.pinned))
          .filter((t): t is Thread => t !== null);
        return applyQuery(found, { ...query, q: undefined });
      }

      const board = query.board ? getBoard(query.board) : undefined;
      if (query.board && !board) return [];
      const categoryId = board ? await categoryIdFor(board) : undefined;
      const [recent, mirrored] = await Promise.all([
        board && !categoryId ? Promise.resolve({ list: [], pinned: new Set<number>() }) : recentDiscussions(categoryId),
        board ? mirrorIssues(board) : Promise.resolve([]),
      ]);
      const threads = recent.list.map((d) => mapDiscussion(d, recent.pinned)).filter((t): t is Thread => t !== null);
      return applyQuery([...threads, ...mirrored], query);
    },

    async getThread(number: number) {
      const info = await repoInfo();
      const data = await graphql<{
        repository: {
          discussion:
            | (GqlDiscussion & {
                answer: GqlComment | null;
                comments: { totalCount: number; nodes: (GqlComment & { replies: { nodes: GqlComment[] } })[] };
              })
            | null;
        };
      }>(
        `query($owner: String!, $name: String!, $number: Int!) { repository(owner: $owner, name: $name) {
          discussion(number: $number) {
            ${DISCUSSION}
            answer { ${COMMENT} }
            comments(first: 50) { totalCount nodes { ${COMMENT} replies(first: 30) { nodes { ${COMMENT} } } } }
          }
        } }`,
        { ...vars, number },
        token,
      ).catch((err) => {
        // GitHub reports a missing discussion as an error rather than null.
        if (err instanceof GitHubError && /Could not resolve to a Discussion/i.test(err.message)) return { repository: { discussion: null } };
        throw err;
      });
      const d = data.repository.discussion;
      if (!d) return null;
      const thread = mapDiscussion(d, info.pinned);
      if (!thread) return null;

      const answer = d.answer ? mapComment(d.answer) : undefined;
      const replies = d.comments.nodes.filter((c) => c.id !== d.answer?.id).map(mapComment);
      const people = new Map<string, Member>();
      if (!thread.anonymous) people.set(thread.author.login, thread.author);
      const walk = (list: Reply[]) =>
        list.forEach((r) => {
          people.set(r.author.login, r.author);
          if (r.replies) walk(r.replies);
        });
      walk(answer ? [answer, ...replies] : replies);

      const sameBoard = await adapter.listThreads({ board: thread.board, sort: "hot", limit: 6 });
      const related = sameBoard
        .filter((t) => t.number !== number && !t.external)
        .slice(0, 3)
        .map(({ number: n, board, title, replyCount, solved }) => ({ number: n, board, title, replyCount, solved }));

      const detail: ThreadDetail = { ...thread, answer, replies, participants: [...people.values()], related };
      return detail;
    },

    async getMirrorThread(boardSlug: string, number: number) {
      const board = getBoard(boardSlug);
      if (!board?.mirror) return null;
      try {
        const issue = await rest<RawIssue>(`/repos/${board.mirror.owner}/${board.mirror.repo}/issues/${number}`, token);
        return issue.pull_request ? null : mapIssue(issue, board);
      } catch (err) {
        if (err instanceof GitHubError && err.status === 404) return null;
        throw err;
      }
    },

    async boardStatus() {
      const info = await repoInfo();
      const names = new Set(info.categories.map((c) => c.name.toLowerCase()));
      return Object.fromEntries(BOARDS.map((b) => [b.slug, names.has(b.discussionCategory.toLowerCase())]));
    },

    async getProfile(login: string) {
      const info = await repoInfo();
      const data = await graphql<{
        user: {
          login: string;
          name: string | null;
          avatarUrl: string;
          bio: string | null;
          createdAt: string;
          repositoryDiscussions: { totalCount: number; nodes: GqlDiscussion[] };
          repositoryDiscussionComments: { totalCount: number; nodes: { createdAt: string; upvoteCount: number }[] };
          answers: { totalCount: number };
        } | null;
      }>(
        `query($login: String!, $repoId: ID!) { user(login: $login) {
          login name avatarUrl bio createdAt
          repositoryDiscussions(repositoryId: $repoId, first: 30, orderBy: { field: CREATED_AT, direction: DESC }) { totalCount nodes { ${DISCUSSION} } }
          repositoryDiscussionComments(repositoryId: $repoId, last: 100) { totalCount nodes { createdAt upvoteCount } }
          answers: repositoryDiscussionComments(repositoryId: $repoId, onlyAnswers: true) { totalCount }
        } }`,
        { login, repoId: info.id },
        token,
      ).catch((err) => {
        if (err instanceof GitHubError && /Could not resolve to a User/i.test(err.message)) return { user: null };
        throw err;
      });
      const u = data.user;
      if (!u) return null;

      // Rumors stay anonymous: never list them on a member's profile.
      const own = u.repositoryDiscussions.nodes.filter((d) => boardForCategory(d.category.name)?.kind !== "anonymous");
      const threads = own.map((d) => mapDiscussion(d, info.pinned)).filter((t): t is Thread => t !== null);
      const comments = u.repositoryDiscussionComments.nodes;

      const activity = new Array<number>(182).fill(0);
      const start = Date.now() - 181 * DAY;
      for (const iso of [...own.map((d) => d.createdAt), ...comments.map((c) => c.createdAt)]) {
        const index = Math.floor((Date.parse(iso) - start) / DAY);
        if (index >= 0 && index < 182) activity[index] += 1;
      }

      const profile: MemberProfile = {
        member: { login: u.login, name: u.name || u.login, avatarUrl: u.avatarUrl, bio: u.bio ?? undefined },
        joinedAt: u.createdAt,
        stats: {
          threads: u.repositoryDiscussions.totalCount,
          replies: u.repositoryDiscussionComments.totalCount,
          accepted: u.answers.totalCount,
          upsReceived: own.reduce((n, d) => n + d.upvoteCount, 0) + comments.reduce((n, c) => n + c.upvoteCount, 0),
          meetups: 0,
          weeklyStreak: 0,
        },
        activity,
        threads,
      };
      return profile;
    },

    async leaderboard() {
      const { comments, discussions } = await recentActivity();
      const weekAgo = Date.now() - 7 * DAY;
      const byLogin = new Map<string, { member: Member; replies: number; xp: number }>();
      for (const c of comments) {
        if (!c.author || Date.parse(c.createdAt) < weekAgo) continue;
        const entry = byLogin.get(c.author.login) ?? { member: member(c.author), replies: 0, xp: 0 };
        entry.replies += 1;
        entry.xp += 5;
        byLogin.set(c.author.login, entry);
      }
      for (const d of discussions) {
        if (!d.author || boardForCategory(d.category.name)?.kind === "anonymous") continue;
        const entry = byLogin.get(d.author.login);
        if (entry) entry.xp += 25 + d.upvoteCount;
      }
      const list: LeaderboardEntry[] = [...byLogin.values()].sort((a, b) => b.replies - a.replies).slice(0, 5);
      return list;
    },

    async hotTags() {
      const { discussions } = await recentActivity();
      const counts = new Map<string, number>();
      for (const d of discussions) for (const tag of parseMeta(d.body).meta.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);
    },

    async stats() {
      const { discussions, comments, firstReplies } = await recentActivity();
      const now = Date.now();
      const weekAgo = now - 7 * DAY;
      const daily = new Array<number>(14).fill(0);
      for (const d of discussions) {
        const index = 13 - Math.floor((now - Date.parse(d.createdAt)) / DAY);
        if (index >= 0 && index < 14) daily[index] += 1;
      }
      const byBoard = new Map<string, number>();
      for (const c of comments) {
        if (Date.parse(c.createdAt) < weekAgo) continue;
        byBoard.set(c.board, (byBoard.get(c.board) ?? 0) + 1);
      }
      const gaps = firstReplies.map((g) => g / 3_600_000).sort((a, b) => a - b);
      const median = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0;
      const qa = discussions.filter((d) => boardForCategory(d.category.name)?.kind === "qa");
      const result: ForumStats = {
        threadsThisWeek: discussions.filter((d) => Date.parse(d.createdAt) >= weekAgo).length,
        repliesThisWeek: comments.filter((c) => Date.parse(c.createdAt) >= weekAgo).length,
        medianFirstReplyHours: Math.round(median * 10) / 10,
        qaSolvedRate: qa.length ? qa.filter((d) => d.isAnswered).length / qa.length : 0,
        daily,
        repliesByBoard: [...byBoard.entries()].map(([board, n]) => ({ board, count: n })).sort((a, b) => b.count - a.count),
      };
      return result;
    },
  };

  /** One query powering stats, leaderboard and hot tags: the 100 newest discussions and their latest comments. */
  async function recentActivity() {
    const data = await graphql<{
      repository: {
        discussions: {
          nodes: (GqlDiscussion & {
            latest: { nodes: { createdAt: string; author: GqlAuthor | null }[] };
            first: { nodes: { createdAt: string }[] };
          })[];
        };
      };
    }>(
      `query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) {
        discussions(first: 100, orderBy: { field: CREATED_AT, direction: DESC }) { nodes {
          ${DISCUSSION}
          latest: comments(last: 30) { nodes { createdAt ${AUTHOR} } }
          first: comments(first: 1) { nodes { createdAt } }
        } }
      } }`,
      vars,
      token,
    );
    const discussions = data.repository.discussions.nodes.filter((d) => boardForCategory(d.category.name));
    const comments = discussions.flatMap((d) =>
      d.latest.nodes.map((c) => ({ ...c, board: boardForCategory(d.category.name)!.slug })),
    );
    const firstReplies = discussions
      .filter((d) => d.first.nodes[0])
      .map((d) => Date.parse(d.first.nodes[0].createdAt) - Date.parse(d.createdAt));
    return { discussions, comments, firstReplies };
  }

  return adapter;
}
