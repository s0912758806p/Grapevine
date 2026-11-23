# 部署指南

Grapevine v2 是 Next.js 16 應用，部署在 Vercel。

## Vercel 設定

- `vercel.json` 指定 `"framework": "nextjs"`。如果 Vercel 專案設定裡還留著 v1 的 Vite 設定
  （Framework Preset = Vite、Output Directory = `dist`），請在 Project Settings → Build & Deployment 改回預設，
  否則建置會找不到輸出目錄。
- Node.js 版本：20.9 以上。

## 環境變數

範本在 `.env.example`。目前只需要：

| 變數 | 必要 | 說明 |
|---|---|---|
| `SITE_URL` | 建議 | 正式網址，用在 canonical、Open Graph 與 sitemap；未設定時用 `https://grapevine-six-gr925.vercel.app` |

沒有設定 GitHub 相關變數時，網站會顯示內建範例資料，並在頁面頂端提示。

GitHub Discussions 與登入（下一個 PR）會需要 `GITHUB_FORUM_REPO`、`GITHUB_READ_TOKEN`、`GITHUB_CLIENT_ID`、
`GITHUB_CLIENT_SECRET`、`GITHUB_BOT_TOKEN`、`SESSION_SECRET`。這些都只在伺服器端使用，**絕對不要**加上 `NEXT_PUBLIC_` 前綴。

> v1 曾要求設定 `VITE_GITHUB_TOKEN`，那會被打包進公開的前端程式碼。如果正式站設定過，請到 GitHub 撤銷該 token，
> 並從 Vercel 刪除這個變數。

## 自動部署流程

兩個 GitHub Actions workflow 都會先跑 `npm run lint`、`npm test`、`npm run build`，全部通過才推到 `main`；
Vercel 透過自己的 GitHub App webhook 部署 `main`。

- **Auto Deploy**（`.github/workflows/Auto-deploy.yml`）：推到 `dev` 後，檢查通過就快轉 `release` 與 `main`。
- **Daily Safe Deploy**（`.github/workflows/daily-deploy.yml`）：每天更新 `public/build-info.json`，檢查通過才提交並推到 `main`。

## 本機開發

```bash
npm install
npm run dev
```

需要時把 `.env.example` 複製成 `.env.local` 再填值。
