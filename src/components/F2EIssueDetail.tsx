import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Space, Tag, Button, Card, message, Spin } from "antd";
import { ArrowLeftOutlined, LinkOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  fetchF2EIssueThunk,
  clearCurrentF2EIssue,
} from "../store/f2eIssuesSlice";
import { RootState, AppDispatch } from "../store";
import UtterancesComments from "./UtterancesComments";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "../styles/markdown.scss";
import { recordView } from "../services/analyticsService";

dayjs.extend(relativeTime);
const { Title, Text } = Typography;

interface IssueParams {
  issueNumber: string;
}

const F2EIssueDetail: React.FC = () => {
  const { issueNumber } = useParams<keyof IssueParams>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentIssue, status, error } = useSelector(
    (state: RootState) => state.f2eIssues
  );

  useEffect(() => {
    if (issueNumber) {
      dispatch(fetchF2EIssueThunk(parseInt(issueNumber, 10)))
        .unwrap()
        .then((issue) => {
          // Record view in analytics when F2E issue is loaded
          recordView({ ...issue, state: "f2e" });
        })
        .catch((error) => {
          console.error("Failed to fetch F2E issue:", error);
          message.error("Failed to load issue details.");
        });
    }

    return () => {
      dispatch(clearCurrentF2EIssue());
    };
  }, [dispatch, issueNumber, message]);

  const handleBackToHome = () => {
    dispatch(clearCurrentF2EIssue());
    navigate("/essays");
  };

  const handleShare = () => {
    if (!currentIssue) return;
    const url = `${window.location.origin}/f2e-issue/${currentIssue.number}`;
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

  if (status === "failed") {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        Error: {error}
      </div>
    );
  }

  if (!currentIssue) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Issue not found
      </div>
    );
  }

  return (
    <div className="f2e-issue-detail responsive-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={handleBackToHome}
        className="responsive-spacing"
      >
        Back to Essays
      </Button>

      <Card
        style={{ marginBottom: 16, borderRadius: 4 }}
        className="responsive-card responsive-spacing"
      >
        <div>
          <div style={{ marginBottom: 12 }}>
            {currentIssue.labels.length > 0 && (
              <Space style={{ marginBottom: 8 }} wrap>
                {currentIssue.labels.map((label) => (
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
                Posted by {currentIssue.user.login}{" "}
                {dayjs(currentIssue.created_at).fromNow()}
              </Text>
            </div>
          </div>

          <Title
            level={4}
            style={{ margin: "0 0 16px" }}
            className="responsive-text"
          >
            {currentIssue.title}
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
              {currentIssue.body}
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

            <a
              href={currentIssue.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="primary">View on GitHub</Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Utterances Comments */}
      <div
        className="comments-wrapper responsive-card"
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "4px",
          marginTop: "16px",
        }}
      >
        <h3 className="responsive-text">Comments</h3>
        <UtterancesComments
          repo="f2etw/jobs"
          issueTerm={`issue-${currentIssue.number}`}
          theme="github-light"
        />
      </div>
    </div>
  );
};

export default F2EIssueDetail;
