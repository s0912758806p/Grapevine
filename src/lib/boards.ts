/**
 * Board (看板) registry — the single source of truth for every board in the forum.
 *
 * Each board maps 1:1 to a GitHub Discussions category in the forum repo
 * (`discussionCategory`). The `weekly` and `jobs` boards additionally mirror
 * read-only content from external issue trackers (`mirror`).
 *
 * `tone` selects the colour token pair used by chips, dots and headers
 * (see the `.tone-*` classes in src/app/globals.css).
 */

export type BoardTone = "grape" | "neutral" | "sky" | "vine" | "amber" | "teal" | "rose";

export type BoardKind = "discussion" | "qa" | "anonymous" | "mirror" | "meetup" | "announcement";

export interface Board {
  slug: string;
  name: string;
  /** One-line summary for composer and nav tooltips. */
  hint: string;
  description: string;
  rules: string[];
  tone: BoardTone;
  kind: BoardKind;
  /** GitHub Discussions category name in the forum repo. */
  discussionCategory: string;
  /** External repo whose issues are mirrored read-only into this board. */
  mirror?: { owner: string; repo: string; label: string };
  /** Only maintainers can start threads here. */
  maintainersOnly?: boolean;
}

export const BOARDS: Board[] = [
  {
    slug: "announcements",
    name: "公告",
    hint: "僅版主可發",
    description: "站務公告、版規更新與新功能說明。",
    rules: ["僅版主可以發文。", "歡迎在公告下留言提問或回饋。"],
    tone: "grape",
    kind: "announcement",
    discussionCategory: "Announcements",
    maintainersOnly: true,
  },
  {
    slug: "general",
    name: "綜合討論",
    hint: "閒聊、經驗分享",
    description: "工作日常、職涯心得、工具推薦，什麼都能聊。也可以附加投票。",
    rules: ["對事不對人。", "推廣文請先徵得版主同意。"],
    tone: "neutral",
    kind: "discussion",
    discussionCategory: "General",
  },
  {
    slug: "qa",
    name: "技術問答",
    hint: "可採納最佳解答",
    description: "卡住了就來問。提問者可以採納最佳解答，讓後來的人少走冤枉路。",
    rules: ["說明你想達成什麼。", "附上最小重現或錯誤訊息。", "寫下你已經試過的方法。"],
    tone: "sky",
    kind: "qa",
    discussionCategory: "Q&A",
  },
  {
    slug: "columns",
    name: "作者專欄",
    hint: "長文、技術筆記",
    description: "深入的技術文章、專案回顧與學習筆記。",
    rules: ["原創或註明出處。", "長文請加上摘要。"],
    tone: "vine",
    kind: "discussion",
    discussionCategory: "Columns",
  },
  {
    slug: "weekly",
    name: "週刊共讀",
    hint: "週刊文章討論",
    description: "每週同步阮一峰的《科技愛好者週刊》，挑一篇最有感的文章一起聊。",
    rules: ["討論請聚焦當期內容。", "延伸閱讀歡迎附連結。"],
    tone: "amber",
    kind: "mirror",
    discussionCategory: "Weekly",
    mirror: { owner: "ruanyf", repo: "weekly", label: "科技愛好者週刊" },
  },
  {
    slug: "jobs",
    name: "職缺",
    hint: "徵才、求職",
    description: "前端與全端職缺，資料同步自社群維護的 F2E Jobs repo。每則職缺都能留言詢問面試流程、團隊文化。",
    rules: ["請寫明地點、工作型態與薪資範圍。", "同一職缺 30 天內請勿重複張貼。", "獵頭請註明委託公司產業。"],
    tone: "teal",
    kind: "mirror",
    discussionCategory: "Jobs",
    mirror: { owner: "f2etw", repo: "jobs", label: "F2E Jobs" },
  },
  {
    slug: "rumors",
    name: "八卦牆",
    hint: "匿名發佈",
    description: "產業小道消息匿名發佈，由大家投票判斷可信度。請勿指名道姓、勿洩漏個資。",
    rules: ["談公司與技術，不談個人。", "不貼內部文件或截圖。", "累計 3 次檢舉成立會暫停發文。"],
    tone: "rose",
    kind: "anonymous",
    discussionCategory: "Rumors",
  },
  {
    slug: "meetups",
    name: "在地聚會",
    hint: "活動與讀書會",
    description: "讀書會、技術聚會與工作坊。發文時附上城市與時間，就會出現在聚會地圖上。",
    rules: ["寫明日期、時間、地點與費用。", "活動結束後歡迎分享心得。"],
    tone: "sky",
    kind: "meetup",
    discussionCategory: "Meetups",
  },
];

const bySlug = new Map(BOARDS.map((b) => [b.slug, b]));

export function getBoard(slug: string): Board | undefined {
  return bySlug.get(slug);
}

export function requireBoard(slug: string): Board {
  const board = bySlug.get(slug);
  if (!board) throw new Error(`Unknown board: ${slug}`);
  return board;
}
