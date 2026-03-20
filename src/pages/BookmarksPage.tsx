import React, { useState } from "react";
import {
  Typography,
  Empty,
  Button,
  Tag,
  Card,
  Space,
  Tabs,
  Popconfirm,
} from "antd";
import {
  BookOutlined,
  DeleteOutlined,
  LinkOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import {
  removeBookmark,
  clearBookmarks,
  BookmarkType,
} from "../store/bookmarksSlice";

const { Title, Text, Paragraph } = Typography;

const TYPE_LABELS: Record<BookmarkType, string> = {
  article: "Articles",
  job:     "Jobs",
  rumor:   "Rumors",
  weekly:  "Weekly",
};

const TYPE_COLORS: Record<BookmarkType, { bg: string; text: string; border: string }> = {
  article: { bg: "#f5eef7", text: "#5e2a69", border: "#d4aede" },
  job:     { bg: "#edf5f0", text: "#1e5631", border: "#a3cbb0" },
  rumor:   { bg: "#fff7e6", text: "#b8860b", border: "#f7c948" },
  weekly:  { bg: "#f0f5ff", text: "#1a4a6e", border: "#aac8e8" },
};

const BookmarksPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.bookmarks);
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredItems =
    activeTab === "all"
      ? items
      : items.filter((b) => b.type === activeTab);

  const counts: Record<string, number> = { all: items.length };
  for (const type of Object.keys(TYPE_LABELS) as BookmarkType[]) {
    counts[type] = items.filter((b) => b.type === type).length;
  }

  const tabItems = [
    { key: "all", label: `All (${counts.all})` },
    ...Object.entries(TYPE_LABELS).map(([key, label]) => ({
      key,
      label: `${label} (${counts[key] ?? 0})`,
    })),
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div>
          <Title level={2} style={{ color: "#1a1025", marginBottom: 8, fontWeight: 700 }}>
            <BookOutlined style={{ color: "#5e2a69", marginRight: 10 }} />
            Bookmarks
          </Title>
          <Paragraph style={{ color: "#5c5570", margin: 0 }}>
            Saved content — stored locally in your browser.
          </Paragraph>
        </div>
        {items.length > 0 && (
          <Popconfirm
            title="Clear all bookmarks?"
            okText="Clear"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => dispatch(clearBookmarks())}
          >
            <Button
              icon={<ClearOutlined />}
              type="text"
              danger
              style={{ marginTop: 8 }}
            >
              Clear all
            </Button>
          </Popconfirm>
        )}
      </div>

      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 24 }}
      />

      {filteredItems.length === 0 ? (
        <Empty
          description={
            <Text style={{ color: "#9b92a8" }}>
              {activeTab === "all"
                ? "No bookmarks yet. Save articles, jobs, and rumors to see them here."
                : `No ${TYPE_LABELS[activeTab as BookmarkType]?.toLowerCase() ?? activeTab} bookmarks.`}
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredItems.map((bookmark) => {
            const colors = TYPE_COLORS[bookmark.type];
            return (
              <Card
                key={bookmark.id}
                bordered
                size="small"
                style={{ borderColor: "#e8e3ed", borderRadius: 10 }}
                extra={
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={() => dispatch(removeBookmark(bookmark.id))}
                  />
                }
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <Tag
                    style={{
                      background: colors.bg,
                      borderColor: colors.border,
                      color: colors.text,
                      fontSize: 11,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {TYPE_LABELS[bookmark.type]}
                  </Tag>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={bookmark.url}>
                      <Text
                        strong
                        style={{
                          color: "#1a1025",
                          fontSize: 14,
                          display: "block",
                          marginBottom: 4,
                        }}
                        ellipsis
                      >
                        <LinkOutlined style={{ marginRight: 6, color: "#5e2a69" }} />
                        {bookmark.title}
                      </Text>
                    </Link>
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <Space wrap size={4} style={{ marginBottom: 4 }}>
                        {bookmark.tags.map((tag) => (
                          <Tag key={tag} style={{ margin: 0, fontSize: 11 }}>
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    )}
                    <Text style={{ color: "#9b92a8", fontSize: 11 }}>
                      Saved {new Date(bookmark.savedAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
