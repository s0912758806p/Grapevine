import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Spin, Typography, Result, Alert } from "antd";
import {
  getCodeFromUrl,
  getStateFromUrl,
  validateOAuthState,
} from "../api/githubAuth";

const { Title, Text } = Typography;

const AuthCallback: React.FC = () => {
  const { handleAuthCallback, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stateError, setStateError] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState<boolean>(false);

  useEffect(() => {
    const processAuth = async () => {
      // 設置處理標記
      setProcessingAuth(true);

      // 獲取授權碼和 state
      const code = getCodeFromUrl();
      const state = getStateFromUrl();

      // 驗證 state 以防止 CSRF 攻擊
      if (state && !validateOAuthState(state)) {
        setStateError(
          "Invalid state parameter. This might be a CSRF attack attempt."
        );
        setProcessingAuth(false);
        return;
      }

      if (code) {
        try {
          // 處理認證回調
          await handleAuthCallback(code);

          // 給 Giscus 相關處理一些時間
          setTimeout(() => {
            // 認證成功後，重定向到主頁
            navigate("/");
            setProcessingAuth(false);
          }, 1000); // 等待 1 秒，確保 Giscus 通知能夠完成
        } catch (err) {
          // 錯誤處理在 AuthContext 中進行
          console.error("Authentication failed:", err);
          setProcessingAuth(false);
        }
      } else {
        // 如果沒有授權碼，則可能是用戶取消了授權或出現其他問題
        navigate("/");
        setProcessingAuth(false);
      }
    };

    processAuth();
  }, [handleAuthCallback, location.search, navigate]);

  if (stateError) {
    return (
      <Result
        status="error"
        title="Security Error"
        subTitle={stateError}
        extra={[
          <button
            key="login"
            onClick={() => navigate("/")}
            style={{
              padding: "8px 16px",
              background: "#1677ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Return Home
          </button>,
        ]}
      />
    );
  }

  if (loading || processingAuth) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 24 }}>
          Logging you in...
        </Title>
        <Text type="secondary">
          Please wait while we complete the authentication process.
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Authentication Failed"
        subTitle={
          error || "There was a problem logging you in. Please try again."
        }
        extra={[
          <button
            key="login"
            onClick={() => navigate("/")}
            style={{
              padding: "8px 16px",
              background: "#1677ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Return Home
          </button>,
        ]}
      />
    );
  }

  return <Alert message="Redirecting..." type="info" />;
};

export default AuthCallback;
