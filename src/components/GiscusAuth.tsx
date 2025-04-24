import React from "react";
import { Button, message } from "antd";
import { GithubOutlined } from "@ant-design/icons";
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
}

const GiscusAuth: React.FC<GiscusAuthProps> = ({
  repo,
  repoId,
  category,
  categoryId,
  mapping,
  reactionsEnabled = "1",
  emitMetadata = "0",
  inputPosition = "top",
  theme = "light",
}) => {
  const { isAuthenticated } = useAuth();

  const handleSignIn = () => {
    // Trigger the GitHub OAuth flow by sending a message to the giscus iframe
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    if (!iframe) {
      message.error("Cannot find Giscus frame");
      return;
    }

    iframe.contentWindow?.postMessage(
      { giscus: { setConfig: { authentication: true } } },
      "https://giscus.app"
    );
  };

  return (
    <div className="giscus-container">
      {!isAuthenticated && (
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <Button
            type="primary"
            icon={<GithubOutlined />}
            onClick={handleSignIn}
          >
            Sign in with GitHub to comment
          </Button>
        </div>
      )}
      <Giscus
        id="comments"
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping={mapping}
        reactionsEnabled={reactionsEnabled}
        emitMetadata={emitMetadata}
        inputPosition={inputPosition as "top" | "bottom"}
        theme={theme}
      />
    </div>
  );
};

export default GiscusAuth;
