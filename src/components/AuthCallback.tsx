import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Spin, Typography, Result } from "antd";

const { Title, Text } = Typography;

const AuthCallback: React.FC = () => {
  const { handleAuthCallback, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processAuth = async () => {
      // 從 URL 獲取授權碼
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get("code");

      if (code) {
        try {
          // 處理認證回調
          await handleAuthCallback(code);

          // 認證成功後，重定向到主頁
          navigate("/");
        } catch (err) {
          // 錯誤處理在 AuthContext 中進行
          console.error("Authentication failed:", err);
        }
      } else {
        // 如果沒有授權碼，則可能是用戶取消了授權或出現其他問題
        navigate("/");
      }
    };

    processAuth();
  }, [handleAuthCallback, location.search, navigate]);

  if (loading) {
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
              background: "#FF4500",
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

  return null;
};

export default AuthCallback;
