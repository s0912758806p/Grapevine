/**
 * Fixture adapter: sample forum content used when no GitHub token is
 * configured (local development without secrets, CI builds, previews).
 *
 * The content mirrors the Claude Design prototype. Names, companies, dates and
 * venues are illustrative; placeholders in [brackets] are intentional and must
 * never be replaced with invented "real" values. The UI shows a banner whenever
 * this adapter is active, so sample data is never mistaken for live data.
 */
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
} from "./types";

/** Fixed clock so fixture timestamps (and therefore hot ranking) are stable. */
export const FIXTURE_NOW = Date.parse("2026-11-23T08:00:00Z");
const ago = (minutes: number) => new Date(FIXTURE_NOW - minutes * 60_000).toISOString();
const H = 60;
const D = 24 * H;

const m = (login: string, name: string, bio?: string): Member => ({ login, name, bio });

export const MEMBERS = {
  mika: m("mika_dev", "Mika", "前端工程師，React 與動畫愛好者。"),
  ruo: m("ruo_yun", "若雲", "前端工程師，關心無障礙與效能。週末會去讀書會。"),
  hsu: m("hsu.chen", "Hsu Chen", "Tech lead，常在想團隊流程。"),
  kaito: m("kaito", "Kaito", "全端工程師，monorepo 受害者。"),
  yuna: m("yuna.w", "Yuna", "剛轉職的前端新人。"),
  grapevine: m("grapevine", "Grapevine", "Grapevine 官方帳號。"),
  jobs: m("f2e-jobs", "F2E Jobs", "職缺同步機器人。"),
} satisfies Record<string, Member>;

const ANON: Member = { login: "anonymous", name: "匿名葡萄" };

const r = (up: number, helpful = 0, thanks = 0) => [
  { kind: "up" as const, count: up },
  { kind: "helpful" as const, count: helpful },
  { kind: "thanks" as const, count: thanks },
];

