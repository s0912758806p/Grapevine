# 部署指南

本專案使用 Vercel 進行部署，並使用 GitHub OAuth 進行用戶認證。以下是部署步驟和注意事項。

## 部署到 Vercel

1. 將專案推送到 GitHub 存儲庫
2. 在 Vercel 上創建新項目並連接到該存儲庫
3. 配置以下環境變量：

### 環境變量設置

在 Vercel 的項目設置中，添加以下環境變量：

```
# GitHub OAuth 配置（必須）
GITHUB_CLIENT_ID=您的GitHub客戶端ID
GITHUB_CLIENT_SECRET=您的GitHub客戶端密鑰
HOST=您的應用URL（例如：https://your-app.vercel.app）

# Giscus 配置（如果需要）
GISCUS_REPO_ID=您的Giscus存儲庫ID
GISCUS_CATEGORY=Announcements
GISCUS_CATEGORY_ID=您的Giscus分類ID

# JWT 配置（如果需要）
JWT_SECRET=您的JWT密鑰
```

## 安全考量

- 客戶端密鑰（Client Secret）永遠不應該暴露在前端代碼中
- 所有敏感操作都通過 Serverless 函數處理
- OAuth 回調使用安全的後端路由處理

## 本地開發

對於本地開發，請創建 `.env` 文件並添加相同的環境變量：

```
VITE_GITHUB_CLIENT_ID=您的GitHub客戶端ID
VITE_GITHUB_CLIENT_SECRET=您的GitHub客戶端密鑰
VITE_HOST=http://localhost:5173
```

使用 `npm run dev` 啟動開發服務器。

## 自動部署流程（Auto Deploy）

本專案採用分支串接的自動部署：

```
push 到 dev  ──►  自動建立 PR (dev → release) ──► 自動核准 + 合併
            ──►  自動建立 PR (release → main) ──► 自動核准 + 合併
            ──►  Vercel 偵測 main 更新 ──► 部署到正式站
```

相關設定見 `.github/workflows/Auto-deploy.yml`。只要把變更推送到 `dev`，
其餘流程會自動完成並部署。

## 每日安全部署（Daily Safe Deploy）

`.github/workflows/daily-deploy.yml` 會每天定時執行，確保專案「每天至少部署一次、
且部署前一定有檔案變更」，同時**不會弄壞線上網站**：

1. 重新產生 `public/build-info.json`（當日的檔案變更，純靜態資產，不被程式碼 import，零執行期風險）。
2. 執行 `npm run build` 作為**硬性閘門**：若建置失敗，工作流程在此中止，
   **不會 commit、不會 push、不會觸發部署**，線上網站維持原狀。
3. 只有在建置成功時，才會 commit 並 push 到 `dev`，觸發上述自動部署串接。

可在 GitHub Actions 頁面以 **Run workflow**（`workflow_dispatch`）手動觸發。

> 前置需求：repository secret `BOT_PAT_TOKEN`（已供 `Auto-deploy.yml` 使用）。
> 使用 PAT 而非預設 `GITHUB_TOKEN`，push 才能再次觸發下游的自動部署工作流程。

### build-info.json

部署後可在 `/build-info.json` 查看目前線上版本的建置資訊：

```json
{
  "name": "grapevine",
  "buildDate": "YYYY-MM-DD",
  "buildTime": "ISO-8601 UTC timestamp",
  "commit": "<short SHA>",
  "branch": "<branch>"
}
```

本機可用 `npm run build:info` 重新產生。
