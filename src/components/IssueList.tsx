import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Tag,
  Space,
  Button,
  Typography,
  Flex,
  Skeleton,
  Empty,
  Card,
  Badge,
} from "antd";
import {
  IssuesCloseOutlined,
  CommentOutlined,
  ReloadOutlined,
  PlusOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RootState, AppDispatch } from "../store";
import {
  fetchGithubIssuesThunk,
  setPage,
  clearIssues,
} from "../store/githubIssuesSlice";

dayjs.extend(relativeTime);
const { Title, Text } = Typography;

const IssueList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { issues, status, error, pagination, hasMorePages } = useSelector(
    (state: RootState) => state.githubIssues
  );
  const { isAuthor } = useSelector((state: RootState) => state.githubIssues);
  const { currentPage, perPage } = pagination;

  useEffect(() => {
    if (issues.length === 0) {
      dispatch(fetchGithubIssuesThunk({ page: 1, perPage }));
    }
  }, [dispatch, perPage, issues.length]);

  const handleRefresh = () => {
    dispatch(clearIssues());
    dispatch(fetchGithubIssuesThunk({ page: 1, perPage }));
  };

  const handleLoadMore = () => {
    if (hasMorePages) {
      dispatch(fetchGithubIssuesThunk({ page: currentPage + 1, perPage }));
      dispatch(setPage(currentPage + 1));
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
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <Empty
          image={
            <IssuesCloseOutlined
              style={{ fontSize: 48, color: "var(--color-fg-muted)" }}
            />
          }
          description={
            <span style={{ color: "var(--color-fg-muted)", fontSize: 16 }}>
              No issues found
            </span>
          }
        >
          {isAuthor && (
            <Link to="/new-issue">
              <Button type="primary" icon={<PlusOutlined />}>
                New issue
              </Button>
            </Link>
          )}
        </Empty>
      </div>
    );
  };

  const getStateIcon = (state: string) => {
    if (state === "open") {
      return (
        <ExclamationCircleFilled style={{ color: "var(--color-success-fg)" }} />
      );
    } else {
      return <CheckCircleFilled style={{ color: "var(--color-danger-fg)" }} />;
    }
  };

  if (status === "loading" && issues.length === 0) {
    return (
      <div className="issue-list">
        <div className="issue-list-header">
          <Flex
            justify="space-between"
            align="center"
            style={{ marginBottom: 16, padding: "0 16px" }}
          >
            <Title level={3} style={{ margin: 0 }}>
              Issues
            </Title>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={status === "loading"}
              >
                Refresh
              </Button>
              {isAuthor && (
                <Link to="/new-issue">
                  <Button type="primary" icon={<PlusOutlined />}>
                    New issue
                  </Button>
                </Link>
              )}
            </Space>
          </Flex>
        </div>
        <div className="issue-list-content">{renderSkeletons()}</div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="issue-list">
        <div className="issue-list-header">
          <Flex
            justify="space-between"
            align="center"
            style={{ marginBottom: 16, padding: "0 16px" }}
          >
            <Title level={3} style={{ margin: 0 }}>
              Issues
            </Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Refresh
              </Button>
            </Space>
          </Flex>
        </div>
        <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
          <p>{error || "Failed to load issues"}</p>
          <p>Please check your .env configuration for GitHub API access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="issue-list">
      <div className="issue-list-header">
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 16, padding: "0 16px" }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Issues
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={status === "loading" && issues.length === 0}
            >
              Refresh
            </Button>
            {isAuthor && (
              <Link to="/new-issue">
                <Button type="primary" icon={<PlusOutlined />}>
                  New issue
                </Button>
              </Link>
            )}
          </Space>
        </Flex>
      </div>

      {issues.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="issue-list-content">
            {issues.map((issue) => (
              <Card
                key={issue.id}
                style={{
                  marginBottom: 16,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
                hoverable
              >
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      #{issue.number} opened by {issue.user.login}{" "}
                      {dayjs(issue.created_at).fromNow()}
                      <Badge
                        status={issue.state === "open" ? "success" : "error"}
                        text={issue.state}
                        style={{
                          textTransform: "capitalize",
                          marginLeft: 8,
                          color:
                            issue.state === "open"
                              ? "var(--color-success-fg)"
                              : "var(--color-danger-fg)",
                          fontWeight: 500,
                        }}
                      />
                    </Text>
                  </div>
                  <Link
                    to={`/issue/${issue.number}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <Title
                      level={5}
                      style={{
                        margin: "0 0 8px",
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {getStateIcon(issue.state)} {issue.title}
                    </Title>
                  </Link>

                  {issue.labels.length > 0 && (
                    <div
                      className="issue-labels"
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {issue.labels.map((label) => (
                        <Tag
                          key={label.name}
                          color={`#${label.color}`}
                          style={{
                            borderRadius: "20px",
                            padding: "0 8px",
                            fontSize: "12px",
                            lineHeight: "20px",
                          }}
                        >
                          {label.name}
                        </Tag>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 12 }}>
                    <Space>
                      <Link to={`/issue/${issue.number}`}>
                        <Button type="default" size="small">
                          View Details
                        </Button>
                      </Link>
                      {issue.comments > 0 && (
                        <Button
                          type="text"
                          size="small"
                          icon={<CommentOutlined />}
                        >
                          {issue.comments}
                        </Button>
                      )}
                    </Space>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {hasMorePages && (
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <Button onClick={handleLoadMore} loading={status === "loading"}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IssueList;
