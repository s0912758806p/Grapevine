import { useContext } from "react";
import AuthContext from "../auth/AuthContext";
import {
  notifyGiscusAboutLogin,
  notifyGiscusAboutLogout,
} from "../utils/authBridge";

/**
 * Custom hook for accessing authentication functionality
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const {
    isAuthenticated,
    user,
    loading,
    error,
    githubToken,
    login,
    logout: authLogout,
    handleAuthCallback,
    getUserToken: getAuthToken,
  } = context;

  // 增強的登出功能，會通知 Giscus
  const logoutWithNotification = () => {
    // 首先通知 Giscus 用戶已登出
    notifyGiscusAboutLogout();

    // 然後調用原始的登出功能
    authLogout();
  };

  // 獲取用戶 token 的方法
  const getUserToken = async (): Promise<string | null> => {
    // 使用上下文中的方法獲取 token
    return getAuthToken();
  };

  // 處理 OAuth 回調後的登錄成功事件
  const handleLoginSuccess = (token: string) => {
    // 通知 Giscus 用戶已登錄
    notifyGiscusAboutLogin(token);
  };

  return {
    user,
    token: githubToken,
    isAuthenticated,
    loading,
    error,
    login,
    logout: logoutWithNotification,
    getUserToken,
    handleAuthCallback,
    handleLoginSuccess,
  };
};

export default useAuth;
