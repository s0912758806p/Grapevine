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

    // Add responsive styling to the Utterances iframe when it loads
    const handleUtterancesLoad = () => {
      const utterancesFrame = document.querySelector('.utterances-frame') as HTMLIFrameElement;
      if (utterancesFrame) {
        utterancesFrame.style.maxWidth = '100%';
      }
    };

    // Use MutationObserver to detect when Utterances adds iframe to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          handleUtterancesLoad();
        }
      });
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      observer.disconnect();
    };
  }, [repo, issueTerm, label, theme]);

  return <div ref={containerRef} className="utterances-container" style={{ width: '100%', overflow: 'hidden' }} />;
};

export default UtterancesComments;
