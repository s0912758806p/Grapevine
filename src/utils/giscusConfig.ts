/**
 * Giscus configuration for GitHub authentication
 * You will need to set up a GitHub repository with Giscus app installed.
 * Visit https://giscus.app to get your repository settings.
 */

// 組合完整的倉庫路徑
const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER || '';
const repoName = import.meta.env.VITE_GITHUB_REPO_NAME || '';
const fullRepo = `${repoOwner}/${repoName}`;

// 檢查環境變量是否存在
if (!repoOwner || !repoName) {
  console.error('GitHub repository information is missing in environment variables.');
  console.log('Available env vars:', import.meta.env);
}

export const giscusConfig = {
  // 使用正確組合的repo路徑
  repo: fullRepo as `${string}/${string}`, // Your GitHub repo in format: 'username/repository'
  repoId: import.meta.env.VITE_GITHUB_REPO_ID as string, // Your GitHub repository ID
  category: import.meta.env.VITE_GITHUB_CATEGORY as string, // The name of the discussion category
  categoryId: import.meta.env.VITE_GITHUB_CATEGORY_ID as string, // The ID of the discussion category
  strict: "0" as const,
  mapping: "pathname" as const, // How Giscus should map discussions to pages
  reactionsEnabled: "1" as const, // Enable reactions
  emitMetadata: "1" as const, // Emit metadata to get user information
  inputPosition: "top" as const, // Comment box position
  theme: "preferred_color_scheme", // Theme
  lang: "en", // Language
  loading: "lazy" as "lazy" | "eager", // Loading behavior
  crossorigin: "anonymous" as "anonymous" | "use-credentials", // Cross-origin policy
};

// 開發環境中顯示配置信息以便調試
if (import.meta.env.DEV) {
  console.log('Giscus config:', {
    repo: giscusConfig.repo,
    repoId: giscusConfig.repoId,
    category: giscusConfig.category,
    categoryId: giscusConfig.categoryId
  });
}

/**
 * To set up Giscus:
 * 1. Go to https://giscus.app and follow the setup process
 * 2. Make sure the GitHub app is installed in your repository:
 *    https://github.com/apps/giscus
 * 3. Enable discussions in your repository settings:
 *    Settings > Features > Discussions
 * 4. Copy the values from the giscus configuration script
 * 5. Replace the placeholder values in this file
 *
 * Note: For GitHub authentication to work properly with Giscus:
 * - Your repository must be public
 * - The Giscus app must have access to your repository
 * - Discussions must be enabled on your repository
 */
