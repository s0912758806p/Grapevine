# Grapevine

建立在 **GitHub Discussions** 上的開發者論壇：技術問答、作者專欄、週刊共讀、職缺、匿名八卦牆與在地聚會。
v2 從 Vite 單頁應用改寫成 **Next.js 16（App Router）**，主題頁與看板頁在伺服器端渲染，方便搜尋引擎收錄。

[正式站](https://grapevine-six-gr925.vercel.app/)

> **目前狀態**：介面與所有頁面已完成，但資料來源還是內建的**範例資料**（頁面頂端會顯示提示條）。
> 發文、回覆、投票會通過欄位檢查，但不會儲存。接上 GitHub Discussions 與 GitHub 登入是下一個 PR。

## 功能

| 頁面 | 路徑 | 說明 |
|---|---|---|
| 動態牆 | `/` | 所有看板的主題，可依熱門／最新／精華／未回覆排序；右欄有本週活躍、熱門標籤、週刊共讀、下一場聚會 |
| 看板 | `/c/[slug]` | 8 個看板；職缺看板有地點與類型篩選，八卦牆有可信度投票，在地聚會連到地圖 |
| 主題 | `/t/[number]` | Markdown 內文、反應、投票結果、提問者採納的解答、巢狀回覆、相關主題；含 JSON-LD 與 Open Graph |
| 發表主題 | `/new` | 選看板、Markdown 編輯與預覽、標籤、附加投票，草稿存在本機 |
| 個人頁 | `/u/[login]` | 等級與進度、統計、近半年參與熱度圖、徽章（全部由真實活動計算） |
| 搜尋 | `/search` | 關鍵字或 `?tag=` 標籤搜尋；任何頁面按 ⌘K／Ctrl+K 會聚焦搜尋框 |
| 收藏 | `/bookmarks` | 只存在這台裝置的瀏覽器（localStorage） |
| 聚會地圖 | `/meetups` | Leaflet 地圖與聚會列表（取代 v1 的 Location 頁） |
| 論壇數據 | `/stats` | 每週新主題、回覆、首次回覆時間、問答解決率（取代 v1 的 Analytics 頁） |
| 所有看板 | `/boards` | 看板總覽（手機底部分頁的「看板」） |

另外：深色模式（跟隨系統，可手動切換且不閃爍）、手機版底部分頁列、`sitemap.xml`、`robots.txt`，
以及 v1 舊網址的永久轉址（設定在 `next.config.ts`）。

## 快速開始

需要 Node.js 20.9 以上。

```bash
npm install
npm run dev
```

打開 http://localhost:3000 。不需要任何密鑰，沒有設定 GitHub 時會自動使用範例資料。

| 指令 | 用途 |
|---|---|
| `npm run dev` | 開發伺服器 |
| `npm run build` | 正式建置（CI 的硬性關卡） |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 型別檢查 |
| `npm test` | Vitest 單元測試（含本 README 的結構檢查） |

環境變數範本在 `.env.example`。

## 專案結構

```
src/
├── app/                       # 路由（App Router）
│   ├── layout.tsx             # 根版面：頂欄、範例資料提示、頁尾、手機分頁列、防閃爍的主題腳本
│   ├── globals.css            # 設計系統 token（淺色／深色）與共用元件樣式
│   ├── actions.ts             # Server Actions：發文、回覆、匿名爆料（目前只做檢查、不儲存）
│   ├── page.tsx               # 動態牆
│   ├── c/[slug]/page.tsx      # 看板（含職缺篩選、八卦牆、聚會列表）
│   ├── t/[number]/page.tsx    # 主題頁
│   ├── u/[login]/page.tsx     # 個人頁
│   ├── new/page.tsx           # 發表主題
│   ├── search/page.tsx        # 搜尋
│   ├── bookmarks/page.tsx     # 本機收藏
│   ├── meetups/page.tsx       # 聚會地圖
│   ├── stats/page.tsx         # 論壇數據
│   ├── boards/page.tsx        # 所有看板
│   ├── login/page.tsx         # 登入說明（GitHub 登入尚未開放）
│   ├── sitemap.ts             # sitemap.xml
│   └── robots.ts              # robots.txt
├── components/
│   ├── Icon.tsx               # 線條圖示與 Logo
│   ├── layout/                # 頂欄、側邊看板導覽、手機分頁列、三欄版型、深色模式切換、搜尋框
│   └── forum/                 # 主題卡片、動態牆、側欄小工具、互動元件、發文表單、聚會地圖
└── lib/
    ├── boards.ts              # 看板設定（對應 Discussions 分類）
    ├── levels.ts              # 等級與徽章計算
    ├── format.ts              # 日期與頭像格式化
    ├── bookmarks.ts           # 本機收藏
    └── forum/
        ├── index.ts           # 頁面唯一的資料入口（"use cache" + cacheLife）
        ├── types.ts           # 論壇資料模型與 adapter 介面
        ├── query.ts           # 排序與篩選（熱門分數等）
        └── fixtures.ts        # 範例資料 adapter
test/                          # Vitest 測試
```

## 資料架構

頁面只透過 `src/lib/forum/index.ts` 讀資料。那裡的每個函式都用 `"use cache"` 加上 `cacheLife`，
由 Next.js 負責預先渲染與重新驗證，再交給 adapter（`ForumAdapter`，定義在 `types.ts`）。

- **範例資料 adapter**（`fixtures.ts`）：目前唯一的 adapter。時間以固定時刻計算，排序結果穩定。
- **GitHub Discussions adapter**（下一個 PR）：看板對應 Discussions 分類（見 `boards.ts` 的 `discussionCategory`），
  讀取在伺服器端帶 `GITHUB_READ_TOKEN`，寫入用會員自己的 OAuth token。設定好環境變數後會自動切換，頁面不用改。

## 技術

Next.js 16（App Router、Cache Components、Partial Prefetching）· React 19 · TypeScript ·
CSS Modules + CSS 變數 · react-markdown（remark-gfm、rehype-sanitize）· Leaflet / react-leaflet· Vitest · Vercel

## 部署

見 [DEPLOY.md](./DEPLOY.md)。

## 授權

MIT，見 [LICENSE](./LICENSE)。
