import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Space, Tag, Button, Card, message, Spin } from "antd";
import { ArrowLeftOutlined, LinkOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import CommentSection from "./CommentSection";
import UtterancesComments from "./UtterancesComments";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./markdown.scss";
import { RootState, AppDispatch } from "../store";
import { fetchGithubIssueThunk } from "../store/githubIssuesSlice";

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
      dispatch(fetchGithubIssueThunk(parseInt(issueNumber, 10)));
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
        <Spin tip="Loading..." />
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
    <div className="issue-detail">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={handleBackToIssues}
      >
        Back to issues
      </Button>

      <Card style={{ marginBottom: 16, borderRadius: 4 }}>
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

          <Title level={4} style={{ margin: "0 0 16px" }}>
            {issue.title}
          </Title>

          <div
            className="post-content markdown-body"
            style={{
              padding: "8px 0 20px",
              borderBottom: "1px solid var(--color-border-muted)",
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {issue.body}
            </ReactMarkdown>
          </div>

          <div
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

      {/* Comments Section */}
      <div
        className="comments-wrapper"
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "4px",
          marginTop: "16px",
        }}
      >
        <Title level={4} style={{ marginTop: 0 }}>
          Comments ({issue.comments})
        </Title>

        {issue.comments > 0 ? (
          <CommentSection issueNumber={issue.number} />
        ) : (
          <Card
            style={{
              textAlign: "center",
              padding: "32px",
              backgroundColor: "var(--color-canvas-subtle)",
              border: "1px solid var(--color-border-default)",
              borderRadius: 6,
              marginBottom: "16px",
            }}
          >
            <Text style={{ color: "var(--color-fg-muted)" }}>
              No comments yet
            </Text>
          </Card>
        )}
      </div>

      {/* GitHub Comments Section */}
      <div
        className="comments-wrapper"
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "4px",
          marginTop: "16px",
        }}
      >
        <Title level={4} style={{ marginTop: 0 }}>
          GitHub Comments
        </Title>
        <UtterancesComments
          repo={`${import.meta.env.VITE_GITHUB_OWNER}/${
            import.meta.env.VITE_GITHUB_REPO
          }`}
          issueTerm={`issue-${issue.number}`}
          theme="github-light"
        />
      </div>
    </div>
  );
};

export default IssueDetail;
