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
