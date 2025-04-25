import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Tag,
  Space,
  Button,
  Typography,
  Flex,
  Card,
  message,
  Skeleton,
  Empty,
  Pagination,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  CommentOutlined,
  ShareAltOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  fetchIssuesThunk,
  upvoteIssue,
  downvoteIssue,
} from "../store/issuesSlice";
import { RootState, AppDispatch } from "../store";
import { IssueType } from "../types";
dayjs.extend(relativeTime);
const { Text, Title } = Typography;
const IssueList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { issues, status, error, votes } = useSelector(
    (state: RootState) => state.issues
  );
  const commentsById = useSelector(
    (state: RootState) => state.comments.comments
  );
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  useEffect(() => {
    dispatch(fetchIssuesThunk());
    setCurrentPage(1);
  }, [dispatch, location.key]); 
  const handleRefresh = () => {
    dispatch(fetchIssuesThunk());
  };
  const handleShare = (issueNumber: number) => {
    const url = `${window.location.origin}/issue/${issueNumber}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        message.success("Link copied to clipboard");
      })
      .catch(() => {
        message.error("Failed to copy link");
      });
  };
  const getCommentCount = (issueNumber: number) => {
    return commentsById[issueNumber]?.length || 0;
  };
  const handleUpvote = (issueId: number) => {
    dispatch(upvoteIssue(issueId));
  };
  const handleDownvote = (issueId: number) => {
    dispatch(downvoteIssue(issueId));
  };
  const getVoteCount = (issue: IssueType) => {
    const baseCount = issue.labels.length + 1;
    const userVote = votes[issue.id] || 0;
    return baseCount + userVote;
  };
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
    window.scrollTo(0, 0);
  };
  const getCurrentPageIssues = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return issues.slice(startIndex, endIndex);
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
        description="No posts yet"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ margin: "40px 0" }}
      >
        <Link to="/new-issue">
          <Button type="primary" icon={<PlusOutlined />}>
            Create the first post
          </Button>
        </Link>
      </Empty>
    );
  };
  if (status === "loading" && issues.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading posts...
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        Error: {error}
      </div>
    );
  }
  return (
    <div className="posts-container">
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: 16, padding: "0 16px" }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Popular Posts
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={status === "loading"}
          >
            Refresh
          </Button>
          <Link to="/new-issue">
            <Button type="primary" icon={<PlusOutlined />}>
              Create Post
            </Button>
          </Link>
        </Space>
      </Flex>
      <div className="reddit-post-list">
        {status === "loading" && issues.length === 0 ? (
          renderSkeletons()
        ) : issues.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {getCurrentPageIssues().map((issue: IssueType) => (
              <Card
                key={issue.id}
                style={{
                  marginBottom: 16,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
                styles={{ body: { padding: 0 } }}
                hoverable
              >
                <div style={{ display: "flex" }}>
                  {}
                  <div
                    style={{
                      background: "#F8F9FA",
                      padding: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: "40px",
                    }}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      style={{
                        color: votes[issue.id] === 1 ? "#FF4500" : "#878A8C",
                      }}
                      onClick={() => handleUpvote(issue.id)}
                      aria-label="Upvote"
                    />
                    <Text strong style={{ margin: "4px 0", color: "#1A1A1B" }}>
                      {getVoteCount(issue)}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      style={{
                        color: votes[issue.id] === -1 ? "#7193FF" : "#878A8C",
                      }}
                      onClick={() => handleDownvote(issue.id)}
                      aria-label="Downvote"
                    />
                  </div>
                  {}
                  <div style={{ flex: 1, padding: "12px 16px" }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Posted by u/{issue.user.login}{" "}
                        {dayjs(issue.created_at).fromNow()}
                      </Text>
                    </div>
                    <Link to={`/issue/${issue.number}`}>
                      <Title
                        level={5}
                        style={{ margin: "0 0 8px", color: "#222" }}
                      >
                        {issue.title}
                      </Title>
                    </Link>
                    <div style={{ marginBottom: 8 }}>
                      {issue.labels.length > 0 && (
                        <Space>
                          {issue.labels.map((label) => (
                            <Tag
                              key={label.name}
                              color={`#${label.color}`}
                              style={{ borderRadius: 20 }}
                            >
                              r/{label.name}
                            </Tag>
                          ))}
                        </Space>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: 16,
                        borderTop: "1px solid #EDEFF1",
                        paddingTop: 8,
                      }}
                    >
                      <Space>
                        <Button
                          type="text"
                          icon={<CommentOutlined />}
                          size="small"
                          onClick={() => navigate(`/issue/${issue.number}`)}
                        >
                          {getCommentCount(issue.number)} Comments
                        </Button>
                        <Button
                          type="text"
                          icon={<ShareAltOutlined />}
                          size="small"
                          onClick={() => handleShare(issue.number)}
                        >
                          Share
                        </Button>
                      </Space>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {issues.length > pageSize && (
              <div
                style={{ textAlign: "center", marginTop: 16, marginBottom: 24 }}
              >
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={issues.length}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={["5", "10", "20", "50"]}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default IssueList;
