import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  List,
  Tag,
  Avatar,
  Tabs,
  Space,
  Button,
  Badge,
  Tooltip,
  Divider,
  Spin,
} from "antd";
import {
  GithubOutlined,
  BookOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  EyeOutlined,
  StarOutlined,
  ForkOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import VineAnimation from "../components/VineAnimation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { fetchGithubSingleIssue, fetchGithubIssues } from "../api/githubApi";
dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// 定義Issue類型
interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  created_at: string;
  repository: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  status: string;
  comments: number;
  user: {
    login: string;
    avatar_url: string;
  };
  state: string; // 添加state字段
}

// 定義Repository類型
interface Repository {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

const CreatedIssuesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取作者倉庫的issues
  useEffect(() => {
    const fetchAuthorIssues = async () => {
      try {
        setLoading(true);

        const repoResponse = await fetchGithubSingleIssue(
          import.meta.env.VITE_GITHUB_REPO_OWNER,
          import.meta.env.VITE_GITHUB_REPO_NAME
        );

        const repoData: Repository = {
          name: repoResponse.name,
          full_name: repoResponse.full_name,
          description: repoResponse.description,
          stargazers_count: repoResponse.stargazers_count,
          forks_count: repoResponse.forks_count,
          open_issues_count: repoResponse.open_issues_count,
        };

        setRepository(repoData);

        // 獲取issues
        const issuesResponse = await fetchGithubIssues(
          import.meta.env.VITE_GITHUB_REPO_OWNER,
          import.meta.env.VITE_GITHUB_REPO_NAME
        );

        // 格式化issues數據
        const formattedIssues = issuesResponse.map(
          (issue: Record<string, unknown>) => ({
            id: Number(issue.id),
            number: Number(issue.number),
            title: String(issue.title || ""),
            body: String(issue.body || ""),
            created_at: String(issue.created_at || ""),
            repository: `${import.meta.env.VITE_GITHUB_REPO_OWNER}/${
              import.meta.env.VITE_GITHUB_REPO_NAME
            }`,
            labels: (
              (issue.labels as Array<Record<string, unknown>>) || []
            ).map((label) => ({
              name: String(label.name || ""),
              color: String(label.color || ""),
            })),
            status: String(issue.state || ""),
            state: String(issue.state || ""),
            comments: Number(issue.comments || 0),
            user: {
              login: String(
                ((issue.user as Record<string, unknown>) || {}).login || ""
              ),
              avatar_url: String(
                ((issue.user as Record<string, unknown>) || {}).avatar_url || ""
              ),
            },
          })
        );

        setIssues(formattedIssues);
        setFilteredIssues(formattedIssues);
        setLoading(false);
      } catch (error) {
        console.error("獲取作者issues失敗:", error);
        setError("獲取issues失敗，請稍後重試");
        setLoading(false);
      }
    };

    fetchAuthorIssues();
  }, []);

  // 根據activeTab篩選issues
  useEffect(() => {
    if (activeTab === "1") {
      // 全部issues
      setFilteredIssues(issues);
    } else if (activeTab === "2") {
      // 開放的issues
      setFilteredIssues(issues.filter((issue) => issue.state === "open"));
    } else if (activeTab === "3") {
      // 關閉的issues
      setFilteredIssues(issues.filter((issue) => issue.state === "closed"));
    }
  }, [activeTab, issues]);

  const getStatusColor = (status: string) => {
    return status === "open" ? "green" : "red";
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="created-issues-page">
      <VineAnimation className="vine-background" />

      <div className="content-container">
        <div className="page-header">
          <Typography.Title level={2} style={{ marginBottom: 12 }}>
            Author Issues
          </Typography.Title>
          <Paragraph>
            Browse through issues from the author's repository.
          </Paragraph>
        </div>

        {loading ? (
          <div
            className="loading-container"
            style={{ textAlign: "center", padding: "48px 0" }}
          >
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16 }}>Loading issues...</Paragraph>
          </div>
        ) : error ? (
          <div
            className="error-container"
            style={{ textAlign: "center", padding: "48px 0" }}
          >
            <Paragraph type="danger">{error}</Paragraph>
            <Button
              type="primary"
              onClick={handleRetry}
              icon={<ReloadOutlined />}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {repository && (
              <div className="repository-overview">
                <Card style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <GithubOutlined style={{ fontSize: 24, marginRight: 12 }} />
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        {repository.full_name}
                      </Title>
                      <Paragraph style={{ marginBottom: 0 }}>
                        {repository.description}
                      </Paragraph>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <Tooltip title="Stars">
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <StarOutlined
                          style={{ marginRight: 4, color: "#faad14" }}
                        />
                        {repository.stargazers_count}
                      </span>
                    </Tooltip>
                    <Tooltip title="Forks">
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <ForkOutlined
                          style={{ marginRight: 4, color: "#52c41a" }}
                        />
                        {repository.forks_count}
                      </span>
                    </Tooltip>
                    <Tooltip title="Open Issues">
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <EyeOutlined
                          style={{ marginRight: 4, color: "#1890ff" }}
                        />
                        {repository.open_issues_count}
                      </span>
                    </Tooltip>
                  </div>
                </Card>
              </div>
            )}

            <Divider style={{ margin: "24px 0" }} />

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="issue-tabs"
            >
              <TabPane
                tab={
                  <span>
                    All Issues{" "}
                    <Badge
                      count={issues.length}
                      style={{ marginLeft: 8, backgroundColor: "#5e2a69" }}
                    />
                  </span>
                }
                key="1"
              />
              <TabPane
                tab={
                  <span>
                    Open{" "}
                    <Badge
                      count={issues.filter((i) => i.state === "open").length}
                      style={{ marginLeft: 8, backgroundColor: "#52c41a" }}
                    />
                  </span>
                }
                key="2"
              />
              <TabPane
                tab={
                  <span>
                    Closed{" "}
                    <Badge
                      count={issues.filter((i) => i.state === "closed").length}
                      style={{ marginLeft: 8, backgroundColor: "#f5222d" }}
                    />
                  </span>
                }
                key="3"
              />
            </Tabs>

            {filteredIssues.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <BookOutlined
                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                />
                <Paragraph>
                  No issues found for the selected criteria.
                </Paragraph>
              </div>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={filteredIssues}
                renderItem={(issue) => (
                  <Card
                    className="issue-card"
                    style={{ marginBottom: 16 }}
                    hoverable
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <Avatar src={issue.user.avatar_url} size={40} />
                      <div style={{ marginLeft: 12, flex: 1 }}>
                        <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                          {issue.title}
                        </Title>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <Tag color={getStatusColor(issue.status)}>
                            {issue.status.toUpperCase()}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            Created {dayjs(issue.created_at).fromNow()}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            <GithubOutlined style={{ marginRight: 4 }} />
                            {issue.repository}
                          </Text>
                        </div>
                      </div>
                      <Space style={{ marginLeft: 8 }}>
                        <Tag icon={<CommentOutlined />} color="processing">
                          {issue.comments} comments
                        </Tag>
                      </Space>
                    </div>

                    <div className="markdown-body" style={{ marginBottom: 12 }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {issue.body}
                      </ReactMarkdown>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space size="small" wrap>
                        <TagsOutlined style={{ color: "#5e2a69" }} />
                        {issue.labels.map((label) => (
                          <Tag key={label.name} color={`#${label.color}`}>
                            {label.name}
                          </Tag>
                        ))}
                      </Space>
                      <a
                        href={`https://github.com/${issue.repository}/issues/${issue.number}`}
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreatedIssuesPage;
