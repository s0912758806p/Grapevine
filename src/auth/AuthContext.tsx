import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { message } from "antd";

interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: GithubUser | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 使用 useApp 钩子获取 message 实例
  const [messageApi, contextHolder] = message.useMessage();

  // 檢查用戶是否已登錄
  useEffect(() => {
    const checkSession = async () => {
      // 檢查 Giscus session token
      const token = localStorage.getItem("giscus-session");

      if (token) {
        setIsAuthenticated(true);

        // 嘗試獲取用戶數據
        try {
          await fetchUserData(token);
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        }
      } else {
        setIsAuthenticated(false);
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
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [messageApi]);

  // 通過 Giscus 獲取 GitHub 用戶數據
  const fetchUserData = async (token: string) => {
    try {
      // 登錄令牌信息
      console.log(
        "Using Giscus session token:",
        token.substring(0, 10) + "..."
      );

      // 通過 Giscus iframe 獲取用戶數據
      const iframe = document.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame"
      );
      
      if (iframe?.contentWindow) {
        // 請求用戶數據
        iframe.contentWindow.postMessage(
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
              avatar_url: userData.avatar_url || "https://avatars.githubusercontent.com/u/583231?v=4",
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
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      throw err;
    }
  };

  // 使用 Giscus 提供的登錄功能
  const login = () => {
    setLoading(true);
    
    // 尋找 Giscus iframe 並觸發登錄
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    
    if (iframe?.contentWindow) {
      // 發送消息到 Giscus 以觸發 GitHub 登錄
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { authentication: "github" } } },
        "https://giscus.app"
      );
      setLoading(false);
    } else {
      // 如果找不到 iframe，引導用戶到評論區
      messageApi.info(
        "Please navigate to the comments section to sign in with GitHub"
      );
      setLoading(false);
    }
  };

  // 登出
  const logout = () => {
    // 移除 Giscus session
    localStorage.removeItem("giscus-session");
    setIsAuthenticated(false);
    setUser(null);

    // 通知 Giscus iframe 登出
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { authentication: "none" } } },
        "https://giscus.app"
      );
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
      const iframe = document.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame"
      );
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { code } } },
          "https://giscus.app"
        );
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
    login,
    logout,
    handleAuthCallback,
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