export const THREADS: Thread[] = [
  {
    number: 1,
    board: "announcements",
    title: "歡迎來到 Grapevine：版規與新手指南",
    excerpt: "發文前先看一下各看板的規則、匿名八卦牆的使用方式，以及等級怎麼計算。",
    body: "## 歡迎\n\nGrapevine 是建立在 GitHub Discussions 上的開發者論壇。所有主題與回覆都存在 GitHub，你隨時可以看到原始紀錄。\n\n## 基本規則\n\n1. 對事不對人。\n2. 發文前先搜尋，避免重複。\n3. 匿名八卦牆談公司與技術，不談個人。\n\n## 等級怎麼算\n\n發主題、回覆、回覆被採納、收到推，都會累積經驗值。",
    author: MEMBERS.grapevine,
    createdAt: ago(30 * D),
    lastActivityAt: ago(2 * D),
    tags: ["新手"],
    replyCount: 12,
    reactions: r(58),
    pinned: true,
  },
  {
    number: 101,
    board: "qa",
    title: "React 19 的 use() 搭配 Suspense，錯誤邊界應該放在哪一層？",
    excerpt: "資料請求改成 use(promise) 之後，Suspense 的 fallback 正常，但 API 失敗時整頁白掉。錯誤邊界放在路由層還是元件層比較合理？附上最小重現。",
    body: "資料請求改成 `use(promise)` 之後，Suspense 的 fallback 都正常，但只要 API 回 500，整個頁面就白掉，連導覽列都不見。\n\n```tsx\nfunction Profile({ userPromise }) {\n  const user = use(userPromise);\n  return <ProfileCard user={user} />;\n}\n```\n\n目前錯誤邊界只包在 App 最外層。想請教大家：放在路由層、還是每個 Suspense 邊界旁邊各放一個？",
    author: MEMBERS.mika,
    createdAt: ago(2 * H),
    lastActivityAt: ago(8),
    tags: ["react", "suspense", "error-boundary"],
    replyCount: 18,
    reactions: r(42, 15, 6),
    solved: true,
    featured: true,
  },
  {
    number: 102,
    board: "qa",
    title: "Vite 6 的 SSR 外部化設定，monorepo 內部套件一直被打包進去？",
    excerpt: "設了 ssr.noExternal 也試過 optimizeDeps.exclude，workspace 套件還是出現在 server bundle。有人遇過嗎？",
    body: "設了 `ssr.noExternal` 也試過 `optimizeDeps.exclude`，workspace 套件還是出現在 server bundle。有人遇過嗎？",
    author: MEMBERS.kaito,
    createdAt: ago(12),
    lastActivityAt: ago(12),
    tags: ["vite", "monorepo"],
    replyCount: 0,
    reactions: r(3),
  },
  {
    number: 103,
    board: "columns",
    title: "把 GitHub Discussions 當論壇後端：半年實戰心得",
    excerpt: "分類當看板、GraphQL 分頁、OAuth 權限範圍、快取策略，以及那些官方文件沒寫的速率限制細節。",
    body: "## 為什麼選 Discussions\n\n分類就是看板、內建 Q&A 採納、reactions 與投票，而且資料永遠在 GitHub 上。\n\n## 踩過的坑\n\n- GraphQL 的分頁要用 cursor，不能跳頁。\n- 未登入讀取也需要 token，務必放在伺服器端。\n- 寫入要 `public_repo` 權限，登入時要說明清楚。",
    author: MEMBERS.ruo,
    createdAt: ago(5 * H),
    lastActivityAt: ago(40),
    tags: ["github", "graphql"],
    replyCount: 24,
    reactions: r(87, 20, 11),
    featured: true,
  },
  {
    number: 104,
    board: "general",
    title: "你的團隊怎麼做 code review？一個 PR 最多幾行才合理？",
    excerpt: "我們團隊最近在吵這件事，開個投票順便聽聽大家的流程：誰審、審多久、有沒有用 AI 輔助。",
    body: "我們團隊最近在吵這件事，開個投票順便聽聽大家的流程：誰審、審多久、有沒有用 AI 輔助。",
    author: MEMBERS.hsu,
    createdAt: ago(26 * H),
    lastActivityAt: ago(3 * H),
    tags: ["團隊協作"],
    replyCount: 56,
    reactions: r(31),
    poll: [
      { label: "200 行以內", votes: 48 },
      { label: "200–500 行", votes: 35 },
      { label: "不限，看情況", votes: 22 },
    ],
  },
  {
    number: 105,
    board: "jobs",
    title: "【台北／可遠端】資深前端工程師（React、TypeScript）",
    excerpt: "產品團隊徵人，負責設計系統與效能優化。薪資：[待公司填寫]。",
    body: "產品團隊徵人，負責設計系統與效能優化。\n\n- 地點：台北，可部分遠端\n- 薪資：[待公司填寫]",
    author: MEMBERS.jobs,
    createdAt: ago(28 * H),
    lastActivityAt: ago(6 * H),
    tags: ["react", "typescript", "設計系統"],
    replyCount: 4,
    reactions: r(12),
    job: { company: "[公司名稱]", place: "tpe", placeLabel: "台北・可部分遠端", type: "full", pay: "[待填寫]" },
  },
  {
    number: 106,
    board: "jobs",
    title: "前端工程師（Vue 3、Nuxt）",
    excerpt: "新竹團隊徵前端，負責內部管理系統。",
    body: "新竹團隊徵前端，負責內部管理系統。",
    author: MEMBERS.jobs,
    createdAt: ago(2 * D),
    lastActivityAt: ago(2 * D),
    tags: ["vue", "nuxt"],
    replyCount: 1,
    reactions: r(5),
    job: { company: "[公司名稱]", place: "hsc", placeLabel: "新竹", type: "full", pay: "[待填寫]" },
  },
  {
    number: 107,
    board: "jobs",
    title: "全遠端 Web 工程師（Next.js、Node.js）",
    excerpt: "全遠端團隊，時區彈性。",
    body: "全遠端團隊，時區彈性。",
    author: MEMBERS.jobs,
    createdAt: ago(3 * D),
    lastActivityAt: ago(1 * D),
    tags: ["nextjs", "node", "remote"],
    replyCount: 7,
    reactions: r(21),
    job: { company: "[公司名稱]", place: "remote", placeLabel: "遠端", type: "full", pay: "[待填寫]" },
  },
  {
    number: 108,
    board: "jobs",
    title: "官網改版接案：Astro 靜態網站",
    excerpt: "需重視無障礙，預計兩個月。",
    body: "需重視無障礙，預計兩個月。",
    author: MEMBERS.jobs,
    createdAt: ago(4 * D),
    lastActivityAt: ago(4 * D),
    tags: ["astro", "a11y"],
    replyCount: 0,
    reactions: r(4),
    job: { company: "[公司名稱]", place: "remote", placeLabel: "遠端", type: "contract", pay: "[待填寫]" },
  },
  {
    number: 109,
    board: "jobs",
    title: "前端實習生（每週 3 天）",
    excerpt: "適合在學學生，有導師帶領。",
    body: "適合在學學生，有導師帶領。",
    author: MEMBERS.jobs,
    createdAt: ago(7 * D),
    lastActivityAt: ago(5 * D),
    tags: ["html", "css", "實習"],
    replyCount: 2,
    reactions: r(9),
    job: { company: "[公司名稱]", place: "txg", placeLabel: "台中", type: "part", pay: "[待填寫]" },
  },
  {
    number: 110,
    board: "weekly",
    title: "本週共讀：這期你最有感的是哪一篇？",
    excerpt: "這期聊到瀏覽器的 View Transitions 和一篇關於工程師寫作的文章，留言分享你的想法或延伸閱讀。",
    body: "這期聊到瀏覽器的 View Transitions 和一篇關於工程師寫作的文章，留言分享你的想法或延伸閱讀。",
    author: MEMBERS.grapevine,
    createdAt: ago(2 * D),
    lastActivityAt: ago(5 * H),
    tags: ["週刊"],
    replyCount: 9,
    reactions: r(19),
  },
  {
    number: 111,
    board: "rumors",
    title: "聽說某大廠前端部門要全面從 webpack 換成 Rspack",
    excerpt: "內部 RFC 已經過了第一輪，主要動機是 CI 建置時間。可信度請大家自行判斷。",
    body: "內部 RFC 已經過了第一輪，主要動機是 CI 建置時間。可信度請大家自行判斷。",
    author: ANON,
    anonymous: true,
    createdAt: ago(3 * D),
    lastActivityAt: ago(1 * D),
    tags: ["傳聞"],
    replyCount: 27,
    reactions: r(64),
    credibility: { believe: 46, doubt: 18 },
  },
  {
    number: 112,
    board: "rumors",
    title: "某知名設計工具據說明年會推出可自架的開源版本",
    excerpt: "消息來源是社群聚會上的閒聊，真假未知。",
    body: "消息來源是社群聚會上的閒聊，真假未知。",
    author: ANON,
    anonymous: true,
    createdAt: ago(4 * D),
    lastActivityAt: ago(2 * D),
    tags: ["傳聞"],
    replyCount: 11,
    reactions: r(23),
    credibility: { believe: 23, doubt: 33 },
  },
  {
    number: 113,
    board: "rumors",
    title: "某新創完成 A 輪後反而凍結前端招募，改外包",
    excerpt: "據說是為了控制燒錢速度。",
    body: "據說是為了控制燒錢速度。",
    author: ANON,
    anonymous: true,
    createdAt: ago(5 * D),
    lastActivityAt: ago(3 * D),
    tags: ["傳聞"],
    replyCount: 15,
    reactions: r(38),
    credibility: { believe: 38, doubt: 20 },
  },
  {
    number: 114,
    board: "rumors",
    title: "某電商平台正在把結帳頁改寫成 Web Components",
    excerpt: "目標是讓不同框架的團隊共用。",
    body: "目標是讓不同框架的團隊共用。",
    author: ANON,
    anonymous: true,
    createdAt: ago(7 * D),
    lastActivityAt: ago(6 * D),
    tags: ["傳聞"],
    replyCount: 4,
    reactions: r(12),
    credibility: { believe: 12, doubt: 15 },
  },
  {
    number: 115,
    board: "meetups",
    title: "台北前端讀書會：Web Components 回顧",
    excerpt: "一起讀規格、分享實作經驗。歡迎第一次參加的朋友。",
    body: "一起讀規格、分享實作經驗。歡迎第一次參加的朋友。\n\n- 時間：[日期] 14:00\n- 地點：[場地]",
    author: MEMBERS.ruo,
    createdAt: ago(6 * D),
    lastActivityAt: ago(1 * D),
    tags: ["讀書會", "台北"],
    replyCount: 18,
    reactions: r(26),
    meetup: { city: "台北", when: "[日期] 14:00", venue: "[場地]", going: 18, lat: 25.0418, lng: 121.5654 },
  },
  {
    number: 116,
    board: "meetups",
    title: "TypeScript 型別體操小聚",
    excerpt: "帶著你最得意（或最痛苦）的型別來。",
    body: "帶著你最得意（或最痛苦）的型別來。\n\n- 時間：[日期] 19:30\n- 地點：[場地]",
    author: MEMBERS.kaito,
    createdAt: ago(8 * D),
    lastActivityAt: ago(2 * D),
    tags: ["typescript", "新竹"],
    replyCount: 9,
    reactions: r(14),
    meetup: { city: "新竹", when: "[日期] 19:30", venue: "[場地]", going: 9, lat: 24.8066, lng: 120.9686 },
  },
  {
    number: 117,
    board: "meetups",
    title: "無障礙網頁實作工作坊",
    excerpt: "用螢幕閱讀器實際走一遍常見元件。",
    body: "用螢幕閱讀器實際走一遍常見元件。\n\n- 時間：[日期] 10:00\n- 地點：[場地]",
    author: MEMBERS.yuna,
    createdAt: ago(9 * D),
    lastActivityAt: ago(3 * D),
    tags: ["a11y", "台中"],
    replyCount: 14,
    reactions: r(30),
    meetup: { city: "台中", when: "[日期] 10:00", venue: "[場地]", going: 14, lat: 24.1477, lng: 120.6736 },
  },
  {
    number: 118,
    board: "qa",
    title: "Server Components 的錯誤要怎麼傳回客戶端？",
    excerpt: "伺服器端丟出的錯誤到了瀏覽器只剩一串 digest，要怎麼顯示有意義的訊息？",
    body: "伺服器端丟出的錯誤到了瀏覽器只剩一串 digest，要怎麼顯示有意義的訊息？",
    author: MEMBERS.yuna,
    createdAt: ago(3 * D),
    lastActivityAt: ago(2 * D),
    tags: ["react", "nextjs"],
    replyCount: 12,
    reactions: r(17, 9),
    solved: true,
  },
  {
    number: 119,
    board: "columns",
    title: "Skeleton 該做多像真實內容？分享我們的規範",
    excerpt: "從版面穩定度、動畫與無障礙三個角度整理我們團隊的骨架屏規範。",
    body: "從版面穩定度、動畫與無障礙三個角度整理我們團隊的骨架屏規範。",
    author: MEMBERS.hsu,
    createdAt: ago(3 * D),
    lastActivityAt: ago(1 * D),
    tags: ["ux", "a11y"],
    replyCount: 7,
    reactions: r(33, 12),
    featured: true,
  },
  {
    number: 120,
    board: "qa",
    title: "TanStack Query 與 use() 可以混用嗎？",
    excerpt: "既有專案用 TanStack Query，新功能想試 use()，兩者的快取會打架嗎？",
    body: "既有專案用 TanStack Query，新功能想試 `use()`，兩者的快取會打架嗎？",
    author: MEMBERS.yuna,
    createdAt: ago(6 * H),
    lastActivityAt: ago(6 * H),
    tags: ["react", "tanstack-query"],
    replyCount: 0,
    reactions: r(2),
  },
  {
    number: 121,
    board: "qa",
    title: "focus-visible 在 Safari 的行為差異",
    excerpt: "按鈕用滑鼠點擊後，Safari 會不會出現焦點框？各瀏覽器的實作差在哪？",
    body: "按鈕用滑鼠點擊後，Safari 會不會出現焦點框？各瀏覽器的實作差在哪？",
    author: MEMBERS.ruo,
    createdAt: ago(14 * D),
    lastActivityAt: ago(12 * D),
    tags: ["css", "a11y"],
    replyCount: 9,
    reactions: r(15, 4),
    solved: true,
  },
  {
    number: 122,
    board: "general",
    title: "讀書會選書：下一本要讀什麼？",
    excerpt: "上一本讀完了，投票決定下一本。",
    body: "上一本讀完了，投票決定下一本。",
    author: MEMBERS.ruo,
    createdAt: ago(7 * D),
    lastActivityAt: ago(5 * D),
    tags: ["讀書會"],
    replyCount: 31,
    reactions: r(20),
    poll: [
      { label: "重構（第二版）", votes: 14 },
      { label: "設計資料密集的應用", votes: 21 },
      { label: "無障礙設計實務", votes: 9 },
    ],
  },
];

