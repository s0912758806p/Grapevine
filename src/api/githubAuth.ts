import { getAuthenticatedUser } from "./github";
import axios from "axios";

// GitHub OAuth 配置
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const GITHUB_REDIRECT_URI = `${import.meta.env.VITE_HOST}/auth/callback`;

// GitHub API URLs
const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

/**
 * 重定向到 GitHub 授權頁面
 */
export const redirectToGitHubLogin = () => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: "user:email", // 所需權限
    state: generateRandomState(), // 防止 CSRF 攻擊
  });

  // 存儲 state 以便在回調時驗證
  localStorage.setItem("github_oauth_state", params.get("state") || "");

  // 重定向到 GitHub 授權頁面
  window.location.href = `${GITHUB_OAUTH_URL}?${params.toString()}`;
};

/**
 * 使用Axios以CORS友好的方式獲取GitHub token
 */
export const getTokenWithCorsFriendlyApproach = async (
  code: string
): Promise<string> => {
  try {
    const params = new URLSearchParams();
    params.append("client_id", GITHUB_CLIENT_ID);
    params.append("client_secret", import.meta.env.VITE_GITHUB_CLIENT_SECRET);
    params.append("code", code);
    params.append("redirect_uri", GITHUB_REDIRECT_URI);

    const response = await axios.post(GITHUB_TOKEN_URL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error("No access token in response");
    }
  } catch (error) {
    console.error("CORS friendly approach failed:", error);
    throw error;
  }
};

/**
 * 獲取認證用戶信息
 */
export const fetchGitHubUserProfile = async (token: string) => {
  try {
    const userData = await getAuthenticatedUser(token);
    return userData;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * 生成隨機 state 參數
 */
function generateRandomState() {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * 驗證 state 參數以防止 CSRF 攻擊
 */
export const validateOAuthState = (state: string) => {
  const savedState = localStorage.getItem("github_oauth_state");
  return savedState === state;
};

/**
 * 從 URL 中獲取授權碼
 */
export const getCodeFromUrl = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("code");
};

/**
 * 從 URL 中獲取 state 參數
 */
export const getStateFromUrl = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("state");
};
