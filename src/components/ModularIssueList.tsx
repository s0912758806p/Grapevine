import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Skeleton,
  Empty,
  Flex,
  Avatar,
  Badge,
  Tooltip,
} from "antd";
import {
  ReloadOutlined,
  LinkOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { fetchF2EIssuesThunk, F2EIssueType } from "../store/f2eIssuesSlice";
import {
  fetchRuanyfWeeklyIssuesThunk,
  RuanyfWeeklyIssueType,
} from "../store/ruanyfWeeklySlice";
import { fetchGithubIssues } from "../api/repositoryApi";
import { formatGitHubIssue } from "../utils";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
const { Text, Title } = Typography;

// Define common Issue type
export interface BaseIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  created_at: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  comments: number;
  user: {
    login: string;
    avatar_url: string;
  };
  state: string;
  html_url: string;
}

// F2E thunk response type
interface F2EResponse {
  data: F2EIssueType[];
  page: number;
  perPage: number;
}

// Map F2EIssueType to BaseIssue
const mapF2EIssueToBaseIssue = (issue: F2EIssueType): BaseIssue => {
  return {
    ...issue,
    state: "open", // F2E issues don't have a state property, assume they're all open
  };
};

interface ModularIssueListProps {
  type: "f2e-jobs" | "author-issues" | "ruanyf-weekly";
}

