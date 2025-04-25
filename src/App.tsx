import { Provider } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { store } from "./store";
import AppLayout from "./components/AppLayout";
import AntConfigProvider from "./components/AntConfigProvider";
import GlobalGiscus from "./components/GlobalGiscus";
import { useAuth } from "./auth/AuthContext";
import { useEffect } from "react";
import "./App.scss";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();

  // 處理認證回調（防止404錯誤）
  useEffect(() => {
    // 檢查URL是否包含GitHub認證碼
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");

    if (code && location.pathname !== "/auth/callback") {
      // 如果URL包含認證碼但不是在回調路徑上，手動處理認證
      const processAuth = async () => {
        try {
          await handleAuthCallback(code);
          // 清除URL中的code參數
          navigate("/", { replace: true });
        } catch (err) {
          console.error("Authentication failed:", err);
        }
      };

      processAuth();
    }
  }, [location, handleAuthCallback, navigate]);

  return (
    <Provider store={store}>
      <AntConfigProvider>
        <GlobalGiscus />
        <AppLayout>
          <Outlet />
        </AppLayout>
      </AntConfigProvider>
    </Provider>
  );
}

export default App;
