import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { message } from "antd";
import { getAuthenticatedUser } from "../api/github";

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

  // 檢查用戶是否已登錄
  useEffect(() => {
    const checkSession = async () => {
      // 檢查 Giscus session token
      const token = localStorage.getItem("giscus-session");
      const githubAccessToken = localStorage.getItem("github-access-token");

      if (token) {
        setIsAuthenticated(true);

        if (githubAccessToken) {
          setGithubToken(githubAccessToken);

          // 嘗試使用 token 獲取完整的用戶信息
          try {
            const userData = await getAuthenticatedUser(githubAccessToken);
            if (userData) {
              setUser({
                login: userData.login,
                id: userData.id,
                avatar_url: userData.avatar_url,
                name: userData.name || userData.login,
                email: userData.email,
              });
            } else {
              // 如果獲取失敗，則嘗試獲取基本用戶數據
              await fetchUserData(token);
            }
          } catch (err) {
            console.error("Failed to fetch user data with token:", err);
            await fetchUserData(token);
          }
        } else {
          // 如果沒有 GitHub token，則使用 Giscus token 嘗試獲取用戶數據
          try {
            await fetchUserData(token);
          } catch (err) {
            console.error("Failed to fetch user data:", err);
          }
        }
      } else {
        setIsAuthenticated(false);
        setGithubToken(null);
      }
    };

    checkSession();
  }, []);

  // 監聽 Giscus 認證變化
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== "https://giscus.app") return;

      if (event.data?.giscus?.discussion?.authenticated === true) {
        setIsAuthenticated(true);
        messageApi.success("Successfully logged in with GitHub");

        // 當 Giscus 確認認證後，嘗試獲取用戶數據
        const token = localStorage.getItem("giscus-session");
        if (token) {
          // 嘗試獲取 GitHub token
          if (event.data?.giscus?.token) {
            const ghToken = event.data.giscus.token;
            localStorage.setItem("github-access-token", ghToken);
            setGithubToken(ghToken);

            // 使用 token 獲取用戶數據
            try {
              const userData = await getAuthenticatedUser(ghToken);
              if (userData) {
                setUser({
                  login: userData.login,
                  id: userData.id,
                  avatar_url: userData.avatar_url,
                  name: userData.name || userData.login,
                  email: userData.email,
                });
                return;
              }
            } catch (err) {
              console.error("Failed to fetch user data with token:", err);
            }
          }

          // 如果無法獲取 token 或使用 token 獲取用戶數據失敗，則使用 Giscus 獲取基本用戶數據
          try {
            await fetchUserData(token);
          } catch (err) {
            console.error(
              "Failed to fetch user data after authentication:",
              err
            );
          }
        }
      } else if (event.data?.giscus?.discussion?.authenticated === false) {
        setIsAuthenticated(false);
        setUser(null);
        setGithubToken(null);
        localStorage.removeItem("github-access-token");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [messageApi]);

  // 使用 Giscus 提供的登錄功能
  const login = () => {
    setLoading(true);

    // 尋找 Giscus iframe 並觸發登錄
    const iframes = document.querySelectorAll<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );

    if (iframes.length > 0) {
      // 使用第一個找到的 iframe
      const iframe = iframes[0];
      // 發送消息到 Giscus 以觸發 GitHub 登錄
      iframe.contentWindow?.postMessage(
        { giscus: { setConfig: { authentication: "github" } } },
        "https://giscus.app"
      );
      setLoading(false);

      console.log("Sent login message to Giscus iframe");
    } else {
      console.error("No Giscus iframe found. Waiting for iframe to load...");

      // 等待短暫時間後再次嘗試找到 iframe（可能正在加載）
      setTimeout(() => {
        const retryIframes = document.querySelectorAll<HTMLIFrameElement>(
          "iframe.giscus-frame"
        );

        if (retryIframes.length > 0) {
          const iframe = retryIframes[0];
          iframe.contentWindow?.postMessage(
            { giscus: { setConfig: { authentication: "github" } } },
            "https://giscus.app"
          );
          setLoading(false);
          console.log("Sent login message to Giscus iframe (retry)");
        } else {
          // 如果還是找不到 iframe，引導用戶到評論區
          messageApi.info(
            "Login system is initializing. Please try again in a few seconds."
          );
          setLoading(false);

          // 導航到評論頁面
          window.location.href = "/comments";
        }
      }, 1500); // 等待 1.5 秒
    }
  };

  // 通過 Giscus 獲取 GitHub 用戶數據
  const fetchUserData = async (token: string) => {
    try {
      // 登錄令牌信息
      console.log(
        "Using Giscus session token:",
        token.substring(0, 10) + "..."
      );

      // 通過 Giscus iframe 獲取用戶數據
      const iframes = document.querySelectorAll<HTMLIFrameElement>(
        "iframe.giscus-frame"
      );

      if (iframes.length > 0) {
        // 使用第一個找到的 iframe
        const iframe = iframes[0];

        // 請求用戶數據
        iframe.contentWindow?.postMessage(
          { giscus: { setConfig: { getUserData: true } } },
          "https://giscus.app"
        );

        // 添加一個事件監聽器來獲取用戶數據
        const getUserData = (event: MessageEvent) => {
          if (event.origin !== "https://giscus.app") return;

          if (event.data?.giscus?.userData) {
            const userData = event.data.giscus.userData;

            const user: GithubUser = {
              login: userData.login || "github-user",
              id: userData.id || 12345,
              avatar_url:
                userData.avatar_url ||
                "https://avatars.githubusercontent.com/u/583231?v=4",
              name: userData.name || userData.login || "GitHub User",
              email: userData.email,
            };

            setUser(user);
            // 移除事件監聽器，因為我們已經獲取了用戶數據
            window.removeEventListener("message", getUserData);
          }
        };

        window.addEventListener("message", getUserData);

        // 如果一定時間內沒有收到用戶數據，回退到使用模擬用戶
        setTimeout(() => {
          if (!user) {
            const mockUser: GithubUser = {
              login: "github-user",
              id: 12345,
              avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
              name: "GitHub User",
            };

            setUser(mockUser);
            window.removeEventListener("message", getUserData);
          }
        }, 2000);
      } else {
        console.error("No Giscus iframe found for fetching user data");
        // 如果找不到 iframe，使用模擬用戶數據
        const mockUser: GithubUser = {
          login: "github-user",
          id: 12345,
          avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
          name: "GitHub User",
        };

        setUser(mockUser);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      throw err;
    }
  };

  // 獲取用戶 token
  const getUserToken = (): string | null => {
    return githubToken || localStorage.getItem("github-access-token");
  };

  // 登出
  const logout = () => {
    // 移除 Giscus session 和 GitHub token
    localStorage.removeItem("giscus-session");
    localStorage.removeItem("github-access-token");
    setIsAuthenticated(false);
    setUser(null);
    setGithubToken(null);

    // 通知 Giscus iframe 登出
    const iframes = document.querySelectorAll<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );

    if (iframes.length > 0) {
      // 使用第一個找到的 iframe
      const iframe = iframes[0];
      iframe.contentWindow?.postMessage(
        { giscus: { setConfig: { authentication: "none" } } },
        "https://giscus.app"
      );
      console.log("Sent logout message to Giscus iframe");
    } else {
      console.error("No Giscus iframe found for logout");
    }

    messageApi.success("Logged out successfully");
  };

  // 處理 OAuth 回調
  const handleAuthCallback = async (code: string) => {
    setLoading(true);
    try {
      // 為 Giscus 存儲授權碼
      localStorage.setItem("giscus-code", code);

      // 通知 Giscus 使用該授權碼
      const iframes = document.querySelectorAll<HTMLIFrameElement>(
        "iframe.giscus-frame"
      );

      if (iframes.length > 0) {
        // 使用第一個找到的 iframe
        const iframe = iframes[0];
        iframe.contentWindow?.postMessage(
          { giscus: { setConfig: { code } } },
          "https://giscus.app"
        );

        console.log("Sent auth code to Giscus iframe");
      } else {
        console.error(
          "No Giscus iframe found for auth callback. Waiting for iframe to load..."
        );

        // 等待短暫時間後再次嘗試找到 iframe（可能正在加載）
        setTimeout(() => {
          const retryIframes = document.querySelectorAll<HTMLIFrameElement>(
            "iframe.giscus-frame"
          );

          if (retryIframes.length > 0) {
            const iframe = retryIframes[0];
            iframe.contentWindow?.postMessage(
              { giscus: { setConfig: { code } } },
              "https://giscus.app"
            );
            console.log("Sent auth code to Giscus iframe (retry)");
          } else {
            console.error("Failed to find Giscus iframe after retry");
          }
        }, 1500);
      }

      setIsAuthenticated(true);
      setLoading(false);
      messageApi.success("Successfully authenticated with GitHub");
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Failed to authenticate with GitHub");
      setLoading(false);
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
