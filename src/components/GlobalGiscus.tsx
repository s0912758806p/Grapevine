import React from "react";
import Giscus from "@giscus/react";
import { giscusConfig } from "../utils/giscusConfig";

/**
 * 隱藏的全局 Giscus 組件
 * 用於確保在任何頁面都能使用 GitHub 登錄
 */
const GlobalGiscus: React.FC = () => {
  return (
    <div
      className="giscus-frame-container"
      style={{
        position: "fixed",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        visibility: "hidden",
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      <Giscus
        id="global-giscus"
        repo={giscusConfig.repo}
        repoId={giscusConfig.repoId}
        category={giscusConfig.category}
        categoryId={giscusConfig.categoryId}
        mapping={giscusConfig.mapping}
        term={location.pathname}
        reactionsEnabled="0"
        emitMetadata="1"
        inputPosition="top"
        theme="light"
        lang="en"
        loading="lazy"
      />
    </div>
  );
};

export default GlobalGiscus;
