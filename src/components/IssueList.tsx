import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Tag, Space, Button, Typography, Flex, Card } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  CommentOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { fetchIssuesThunk } from "../store/issuesSlice";
import { RootState, AppDispatch } from "../store";
import { IssueType } from "../types";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const IssueList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { issues, status, error } = useSelector(
    (state: RootState) => state.issues
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchIssuesThunk());
    }
  }, [status, dispatch]);

  if (status === "loading") {
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

  const getRandomVotes = () => {
    // Simulate upvotes for display purposes
    return Math.floor(Math.random() * 1000);
  };

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
        <Link to="/new-issue">
          <Button type="primary" icon={<PlusOutlined />} shape="round">
            Create Post
          </Button>
        </Link>
      </Flex>

      <div className="reddit-post-list">
        {issues.map((issue: IssueType) => (
          <Card
            key={issue.id}
            style={{
              marginBottom: 16,
              borderRadius: 4,
              overflow: "hidden",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ display: "flex" }}>
              {/* Voting sidebar */}
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
                  style={{ color: "#878A8C" }}
                />
                <Text strong style={{ margin: "4px 0", color: "#1A1A1B" }}>
                  {getRandomVotes()}
                </Text>
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  style={{ color: "#878A8C" }}
                />
              </div>

              {/* Post content */}
              <div style={{ flex: 1, padding: "12px 16px" }}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Posted by u/{issue.user.login}{" "}
                    {dayjs(issue.created_at).fromNow()}
                  </Text>
                </div>

                <Link to={`/issue/${issue.number}`}>
                  <Title level={5} style={{ margin: "0 0 8px", color: "#222" }}>
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
                    <Button type="text" icon={<CommentOutlined />} size="small">
                      {issue.comments} Comments
                    </Button>
                    <Button
                      type="text"
                      icon={<ShareAltOutlined />}
                      size="small"
                    >
                      Share
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IssueList;
