import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { message } from "antd";
import {
  redirectToGitHubLogin,
  exchangeCodeForToken,
  fetchGitHubUserProfile,
} from "../api/githubAuth";
import { getAuthenticatedUser } from "../api/github";
import { notifyGiscusAboutLogin } from "../utils/authBridge";

interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  name?: string;
  email?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: GithubUser | null;
  loading: boolean;
  error: string | null;
  githubToken: string | null;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (code: string) => Promise<void>;
  getUserToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 使用 useApp 钩子获取 message 实例
  const [messageApi, contextHolder] = message.useMessage();

  // 檢查用戶是否已登錄（初始化時）
  useEffect(() => {
    const checkSession = async () => {
      // 檢查 GitHub token
      const token = localStorage.getItem("github_access_token");

      if (token) {
        setGithubToken(token);
        setIsAuthenticated(true);

        // 嘗試使用 token 獲取用戶信息
        try {
          const userData = await getAuthenticatedUser(token);
          if (userData) {
            setUser({
              login: userData.login,
              id: userData.id,
              avatar_url: userData.avatar_url,
              name: userData.name || userData.login,
              email: userData.email,
            });

            // 初始化時，如果有可用 token，告知 Giscus 用戶已登錄
            console.log("初始檢查：已有 token，通知 Giscus");
            notifyGiscusAboutLogin(token);
          }
        } catch (err) {
          console.error("Failed to fetch user data with token:", err);
          // Token 可能已失效，清除
          localStorage.removeItem("github_access_token");
          setGithubToken(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setGithubToken(null);
      }
    };

    checkSession();
  }, []);

  // 獲取用戶 token
  const getUserToken = (): string | null => {
    return githubToken || localStorage.getItem("github_access_token");
  };

  // 使用 GitHub OAuth 登录
  const login = () => {
    setLoading(true);
    try {
      // 重定向到 GitHub 授權頁面
      redirectToGitHubLogin();
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to initiate login. Please try again.");
      setLoading(false);
      messageApi.error("Failed to login. Please try again.");
    }
  };

  // 登出
  const logout = () => {
    // 移除 GitHub token
    localStorage.removeItem("github_access_token");
    localStorage.removeItem("github_oauth_state");

    // 更新状态
    setIsAuthenticated(false);
    setUser(null);
    setGithubToken(null);

    messageApi.success("Logged out successfully");
  };

  // 處理 OAuth 回調
  const handleAuthCallback = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("處理 OAuth 回調，獲取 token...");
      // 交換授權碼獲取 access token
      const token = await exchangeCodeForToken(code);

      if (!token) {
        throw new Error("Failed to obtain access token");
      }

      console.log("成功獲取 access token");

      // 存儲 token
      localStorage.setItem("github_access_token", token);
      setGithubToken(token);
      setIsAuthenticated(true);

      // 獲取用戶資料
      const userData = await fetchGitHubUserProfile(token);

      if (userData) {
        setUser({
          login: userData.login,
          id: userData.id,
          avatar_url: userData.avatar_url,
          name: userData.name || userData.login,
          email: userData.email,
        });
      }

      // 登錄成功後，多次通知 Giscus，確保能夠接收到
      console.log("OAuth 認證成功，立即通知 Giscus");
      notifyGiscusAboutLogin(token);

      // 延遲再次通知，確保 Giscus iframe 已加載
      setTimeout(() => {
        console.log("延遲通知 Giscus (1秒後)");
        notifyGiscusAboutLogin(token);
      }, 1000);

      // 再次延遲通知，以防萬一
      setTimeout(() => {
        console.log("再次延遲通知 Giscus (3秒後)");
        notifyGiscusAboutLogin(token);
      }, 3000);

      setLoading(false);
      messageApi.success("Successfully authenticated with GitHub");
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Failed to authenticate with GitHub");
      setLoading(false);
      setIsAuthenticated(false);
      throw err;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    githubToken,
    login,
    logout,
    handleAuthCallback,
    getUserToken,
  };

  return (
    <>
      {contextHolder}
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
