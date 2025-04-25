import React, { useEffect, useRef } from "react";

interface UtterancesCommentsProps {
  repo: string;
  issueTerm: string;
  label?: string;
  theme?:
    | "github-light"
    | "github-dark"
    | "preferred-color-scheme"
    | "github-dark-orange";
}

const UtterancesComments: React.FC<UtterancesCommentsProps> = ({
  repo,
  issueTerm,
  label,
  theme = "github-light",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    const attributes = {
      src: "https://utteranc.es/client.js",
      repo,
      "issue-term": issueTerm,
      label: label || "",
      theme,
      crossOrigin: "anonymous",
      async: "true",
    };

    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    // 清空容器并添加新的评论
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [repo, issueTerm, label, theme]);

  return <div ref={containerRef} />;
};

export default UtterancesComments;