const ModularIssueList: React.FC<ModularIssueListProps> = ({ type }) => {
  const [issues, setIssues] = useState<BaseIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [perPage] = useState<number>(10);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Reset and reload when tab type changes
  useEffect(() => {
    setIssues([]);
    setCurrentPage(1);
    setHasMorePages(false);
    setError(null);
    fetchIssues(1);
  }, [type]);

  const fetchIssues = async (page: number) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      let targetIssues: BaseIssue[] = [];

      if (type === "f2e-jobs") {
        // Fetch F2E Jobs using the existing Redux thunk
        const f2eResponse = (await dispatch(
          fetchF2EIssuesThunk({ page, perPage }),
        ).unwrap()) as F2EResponse;

        // Access data from the result and map to BaseIssue type
        targetIssues = f2eResponse.data.map(mapF2EIssueToBaseIssue);
      } else if (type === "ruanyf-weekly") {
        // Use the dedicated Redux thunk instead of a direct API call
        const result = await dispatch(
          fetchRuanyfWeeklyIssuesThunk({ page, perPage }),
        ).unwrap();

        targetIssues = result.data.map(
          (issue: RuanyfWeeklyIssueType): BaseIssue => ({
            id: issue.number,
            number: issue.number,
            title: issue.title,
            body: issue.body || "",
            created_at: issue.published_at || issue.created_at || "",
            labels: (issue.labels || []).map((l) => ({
              name: l.name,
              color: l.color || "",
            })),
            comments: issue.comments || 0,
            user: issue.user
              ? {
                  login: issue.user.login,
                  avatar_url: issue.user.avatar_url || "",
                }
              : { login: "unknown", avatar_url: "" },
            state: "open",
            html_url: issue.html_url || "",
          }),
        );
      } else {
        // author-issues: fetch from the Grapevine community repository
        const owner = import.meta.env.VITE_GITHUB_REPO_OWNER;
        const repo = import.meta.env.VITE_GITHUB_REPO_NAME;
        const githubResponse = await fetchGithubIssues(
          owner,
          repo,
          page,
          perPage,
        );

        targetIssues = (githubResponse as Record<string, unknown>[])
          .filter((issue) => !issue.pull_request) // exclude pull requests
          .map((issue) => {
            const formatted = formatGitHubIssue(
              issue,
              owner,
              repo,
              `${owner}/${repo}`,
            );
            return {
              ...formatted,
              body: formatted.body || "",
              html_url: String(issue.html_url || ""),
            };
          });
      }

      setIssues((prev) =>
        page > 1 ? [...prev, ...targetIssues] : targetIssues,
      );
      // Check if more pages are available by comparing returned data length with perPage
      setHasMorePages(targetIssues.length === perPage);

      // Always update currentPage to the requested page number
      // This ensures proper pagination regardless of response structure
      setCurrentPage(page);
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
      setError(
        `Failed to load ${
          type === "f2e-jobs"
            ? "F2E Jobs"
            : type === "ruanyf-weekly"
              ? "Ruanyf Weekly"
              : "Author Issues"
        }. Please try again later.`,
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setIssues([]);
    fetchIssues(1);
  };

  const handleLoadMore = () => {
    if (hasMorePages) {
      fetchIssues(currentPage + 1);
    }
  };

  const renderSkeletons = () => {
    return Array(3)
      .fill(null)
      .map((_, index) => (
        <Card
          key={`skeleton-${index}`}
          style={{ marginBottom: 16, borderRadius: 4 }}
        >
          <Skeleton active avatar paragraph={{ rows: 3 }} />
        </Card>
      ));
  };

  const renderEmptyState = () => {
    return (
      <Empty
        description={`No ${
          type === "f2e-jobs"
            ? "F2E job posts"
            : type === "ruanyf-weekly"
              ? "Ruanyf Weekly posts"
              : "author issues"
        } found`}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ margin: "40px 0" }}
      />
    );
  };

  // Get the appropriate details URL based on issue type
  const getIssueDetailUrl = (issue: BaseIssue) => {
    return type === "f2e-jobs"
      ? `/f2e-issue/${issue.number}`
      : type === "ruanyf-weekly"
        ? `/ruanyf-weekly/${issue.number}`
        : `/issue/${issue.number}`;
  };

  const getListTitle = () => {
    return type === "f2e-jobs"
      ? "F2E Jobs"
      : type === "ruanyf-weekly"
        ? "Ruanyf Weekly"
        : "Author Issues";
  };

  if (loading && issues.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading{" "}
        {type === "f2e-jobs"
          ? "F2E Jobs"
          : type === "ruanyf-weekly"
            ? "Ruanyf Weekly"
            : "Author Issues"}
        ...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="modular-issues-container">
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: 16, padding: "0 16px" }}
      >
        <Title level={3} style={{ margin: 0 }}>
          {getListTitle()}
        </Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading && issues.length > 0}
        >
          Refresh
        </Button>
      </Flex>

      <div className="modular-issues-list">
        {loading && issues.length === 0 ? (
          renderSkeletons()
        ) : issues.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {issues.map((issue, index) => (
              <Card
                key={`${type}-${issue.id}-${index}`}
                style={{
                  marginBottom: 16,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
                hoverable
                onClick={() => {
                  navigate(getIssueDetailUrl(issue));
                }}
              >
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ marginBottom: 8 }}>
                    <Space>
                      {type === "author-issues" && (
                        <Avatar src={issue.user.avatar_url} size="small" />
                      )}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Posted by {issue.user.login}{" "}
                        {dayjs(issue.created_at).fromNow()}
                      </Text>
                      {type === "author-issues" && (
                        <Badge
                          status={issue.state === "open" ? "success" : "error"}
                          text={issue.state}
                        />
                      )}
                    </Space>
                  </div>
                  <Link
                    to={getIssueDetailUrl(issue)}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <Title
                      level={5}
                      style={{ margin: "0 0 8px", color: "#222" }}
                    >
                      {issue.title}
                    </Title>
                  </Link>
                  <div style={{ marginBottom: 8 }}>
                    {issue.labels.length > 0 && (
                      <Space wrap>
                        {issue.labels.map((label) => (
                          <Tag
                            key={label.name}
                            color={`#${label.color}`}
                            style={{ borderRadius: 20 }}
                          >
                            {label.name}
                          </Tag>
                        ))}
                      </Space>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Space>
                      <Link to={getIssueDetailUrl(issue)}>
                        <Button type="default" size="small">
                          View Details
                        </Button>
                      </Link>
                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="text"
                          icon={<LinkOutlined />}
                          size="small"
                        >
                          View on GitHub
                        </Button>
                      </a>
                      <Tooltip title="Comments">
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <CommentOutlined style={{ marginRight: 4 }} />
                          {issue.comments}
                        </span>
                      </Tooltip>
                    </Space>
                  </div>
                </div>
              </Card>
            ))}

            {hasMorePages && (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <Button
                  onClick={handleLoadMore}
                  loading={loadingMore}
                  disabled={loadingMore}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModularIssueList;