const reply = (id: string, author: Member, minutesAgo: number, ups: number, body: string, replies?: Reply[]): Reply => ({
  id,
  author,
  createdAt: ago(minutesAgo),
  ups,
  body,
  replies,
});

const DETAILS: Record<number, Pick<ThreadDetail, "answer" | "replies">> = {
  101: {
    answer: {
      ...reply(
        "101-a",
        MEMBERS.ruo,
        60,
        36,
        "原則是「錯誤邊界跟著使用者能接受失去的範圍走」。路由層放一個兜底，個別資料區塊再各放一個，這樣單一區塊失敗時，導覽列和其他區塊都還在。\n\n```tsx\n<ErrorBoundary fallback={<SectionError />}>\n  <Suspense fallback={<CardSkeleton />}>\n    <Profile userPromise={userPromise} />\n  </Suspense>\n</ErrorBoundary>\n```\n\n另外記得在 fallback 裡提供「重試」，並在重試時重新建立 promise，不然會一直拿到同一個 rejected promise。",
      ),
      isAnswer: true,
    },
    replies: [
      reply("101-1", MEMBERS.hsu, 60, 8, "補充：Next.js 的 `error.tsx` 本質上就是路由層的錯誤邊界，可以參考它的切法。"),
      reply("101-2", MEMBERS.kaito, 40, 5, "重試時重新建立 promise 這點超重要，我之前卡了一整天。有人有封裝好的 hook 嗎？", [
        reply("101-2-1", MEMBERS.mika, 30, 3, "我把 promise 放進一個以 retryKey 為 key 的快取，按重試就把 key 加一。"),
        reply("101-2-2", MEMBERS.ruo, 22, 4, "這樣很好。記得在元件卸載時清掉快取，避免記憶體一直長。"),
      ]),
      reply("101-3", MEMBERS.yuna, 8, 2, "想問 fallback 裡的重試按鈕，對螢幕閱讀器使用者要怎麼提示內容已重新載入？"),
    ],
  },
  103: {
    replies: [
      reply("103-1", MEMBERS.mika, 120, 6, "GraphQL 的 rate limit 是用點數算的，一次抓太多巢狀欄位很快就用完，這篇提醒得很好。"),
      reply("103-2", MEMBERS.kaito, 40, 3, "請問匿名發文是怎麼做的？Discussions 本身沒有匿名功能吧？", [
        reply("103-2-1", MEMBERS.ruo, 30, 5, "用伺服器端的 bot 帳號代發，對外匿名，但伺服器會記錄發文者以便處理檢舉。"),
      ]),
    ],
  },
};

