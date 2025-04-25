import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Skeleton,
  Empty,
  Flex,
} from "antd";
import { ReloadOutlined, LinkOutlined } from "@ant-design/icons";
import { fetchF2EIssuesThunk } from "../store/f2eIssuesSlice";
import { RootState, AppDispatch } from "../store";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
dayjs.extend(relativeTime);
const { Text, Title } = Typography;

const F2EIssueList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { issues, status, error, currentPage, hasMorePages } = useSelector(
    (state: RootState) => state.f2eIssues
  );
  const [perPage] = useState<number>(10);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (issues.length === 0) {
      dispatch(fetchF2EIssuesThunk({ page: 1, perPage }));
    }
  }, [dispatch, perPage, issues.length]);

  const handleRefresh = () => {
    dispatch(fetchF2EIssuesThunk({ page: 1, perPage }));
  };

  const handleLoadMore = () => {
    if (hasMorePages) {
      dispatch(fetchF2EIssuesThunk({ page: currentPage + 1, perPage }));
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
        description="No F2E job posts found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ margin: "40px 0" }}
      />
    );
  };

  if (status === "loading" && issues.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading job posts...
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
    <div className="f2e-jobs-container">
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: 16, padding: "0 16px" }}
      >
        <Title level={3} style={{ margin: 0 }}>
          F2E Jobs
        </Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={status === "loading" && issues.length > 0}
        >
          Refresh
        </Button>
      </Flex>

      <div className="f2e-jobs-list">
        {status === "loading" && issues.length === 0 ? (
          renderSkeletons()
        ) : issues.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {issues.map((issue) => (
              <Card
                key={issue.id}
                style={{
                  marginBottom: 16,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
                hoverable
                onClick={() => {
                  navigate(`/f2e-issue/${issue.number}`);
                }}
              >
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Posted by {issue.user.login}{" "}
                      {dayjs(issue.created_at).fromNow()}
                    </Text>
                  </div>
                  <Link
                    to={`/f2e-issue/${issue.number}`}
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
                      <Link to={`/f2e-issue/${issue.number}`}>
                        <Button type="default" size="small">
                          View Details
                        </Button>
                      </Link>
                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          type="text"
                          icon={<LinkOutlined />}
                          size="small"
                        >
                          View on GitHub
                        </Button>
                      </a>
                    </Space>
                  </div>
                </div>
              </Card>
            ))}

            {hasMorePages && (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <Button
                  onClick={handleLoadMore}
                  loading={status === "loading"}
                  disabled={!hasMorePages}
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

export default F2EIssueList;
