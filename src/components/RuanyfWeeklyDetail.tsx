import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Space, Tag, Button, Card, message, Spin } from "antd";
import { ArrowLeftOutlined, LinkOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  fetchRuanyfWeeklyIssueThunk,
  clearCurrentRuanyfWeeklyIssue,
  RuanyfWeeklyIssueType,
  RuanyfWeeklyLabel,
} from "../store/ruanyfWeeklySlice";
import { RootState, AppDispatch } from "../store";
import UtterancesComments from "./UtterancesComments";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "../styles/markdown.scss";
import { recordView } from "../services/analyticsService";
import { IssueType } from "../types";

dayjs.extend(relativeTime);
const { Title, Text } = Typography;

interface WeeklyIssueParams {
  issueNumber: string;
}

const RuanyfWeeklyDetail: React.FC = () => {
  const { issueNumber } = useParams<keyof WeeklyIssueParams>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentIssue, status, error } = useSelector(
    (state: RootState) => state.ruanyfWeekly
  );

  useEffect(() => {
    if (issueNumber) {
      dispatch(fetchRuanyfWeeklyIssueThunk(issueNumber))
        .unwrap()
        .then((issue: RuanyfWeeklyIssueType) => {
          recordView({
            ...issue,
            state: "ruanyf-weekly",
            id: Number(issue.id),
          } as IssueType);
        })
        .catch((fetchError: unknown) => {
          console.error("Failed to fetch Ruanyf Weekly issue:", fetchError);
          let errorMessage = "Failed to load weekly issue details.";
          if (typeof fetchError === "string") {
            errorMessage = fetchError;
          } else if (fetchError instanceof Error) {
            errorMessage = fetchError.message;
          }
          message.error(errorMessage);
        });
    }

    return () => {
      dispatch(clearCurrentRuanyfWeeklyIssue());
    };
  }, [dispatch, issueNumber]);

  const handleBackToList = () => {
    dispatch(clearCurrentRuanyfWeeklyIssue());
    navigate("/ruanyf-weekly");
  };

  const handleShare = () => {
    if (!currentIssue) return;
    const url = `${window.location.origin}/ruanyf-weekly/${currentIssue.number}`;
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

  const displayError =
    typeof error === "string" ? error : "An unknown error occurred.";

  if (status === "failed") {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        Error: {displayError}
      </div>
    );
  }

  if (!currentIssue) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Weekly issue not found
      </div>
    );
  }

  const issueTermForComments = `weekly-${currentIssue.id}`;

  return (
    <div className="ruanyf-weekly-detail responsive-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={handleBackToList}
        className="responsive-spacing"
      >
        Back to Weekly Issues
      </Button>

      <Card
        style={{ marginBottom: 16, borderRadius: 4 }}
        className="responsive-card responsive-spacing"
      >
        <div>
          <div style={{ marginBottom: 12 }}>
            {currentIssue.labels && currentIssue.labels.length > 0 && (
              <Space style={{ marginBottom: 8 }} wrap>
                {currentIssue.labels.map((label: RuanyfWeeklyLabel) => (
                  <Tag
                    key={label.name}
                    color={
                      label.color
                        ? label.color.startsWith("#")
                          ? label.color
                          : `#${label.color}`
                        : undefined
                    }
                    style={{ borderRadius: 20 }}
                  >
                    {label.name}
                  </Tag>
                ))}
              </Space>
            )}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {currentIssue.author && `Posted by ${currentIssue.author} `}
                {currentIssue.published_at &&
                  dayjs(currentIssue.published_at).fromNow()}
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
              {currentIssue.body || currentIssue.content || ""}
            </ReactMarkdown>
          </div>

          <div
            className="flex-col-mobile"
            style={{
              display: "flex",
              padding: "12px 0 0",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button type="text" icon={<LinkOutlined />} onClick={handleShare}>
              Share
            </Button>

            {currentIssue.source_url && (
              <a
                href={currentIssue.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="primary">View Source</Button>
              </a>
            )}
          </div>
        </div>
      </Card>

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
          repo="owner/repo"
          issueTerm={issueTermForComments}
          theme="github-light"
        />
      </div>
    </div>
  );
};

export default RuanyfWeeklyDetail;
