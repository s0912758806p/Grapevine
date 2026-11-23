"use client";

/**
 * Page-level error boundary, mostly for GitHub outages or rate limits while
 * loading forum data. The top bar and footer stay usable.
 */
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-narrow page">
      <main id="main" className="card empty" style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <strong>暫時載入不了這個頁面</strong>
        <span style={{ fontSize: 14 }}>可能是 GitHub 暫時沒有回應或請求太頻繁，過一下再試通常就好了。</span>
        <div className="row" style={{ justifyContent: "center" }}>
          <button type="button" className="btn btn-primary" onClick={() => retry()}>
            重新載入
          </button>
          <Link href="/" className="btn">
            回到動態牆
          </Link>
        </div>
      </main>
    </div>
  );
}
