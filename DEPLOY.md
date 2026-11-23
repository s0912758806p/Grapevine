# 部署指南

Grapevine v2 是 Next.js 16 應用，部署在 Vercel，資料存在 GitHub Discussions。

## Vercel 設定

- `vercel.json` 指定 `"framework": "nextjs"`。如果 Vercel 專案設定裡還留著 v1 的 Vite 設定
  （Framework Preset = Vite、Output Directory = `dist`），請在 Project Settings → Build & Deployment 改回預設，
  否則建置會找不到輸出目錄。
- Node.js 版本：20.9 以上。

## 接上 GitHub Discussions 與登入

以下步驟都在 GitHub 網頁上完成，最後把值填進 Vercel 的環境變數（本機開發則填進 `.env.local`）。

### 1. 建立 Discussions 分類

在論壇 repo（例如 `s0912758806p/Grapevine`）的 **Discussions → 分類旁的鉛筆圖示 → New category**，
建立下列分類，名稱要完全一致（大小寫不拘）。格式選 **Open-ended discussion**：

| 看板 | 分類名稱 | 備註 |
|---|---|---|
| 公告 | `Announcements` | GitHub 預設就有；只有 repo 維護者能發文 |
| 綜合討論 | `General` | 預設就有 |
| 技術問答 | `Q&A` | 預設就有，格式是 Question / Answer（可採納解答） |
| 作者專欄 | `Columns` | **需新建** |
| 週刊共讀 | `Weekly` | **需新建**；同步內容不需要分類也會顯示 |
| 職缺 | `Jobs` | **需新建**；同步內容不需要分類也會顯示 |
| 八卦牆 | `Rumors` | **需新建**；目前只能投票，匿名發文之後再開 |
| 在地聚會 | `Meetups` | **需新建** |

還沒建立的分類，對應看板會顯示提示並暫停發文，其他功能不受影響。
`Ideas`、`Polls`、`Show and tell` 這些沒有對應看板的分類不會出現在論壇上。

### 2. 建立 GitHub App（會員登入用）

到 **Settings → Developer settings → GitHub Apps → New GitHub App**：

- **GitHub App name**：例如 `Grapevine Forum`
- **Homepage URL**：網站網址（與 `SITE_URL` 相同）
- **Callback URL**：`https://<你的網址>/api/auth/callback`；本機開發再加一個 `http://localhost:3000/api/auth/callback`
- 勾選 **Expire user authorization tokens**（token 8 小時過期，程式會自動續期）
- **Webhook**：取消勾選 Active
- **Repository permissions → Discussions**：**Read and write**（其他維持 No access）
- **Where can this GitHub App be installed?**：Only on this account
- 建立後，記下 **Client ID**，並按 **Generate a new client secret**
- 左側 **Install App** → 安裝到你的帳號，**只選論壇 repo**

會員登入時不需要授權任何 scope；他們的 token 只能在安裝了這個 App 的論壇 repo 裡讀寫 Discussions。

### 3. 建立唯讀 token（伺服器讀取用）

**Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**：

- **Repository access**：Public repositories（唯讀）
- 不需要額外權限

這個 token 只在伺服器端用來讀取 Discussions，並同步 ruanyf/weekly 與 f2etw/jobs 的 issues。

### 4. 產生 session 金鑰

```bash
openssl rand -base64 48
```

### 5. 環境變數

| 變數 | 說明 |
|---|---|
| `SITE_URL` | 正式網址，例如 `https://grapevine-six-gr925.vercel.app`；也用於登入回呼網址、canonical 與 sitemap |
| `GITHUB_FORUM_REPO` | 論壇 repo，格式 `owner/name` |
| `GITHUB_READ_TOKEN` | 第 3 步的唯讀 token |
| `GITHUB_CLIENT_ID` | 第 2 步 GitHub App 的 Client ID |
| `GITHUB_CLIENT_SECRET` | 第 2 步的 client secret |
| `SESSION_SECRET` | 第 4 步的隨機字串（至少 32 字元）；更換會讓所有人登出 |

全部只在伺服器端使用，**絕對不要**加上 `NEXT_PUBLIC_` 前綴。

### 6. 檢查設定

```bash
npm run check:setup
```

會逐項檢查網址、讀取 token、Discussions 分類與 GitHub App 變數（不會印出密鑰值），全部打勾就能開始測試。
本機沒有專用的讀取 token 時，可以暫時用 GitHub CLI 的登入：

```bash
GITHUB_READ_TOKEN="$(gh auth token)" npm run check:setup
```

```bash
GITHUB_READ_TOKEN="$(gh auth token)" npm run dev
```

- 只設定 `GITHUB_FORUM_REPO` 和 `GITHUB_READ_TOKEN`：論壇顯示真實內容，但不能登入發文。
- 都沒設定：顯示內建範例資料，頁面頂端有提示條。

> v1 曾要求設定 `VITE_GITHUB_TOKEN`，那會被打包進公開的前端程式碼。如果正式站設定過，請到 GitHub 撤銷該 token，
> 並從 Vercel 刪除這個變數。

## 自動部署流程

兩個 GitHub Actions workflow 都會先跑 `npm run lint`、`npm test`、`npm run build`，全部通過才推到 `main`；
Vercel 透過自己的 GitHub App webhook 部署 `main`。CI 不需要上述密鑰：沒有設定時會用範例資料建置。

- **Auto Deploy**（`.github/workflows/Auto-deploy.yml`）：推到 `dev` 後，檢查通過就快轉 `release` 與 `main`。
- **Daily Safe Deploy**（`.github/workflows/daily-deploy.yml`）：每天更新 `public/build-info.json`，檢查通過才提交並推到 `main`。

## 本機開發

```bash
npm install
cp .env.example .env.local   # 需要真實資料或登入時再填值
npm run dev
```
