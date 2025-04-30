import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Space, Tag, Button, Card, message, Spin } from "antd";
import { ArrowLeftOutlined, LinkOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UtterancesComments from "./UtterancesComments";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "../styles/markdown.scss";
import { RootState, AppDispatch } from "../store";
import { fetchGithubIssueThunk } from "../store/githubIssuesSlice";
import { recordView } from "../services/analyticsService";

dayjs.extend(relativeTime);
const { Title, Text } = Typography;

interface IssueParams {
  issueNumber: string;
}

interface Label {
  name: string;
  color: string;
}

const IssueDetail: React.FC = () => {
  const { issueNumber } = useParams<keyof IssueParams>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    currentIssue: issue,
    status,
    error,
  } = useSelector((state: RootState) => state.githubIssues);

  useEffect(() => {
    if (issueNumber) {
      dispatch(fetchGithubIssueThunk(parseInt(issueNumber, 10)))
        .unwrap()
        .then((issue) => {
          // Record view in analytics when issue is loaded
          recordView(issue);
        })
        .catch((error) => {
          console.error("Failed to fetch issue:", error);
          message.error("Failed to load issue details.");
        });
    }
  }, [dispatch, issueNumber]);

  const handleBackToIssues = () => {
    navigate("/");
  };

  const handleShare = () => {
    if (!issue) return;

    const url = `${window.location.origin}/issue/${issue.number}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        message.success("Link copied to clipboard");
      })
      .catch(() => {
        message.error("Failed to copy link");
      });
  };

  if (status === "loading") {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Spin tip="Loading...">
          <div style={{ padding: "30px", background: "rgba(0,0,0,0.05)" }} />
        </Spin>
      </div>
    );
  }

  if (status === "failed" || !issue) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div
          style={{
            fontSize: 48,
            color: "var(--color-danger-fg)",
            marginBottom: 16,
          }}
        >
          ⚠️
        </div>
        <Title level={3}>Issue not found</Title>
        <Text style={{ display: "block", marginBottom: 24 }}>
          {error ||
            "The requested issue could not be found or may have been deleted."}
        </Text>
        <Button type="primary" onClick={handleBackToIssues}>
          Back to Issues
        </Button>
      </div>
    );
  }

  return (
    <div className="issue-detail responsive-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={handleBackToIssues}
        className="responsive-spacing"
      >
        Back to issues
      </Button>

      <Card
        style={{ marginBottom: 16, borderRadius: 4 }}
        className="responsive-card responsive-spacing"
      >
        <div>
          <div style={{ marginBottom: 12 }}>
            {issue.labels.length > 0 && (
              <Space style={{ marginBottom: 8 }} wrap>
                {issue.labels.map((label: Label) => (
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
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <span style={{ marginRight: 8 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor:
                        issue.state === "open"
                          ? "var(--color-success-fg)"
                          : "var(--color-danger-fg)",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "16px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      fontSize: "12px",
                    }}
                  >
                    {issue.state}
                  </span>
                </span>
                Posted by {issue.user.login} {dayjs(issue.created_at).fromNow()}
              </Text>
            </div>
          </div>

          <Title
            level={4}
            style={{ margin: "0 0 16px" }}
            className="responsive-text"
          >
            {issue.title}
          </Title>

          <div
            className="post-content markdown-body"
            style={{
              padding: "8px 0 20px",
              borderBottom: "1px solid var(--color-border-muted)",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {issue.body}
            </ReactMarkdown>
          </div>

          <div
            className="flex-col-mobile"
            style={{
              display: "flex",
              padding: "12px 0 0",
              justifyContent: "space-between",
            }}
          >
            <Button type="text" icon={<LinkOutlined />} onClick={handleShare}>
              Share
            </Button>

            <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
              <Button type="primary">View on GitHub</Button>
            </a>
          </div>
        </div>
      </Card>

      {/* GitHub Comments Section */}
      <div
        className="comments-wrapper responsive-card"
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "4px",
          marginTop: "16px",
        }}
      >
        <Title level={4} style={{ marginTop: 0 }} className="responsive-text">
          Comments
        </Title>
        <UtterancesComments
          repo={`${import.meta.env.VITE_GITHUB_REPO_OWNER}/${
            import.meta.env.VITE_GITHUB_REPO_NAME
          }`}
          issueTerm={`issue-${issue.number}`}
          theme="github-light"
        />
      </div>
    </div>
  );
};

export default IssueDetail;
