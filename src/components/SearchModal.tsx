import React, { useState, useEffect, useRef } from "react";
import { Modal, Input, List, Tag, Typography, Spin, Empty } from "antd";
import { SearchOutlined, FileTextOutlined, CodeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

interface SearchResult {
  id: number;
  title: string;
  url: string;
  type: "article" | "job";
  labels: string[];
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchResults(query);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const fetchResults = async (q: string) => {
    setLoading(true);
    try {
      const token = import.meta.env.VITE_GITHUB_TOKEN;
      const headers: HeadersInit = token
        ? { Authorization: `token ${token}` }
        : {};

      // Search across known repos
      const repos = [
        import.meta.env.VITE_GITHUB_REPO,
        import.meta.env.VITE_F2E_JOBS_REPO,
      ]
        .filter(Boolean)
        .map((r: string) => `repo:${r}`)
        .join(" ");

      const searchQuery = repos ? `${q} ${repos}` : q;
      const res = await fetch(
        `https://api.github.com/search/issues?q=${encodeURIComponent(searchQuery)}&per_page=10`,
        { headers }
      );
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      const mapped: SearchResult[] = (data.items ?? []).map((item: any) => ({
        id: item.number,
        title: item.title,
        url: item.html_url,
        type: item.repository_url?.includes("f2e") ? "job" : "article",
        labels: item.labels?.map((l: any) => l.name) ?? [],
      }));
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onClose();
    // Navigate to internal route if possible
    if (result.type === "job") {
      navigate(`/f2e-issue/${result.id}`);
    } else {
      navigate(`/issue/${result.id}`);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={580}
      styles={{
        content: { padding: 0, borderRadius: 12, overflow: "hidden" },
        mask: { backdropFilter: "blur(4px)" },
      }}
      closable={false}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0ecf5",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <SearchOutlined style={{ color: "#9b92a8", fontSize: 16 }} />
        <Input
          ref={inputRef}
          variant="borderless"
          placeholder="Search articles, jobs, community..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ fontSize: 15, color: "#1a1025", padding: 0 }}
          onPressEnter={() => {
            if (query.trim()) {
              onClose();
              navigate(`/essays?q=${encodeURIComponent(query)}`);
            }
          }}
        />
        <Tag style={{ flexShrink: 0, color: "#9b92a8", borderColor: "#e8e3ed", fontSize: 11 }}>
          ESC
        </Tag>
      </div>

      <div style={{ maxHeight: 400, overflowY: "auto", padding: "8px 0" }}>
        {loading ? (
          <div style={{ padding: "32px", textAlign: "center" }}>
            <Spin size="small" />
          </div>
        ) : results.length > 0 ? (
          <List
            dataSource={results}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  borderBottom: "none",
                }}
                className="search-result-item"
                onClick={() => handleSelect(item)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  {item.type === "job" ? (
                    <CodeOutlined style={{ color: "#1e5631", flexShrink: 0 }} />
                  ) : (
                    <FileTextOutlined style={{ color: "#5e2a69", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{ color: "#1a1025", display: "block", fontSize: 14 }}
                      ellipsis
                    >
                      {item.title}
                    </Text>
                    {item.labels.length > 0 && (
                      <div style={{ marginTop: 2 }}>
                        {item.labels.slice(0, 3).map((l) => (
                          <Tag key={l} style={{ fontSize: 11, margin: "0 4px 0 0" }}>
                            {l}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                  <Tag
                    style={{
                      flexShrink: 0,
                      background: item.type === "job" ? "#edf5f0" : "#f5eef7",
                      borderColor: item.type === "job" ? "#a3cbb0" : "#d4aede",
                      color: item.type === "job" ? "#1e5631" : "#5e2a69",
                      fontSize: 11,
                    }}
                  >
                    {item.type}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        ) : query.length >= 2 && !loading ? (
          <Empty
            description={<Text style={{ color: "#9b92a8" }}>No results for "{query}"</Text>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "24px 0" }}
          />
        ) : (
          <div style={{ padding: "16px", textAlign: "center" }}>
            <Text style={{ color: "#9b92a8", fontSize: 13 }}>
              Type to search across articles and jobs
            </Text>
          </div>
        )}
      </div>

      {query.length >= 2 && !loading && (
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid #f0ecf5",
            textAlign: "right",
          }}
        >
          <Text style={{ color: "#9b92a8", fontSize: 12 }}>
            Press <kbd style={{ background: "#f5f3f0", padding: "1px 4px", borderRadius: 3 }}>Enter</kbd> to search all
          </Text>
        </div>
      )}
    </Modal>
  );
};

export default SearchModal;