function detailFor(thread: Thread): ThreadDetail {
  const extra = DETAILS[thread.number] ?? { replies: [] };
  const people = new Map<string, Member>();
  if (!thread.anonymous) people.set(thread.author.login, thread.author);
  const walk = (list: Reply[]) =>
    list.forEach((rp) => {
      people.set(rp.author.login, rp.author);
      if (rp.replies) walk(rp.replies);
    });
  if (extra.answer) walk([extra.answer]);
  walk(extra.replies);

  const related = THREADS.filter(
    (t) => t.number !== thread.number && (t.board === thread.board || t.tags.some((g) => thread.tags.includes(g))),
  )
    .slice(0, 3)
    .map(({ number, board, title, replyCount, solved }) => ({ number, board, title, replyCount, solved }));

  return { ...thread, ...extra, participants: [...people.values()], related };
}

/** Deterministic pseudo-random activity so profile heatmaps are stable across renders. */
function activityFor(login: string): number[] {
  let seed = [...login].reduce((acc, ch) => acc + ch.charCodeAt(0), 7);
  return Array.from({ length: 182 }, (_, i) => {
    seed = (seed * 9301 + 49297) % 233280;
    const roll = seed / 233280;
    const weekend = i % 7 === 0 || i % 7 === 6;
    if (roll < (weekend ? 0.55 : 0.35)) return 0;
    return roll < 0.62 ? 1 : roll < 0.82 ? 3 : roll < 0.94 ? 6 : 10;
  });
}

