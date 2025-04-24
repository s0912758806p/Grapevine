import React, { useEffect } from "react";
import { message } from "antd";
import Giscus from "@giscus/react";
import { useAuth } from "../auth/AuthContext";

interface GiscusAuthProps {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: "pathname" | "url" | "title" | "og:title" | "specific" | "number";
  reactionsEnabled?: "0" | "1";
  emitMetadata?: "0" | "1";
  inputPosition?: "top" | "bottom";
  theme?: string;
  term?: string;
  lang?: string;
  loading?: "lazy" | "eager";
  crossorigin?: "anonymous" | "use-credentials";
}

const GiscusAuth: React.FC<GiscusAuthProps> = ({
  repo,
  repoId,
  category,
  categoryId,
  mapping,
  reactionsEnabled = "1",
  emitMetadata = "1",
  inputPosition = "top",
  theme = "light",
  term,
  lang = "en",
  loading = "lazy",
  // crossorigin = "anonymous",
}) => {
  const { isAuthenticated, user } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      
      localStorage.setItem("giscus-code", code);
      
      messageApi.info("GitHub authentication code received");
    }
  }, [messageApi]);

  return (
    <div className="giscus-container">
      {contextHolder}      
      {isAuthenticated && user && (
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "#389e0d", marginBottom: "8px" }}>
            Logged in as <strong>{user.name || user.login}</strong>
          </div>
        </div>
      )}
      
      <Giscus
        id="comments"
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping={mapping}
        term={term}
        reactionsEnabled={reactionsEnabled}
        emitMetadata={emitMetadata}
        inputPosition={inputPosition as "top" | "bottom"}
        theme={theme}
        lang={lang}
        loading={loading}
      />
    </div>
  );
};

export default GiscusAuth;
