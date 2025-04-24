import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { Typography, Space, Tag, Button, Card } from "antd";
import {
  ArrowLeftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CommentOutlined,
  BookOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import Giscus from "@giscus/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { fetchIssueThunk } from "../store/issuesSlice";
import { RootState, AppDispatch } from "../store";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

interface IssueParams {
  issueNumber: string;
}

// GiscusWrapper component to handle potential React 19 compatibility issues
const GiscusWrapper = () => {
  const { currentIssue } = useSelector((state: RootState) => state.issues);

  if (!currentIssue) return null;

  return (
    <div
      className="giscus-wrapper"
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "4px",
        marginTop: "16px",
      }}
    >
      <Giscus
        repo="your-github-username/your-repo-name"
        repoId="your-repo-id"
        category="Announcements"
        categoryId="your-category-id"
        mapping="specific"
        term={`issue-${currentIssue.number}`}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="light"
        lang="en"
        loading="lazy"
      />
    </div>
  );
};

const IssueDetail: React.FC = () => {
  const { issueNumber } = useParams<keyof IssueParams>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentIssue, status, error } = useSelector(
    (state: RootState) => state.issues
  );

  useEffect(() => {
    if (issueNumber) {
      dispatch(fetchIssueThunk(parseInt(issueNumber, 10)));
    }
  }, [issueNumber, dispatch]);

  const getRandomVotes = () => {
    // Simulate upvotes for display purposes
    return Math.floor(Math.random() * 1000);
  };

  if (status === "loading") {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading post...
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

  if (!currentIssue) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Post not found</div>
    );
  }

  return (
    <div className="post-detail">
      <Link to="/">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{ marginBottom: 16 }}
        >
          Back to Posts
        </Button>
      </Link>

      <Card
        style={{ marginBottom: 16, borderRadius: 4 }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ display: "flex" }}>
          {/* Voting sidebar */}
          <div
            style={{
              background: "#F8F9FA",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "45px",
            }}
          >
            <Button
              type="text"
              size="small"
              icon={<ArrowUpOutlined />}
              style={{ color: "#878A8C" }}
            />
            <Text strong style={{ margin: "8px 0", color: "#1A1A1B" }}>
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
          <div style={{ flex: 1, padding: "16px 20px" }}>
            <div style={{ marginBottom: 12 }}>
              {currentIssue.labels.length > 0 && (
                <Space style={{ marginBottom: 8 }}>
                  {currentIssue.labels.map((label) => (
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
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Posted by u/{currentIssue.user.login}{" "}
                  {dayjs(currentIssue.created_at).fromNow()}
                </Text>
              </div>
            </div>

            <Title level={4} style={{ margin: "0 0 16px" }}>
              {currentIssue.title}
            </Title>

            <div
              className="post-content"
              style={{
                padding: "8px 0 20px",
                borderBottom: "1px solid #EDEFF1",
                marginBottom: "12px",
              }}
            >
              <Paragraph style={{ marginBottom: 0, fontSize: "15px" }}>
                {currentIssue.body}
              </Paragraph>
            </div>

            <div style={{ display: "flex", padding: "4px 0" }}>
              <Space size="middle">
                <Button type="text" icon={<CommentOutlined />} size="middle">
                  {currentIssue.comments} Comments
                </Button>
                <Button type="text" icon={<ShareAltOutlined />} size="middle">
                  Share
                </Button>
                <Button type="text" icon={<BookOutlined />} size="middle">
                  Save
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 20, marginBottom: 10 }}>
        <Text strong style={{ fontSize: 16 }}>
          Comments
        </Text>
      </div>

      <GiscusWrapper />
    </div>
  );
};

export default IssueDetail;