const PROFILE_STATS: Record<string, MemberProfile["stats"]> = {
  ruo_yun: { threads: 23, replies: 186, accepted: 17, upsReceived: 942, meetups: 3, weeklyStreak: 4 },
  mika_dev: { threads: 12, replies: 121, accepted: 9, upsReceived: 512, meetups: 1, weeklyStreak: 2 },
};

export const fixtureAdapter: ForumAdapter = {
  source: "fixtures",

  async listThreads(query) {
    return applyQuery(THREADS, query, FIXTURE_NOW);
  },

  async getThread(number) {
    const thread = THREADS.find((t) => t.number === number);
    return thread ? detailFor(thread) : null;
  },

  async getProfile(login) {
    const member = Object.values(MEMBERS).find((mm) => mm.login === login);
    if (!member) return null;
    const threads = applyQuery(THREADS, { author: login, sort: "new" }, FIXTURE_NOW);
    const stats = PROFILE_STATS[login] ?? {
      threads: threads.length,
      replies: threads.length * 4,
      accepted: 0,
      upsReceived: threads.reduce((n, t) => n + (t.reactions[0]?.count ?? 0), 0),
      meetups: 0,
      weeklyStreak: 0,
    };
    return { member, joinedAt: ago(400 * D), stats, activity: activityFor(login), threads };
  },

  async leaderboard(): Promise<LeaderboardEntry[]> {
    return [
      { member: MEMBERS.ruo, replies: 38, xp: 1460 },
      { member: MEMBERS.mika, replies: 29, xp: 820 },
      { member: MEMBERS.hsu, replies: 21, xp: 610 },
      { member: MEMBERS.kaito, replies: 14, xp: 240 },
      { member: MEMBERS.yuna, replies: 9, xp: 90 },
    ];
  },

  async hotTags() {
    return ["react", "typescript", "vite", "css", "面試", "remote", "a11y", "graphql"];
  },

  async stats(): Promise<ForumStats> {
    return {
      threadsThisWeek: 64,
      repliesThisWeek: 695,
      medianFirstReplyHours: 3.2,
      qaSolvedRate: 0.71,
      daily: [11, 12, 8, 6, 14, 15, 13, 12, 13, 7, 6, 16, 18, 15],
      repliesByBoard: [
        { board: "qa", count: 214 },
        { board: "general", count: 176 },
        { board: "rumors", count: 131 },
        { board: "columns", count: 88 },
        { board: "jobs", count: 47 },
        { board: "weekly", count: 39 },
      ],
    };
  },
};
