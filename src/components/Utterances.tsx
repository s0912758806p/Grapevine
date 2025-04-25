import React, { useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { UtterancesConfig } from "../utils/utterancesConfig";

// 擴展基本配置，可以添加更多自定義屬性
interface UtterancesProps extends UtterancesConfig {
  className?: string;
  showUserInfo?: boolean;
}

const Utterances: React.FC<UtterancesProps> = ({
  repo,
  issueTerm,
  label,
  theme,
  crossOrigin,
  className = "",
  showUserInfo = true,
}) => {
  const { isAuthenticated, user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const utterancesLoaded = useRef(false);

  useEffect(() => {
    // 避免重複加載
    if (utterancesLoaded.current) {
      return;
    }

    const loadUtterances = () => {
      if (!containerRef.current || !repo) return;

      // 清空容器
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      // 創建 utterances script
      const script = document.createElement("script");
      script.src = "https://utteranc.es/client.js";
      script.async = true;
      script.crossOrigin = crossOrigin || "anonymous";
      script.setAttribute("repo", repo);
      script.setAttribute("issue-term", issueTerm);
      script.setAttribute("theme", theme);

      if (label) {
        script.setAttribute("label", label);
      }

      // 將腳本添加到容器
      containerRef.current.appendChild(script);
      utterancesLoaded.current = true;

      console.log("Utterances 腳本已加載", { repo, issueTerm, theme });
    };

    // 加載 utterances
    loadUtterances();

    // 主題變化時重新加載
    return () => {
      utterancesLoaded.current = false;
    };
  }, [repo, issueTerm, label, theme, crossOrigin]);

  return (
    <div className={`utterances-container ${className}`}>
      {showUserInfo && isAuthenticated && user && (
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <div
            style={{ fontSize: "14px", color: "#389e0d", marginBottom: "8px" }}
          >
            Logged in as <strong>{user.name || user.login}</strong>
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Comments powered by{" "}
            <a
              href="https://utteranc.es"
              target="_blank"
              rel="noopener noreferrer"
            >
              utterances
            </a>
          </div>
        </div>
      )}

      <div ref={containerRef} />
    </div>
  );
};

export default Utterances;
