/**
 * Utterances configuration for GitHub comments
 * 需要在 GitHub 安裝 utterances app: https://github.com/apps/utterances
 */

// 組合完整的倉庫路徑
const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER || "";
const repoName = import.meta.env.VITE_GITHUB_REPO_NAME || "";
const fullRepo = `${repoOwner}/${repoName}`;

// 檢查環境變量是否存在
if (!repoOwner || !repoName) {
  console.error(
    "GitHub repository information is missing in environment variables."
  );
  console.log("Available env vars:", import.meta.env);
}

export interface UtterancesConfig {
  repo: string;
  issueTerm: "pathname" | "url" | "title" | "og:title" | string;
  label?: string;
  theme:
    | "github-light"
    | "github-dark"
    | "preferred-color-scheme"
    | "github-dark-orange"
    | "icy-dark"
    | "dark-blue"
    | "photon-dark";
  crossOrigin?: "anonymous";
}

export const utterancesConfig: UtterancesConfig = {
  repo: fullRepo,
  issueTerm: "pathname",
  label: "comment",
  theme: "preferred-color-scheme",
  crossOrigin: "anonymous",
};

// 開發環境中顯示配置信息以便調試
if (import.meta.env.DEV) {
  console.log("Utterances config:", {
    repo: utterancesConfig.repo,
    issueTerm: utterancesConfig.issueTerm,
    label: utterancesConfig.label,
  });
}

/**
 * 使用說明：
 * 1. 訪問 https://github.com/apps/utterances 並安裝到您的 GitHub 倉庫
 * 2. 確保您的倉庫是公開的
 * 3. 確保您的倉庫啟用了 Issues 功能
 */
