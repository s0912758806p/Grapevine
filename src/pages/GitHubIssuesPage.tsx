import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Typography,
  List,
  Tag,
  Spin,
  Card,
  Avatar,
  Space,
  Button,
  Tabs,
  Badge,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { fetchGithubIssuesThunk, setPage } from "../store/githubIssuesSlice";
import {
  GithubOutlined,
  CommentOutlined,
  TagOutlined,
  ReloadOutlined,
  BookOutlined,
} from "@ant-design/icons";
import VineAnimation from "../components/VineAnimation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./markdown.css"; // 請確保創建這個CSS文件，用於Markdown樣式

dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

interface Label {
  name: string;
  color: string;
}

const GitHubIssuesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { issues, status, error, pagination, hasMorePages } = useSelector(
    (state: RootState) => state.githubIssues
  );
  const loading = status === "loading";
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // 只獲取f2etw/jobs的issues
  useEffect(() => {
    void dispatch(
      fetchGithubIssuesThunk({
        page: 1,
        perPage: 10,
        repository: "f2etw/jobs", // 指定只獲取f2etw/jobs的issues
      })
    );
  }, [dispatch]);

  // 添加滾動事件監聽器用於無限滾動
  useEffect(() => {
    const handleScroll = () => {
      if (listRef.current && !loading && !isLoadingMore && hasMorePages) {
        const { scrollTop, clientHeight, scrollHeight } =
          document.documentElement;
        // 當滾動到底部時（有300px閾值）加載更多
        if (scrollTop + clientHeight >= scrollHeight - 300) {
          loadMoreIssues();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, isLoadingMore, hasMorePages, pagination.currentPage]);

  // 加載更多issues的函數
  const loadMoreIssues = useCallback(() => {
    if (isLoadingMore || !hasMorePages) return;
    setIsLoadingMore(true);
    const nextPage = pagination.currentPage + 1;

    dispatch(setPage(nextPage));
    void dispatch(
      fetchGithubIssuesThunk({
        page: nextPage,
        perPage: pagination.perPage,
        repository: "f2etw/jobs", // 指定只獲取f2etw/jobs的issues
      })
    ).then(() => {
      setIsLoadingMore(false);
    });
  }, [dispatch, pagination, hasMorePages, isLoadingMore]);

  const handleIssueSelect = (issueId: number) => {
    const issueIdString = issueId.toString();

    if (selectedIssue === issueIdString) {
      setSelectedIssue(null);
    } else {
      setSelectedIssue(issueIdString);
    }
  };

  const handleRetry = () => {
    void dispatch(
      fetchGithubIssuesThunk({
        page: 1,
        perPage: 10,
        repository: "f2etw/jobs", // 指定只獲取f2etw/jobs的issues
      })
    );
  };

  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey);
  };

  // 根據活動標籤過濾issues
  const filteredIssues = issues.filter((issue) => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return issue.state === "open";
    if (activeTab === "closed") return issue.state === "closed";
    return true;
  });

  const openCount = issues.filter((issue) => issue.state === "open").length;
  const closedCount = issues.filter((issue) => issue.state === "closed").length;

  return (
    <div className="github-issues-page">
      <VineAnimation className="vine-background" />

      <div className="content-container">
        <div className="page-header">
          <Typography.Title
            level={2}
            style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
          >
            <GithubOutlined style={{ marginRight: 12 }} /> F2E Jobs
          </Typography.Title>
          <Paragraph>
            Browse through F2E job listings from the f2etw/jobs repository. Find
            front-end development opportunities and connect with employers.
          </Paragraph>

          <div
            className="filter-container"
            style={{
              marginBottom: 24,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRetry}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            className="issue-tabs"
          >
            <TabPane
              tab={
                <span>
                  All Jobs{" "}
                  <Badge
                    count={issues.length}
                    style={{ marginLeft: 8, backgroundColor: "#5e2a69" }}
                  />
                </span>
              }
              key="all"
            />
            <TabPane
              tab={
                <span>
                  Open{" "}
                  <Badge
                    count={openCount}
                    style={{ marginLeft: 8, backgroundColor: "#52c41a" }}
                  />
                </span>
              }
              key="open"
            />
            <TabPane
              tab={
                <span>
                  Closed{" "}
                  <Badge
                    count={closedCount}
                    style={{ marginLeft: 8, backgroundColor: "#f5222d" }}
                  />
                </span>
              }
              key="closed"
            />
          </Tabs>
        </div>

        {loading && pagination.currentPage === 1 ? (
          <div className="loading-container">
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16 }}>Loading jobs...</Paragraph>
          </div>
        ) : error ? (
          <div className="error-container">
            <Paragraph type="danger">Error loading jobs: {error}</Paragraph>
            <Button type="primary" onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div
            className="empty-container"
            style={{ textAlign: "center", padding: "48px 0" }}
          >
            <BookOutlined
              style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
            />
            <Paragraph>No jobs found for the selected criteria.</Paragraph>
            <Button onClick={handleRetry}>Refresh</Button>
          </div>
        ) : (
          <div className="issues-container" ref={listRef}>
            <List
              itemLayout="vertical"
              dataSource={filteredIssues}
              renderItem={(issue) => (
                <Card
                  className={`issue-card ${
                    selectedIssue === issue.id.toString()
                      ? "selected-issue"
                      : ""
                  }`}
                  hoverable
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIssueSelect(issue.id);
                  }}
                  style={{
                    marginBottom: 16,
                    border:
                      selectedIssue === issue.id.toString()
                        ? "2px solid #5e2a69"
                        : "1px solid #e8e8e8",
                  }}
                >
                  <div className="issue-header">
                    <Avatar
                      src={issue.user?.avatar_url}
                      alt={issue.user?.login}
                    />
                    <Space
                      direction="vertical"
                      size={0}
                      style={{ marginLeft: 12, flex: 1 }}
                    >
                      <Title level={4} style={{ margin: 0 }}>
                        {issue.title}
                      </Title>
                      <Space size="small" wrap>
                        <Text type="secondary">#{issue.number}</Text>
                        <Text type="secondary">
                          opened {dayjs(issue.created_at).fromNow()} by{" "}
                          {issue.user?.login}
                        </Text>
                        <Tag color="#1890ff">
                          <GithubOutlined style={{ marginRight: 4 }} />
                          f2etw/jobs
                        </Tag>
                      </Space>
                    </Space>
                    <Space>
                      <Tag icon={<CommentOutlined />} color="processing">
                        {issue.comments} comments
                      </Tag>
                      {issue.labels &&
                        issue.labels.map((label: Label) => (
                          <Tag
                            key={label.name}
                            color={`#${label.color}`}
                            icon={<TagOutlined />}
                          >
                            {label.name}
                          </Tag>
                        ))}
                    </Space>
                  </div>

                  <div
                    className="markdown-body"
                    style={{ marginTop: 16, padding: "0 8px" }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {issue.body || ""}
                    </ReactMarkdown>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 16,
                    }}
                  >
                    <a
                      href={`https://github.com/f2etw/jobs/issues/${issue.number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button type="primary" size="small">
                        View on GitHub
                      </Button>
                    </a>
                  </div>
                </Card>
              )}
            />
            {isLoadingMore && (
              <div
                className="loading-more"
                style={{ textAlign: "center", padding: "20px 0" }}
              >
                <Spin />
                <Paragraph style={{ marginTop: 8 }}>
                  Loading more jobs...
                </Paragraph>
              </div>
            )}
            {!isLoadingMore && !hasMorePages && issues.length > 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  color: "#999",
                }}
              >
                <Paragraph>All jobs loaded</Paragraph>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubIssuesPage;
