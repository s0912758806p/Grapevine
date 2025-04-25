import { getAuthenticatedUser } from "./github";
import axios from "axios";

// GitHub OAuth 配置
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const GITHUB_REDIRECT_URI = `${import.meta.env.VITE_HOST}/auth/callback`;

// GitHub API URLs
const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

// 代理服務器 URL (如果需要）
const TOKEN_PROXY_URL =
  import.meta.env.VITE_TOKEN_PROXY_URL || "/api/github/token";

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
const getTokenWithCorsFriendlyApproach = async (
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
 * 使用授權碼交換 access token
 * 注意：在前端直接交換 token 不安全，應使用後端代理
 */
export const exchangeCodeForToken = async (code: string): Promise<string> => {
  try {
    // 方法 1: 使用代理服務器交換 token（推薦）
    if (TOKEN_PROXY_URL) {
      try {
        const response = await axios.post(
          `${TOKEN_PROXY_URL}?code=${code}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.access_token) {
          return response.data.access_token;
        } else {
          console.warn(
            "Proxy server response missing access_token, falling back to CORS-friendly approach"
          );
          throw new Error("Proxy server failed");
        }
      } catch (proxyError) {
        console.warn(
          "Proxy server failed, falling back to CORS-friendly approach:",
          proxyError
        );
        // Fall back to CORS-friendly approach
      }
    }

    // 方法 2: 使用CORS友好的方式直接交換 token
    try {
      console.warn("Attempting to exchange token using CORS-friendly approach");
      return await getTokenWithCorsFriendlyApproach(code);
    } catch (corsError) {
      console.warn("CORS-friendly approach failed:", corsError);
      // 如果CORS方法失败，继续尝试普通直接交换方法
    }

    // 方法 3: 直接交換 token（最后的尝试）
    console.warn("嘗試直接交換 token（最後備用方案）");

    const response = await axios.post(
      GITHUB_TOKEN_URL,
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error("No access token in response");
    }
  } catch (error) {
    console.error("Error exchanging code for token:", error);
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
