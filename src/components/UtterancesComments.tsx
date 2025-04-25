import React, { useEffect, useRef, useState } from "react";

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
  const [utterancesLoaded, setUtterancesLoaded] = useState(false);

  useEffect(() => {
    setUtterancesLoaded(false);
    
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      if (!document.body.contains(containerRef.current)) return;
      
      const previousUtterances = containerRef.current.querySelector('.utterances');
      if (previousUtterances) {
        containerRef.current.removeChild(previousUtterances);
      }

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

      script.onload = () => {
        setUtterancesLoaded(true);
      };

      try {
        containerRef.current.appendChild(script);
      } catch (error) {
        console.error("Error loading Utterances comments:", error);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      
      if (utterancesLoaded) {
        setUtterancesLoaded(false);
      }
    };
  }, [repo, issueTerm, label, theme]);

  useEffect(() => {
    if (!utterancesLoaded) return;

    const styleUtterancesFrame = () => {
      const utterancesFrame = document.querySelector('.utterances-frame') as HTMLIFrameElement;
      if (utterancesFrame) {
        utterancesFrame.style.maxWidth = '100%';
      }
    };

    styleUtterancesFrame();
    
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          styleUtterancesFrame();
        }
      }
    });

    const utterancesContainer = document.querySelector('.utterances');
    if (utterancesContainer) {
      observer.observe(utterancesContainer, { 
        childList: true, 
        subtree: true 
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [utterancesLoaded]);

  return (
    <div 
      ref={containerRef} 
      className="utterances-container" 
      style={{ width: '100%', overflow: 'hidden' }} 
    />
  );
};

export default UtterancesComments;
