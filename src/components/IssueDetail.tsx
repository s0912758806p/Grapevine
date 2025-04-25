import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Space, Tag, Button, Card, message } from "antd";
import {
  ArrowLeftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CommentOutlined,
  BookOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  fetchIssueThunk,
  clearCurrentIssue,
  resetIssuesStatus,
  upvoteIssue,
  downvoteIssue,
} from "../store/issuesSlice";
import { RootState, AppDispatch } from "../store";
import CommentSection from "./CommentSection";
import { createSelector } from "@reduxjs/toolkit";
dayjs.extend(relativeTime);
const { Title, Text, Paragraph } = Typography;
interface IssueParams {
  issueNumber: string;
}
const selectCommentsForCurrentIssue = createSelector(
  [
    (state: RootState) => state.comments.comments,
    (state: RootState) => state.issues.currentIssue,
  ],
  (comments, currentIssue) => {
    if (!currentIssue) return [];
    return comments[currentIssue.number] || [];
  }
);
const CommentsWrapper = () => {
  const { currentIssue } = useSelector((state: RootState) => state.issues);
  if (!currentIssue) return null;
  return (
    <div
      className="comments-wrapper"
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "4px",
        marginTop: "16px",
      }}
    >
      <CommentSection issueNumber={currentIssue.number} />
    </div>
  );
};
const IssueDetail: React.FC = () => {
  const { issueNumber } = useParams<keyof IssueParams>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentIssue, status, error, votes } = useSelector(
    (state: RootState) => state.issues
  );
  const comments = useSelector(selectCommentsForCurrentIssue);
  useEffect(() => {
    if (issueNumber) {
      dispatch(fetchIssueThunk(parseInt(issueNumber, 10)));
    }
    return () => {
      dispatch(clearCurrentIssue());
    };
  }, [issueNumber, dispatch]);
  const handleBackToHome = () => {
    dispatch(clearCurrentIssue());
    dispatch(resetIssuesStatus());
    navigate("/");
  };
  const handleUpvote = (issueId: number) => {
    dispatch(upvoteIssue(issueId));
  };
  const handleDownvote = (issueId: number) => {
    dispatch(downvoteIssue(issueId));
  };
  const getVoteCount = (issueId: number, labelsCount: number) => {
    const baseCount = labelsCount + 1;
    const userVote = votes[issueId] || 0;
    return baseCount + userVote;
  };
  const handleShare = () => {
    if (!currentIssue) return;
    const url = `${window.location.origin}/issue/${currentIssue.number}`;
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
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={handleBackToHome}
      >
        Back to Posts
      </Button>
      <Card
        style={{ marginBottom: 16, borderRadius: 4 }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: "flex" }}>
          {}
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
              style={{
                color: votes[currentIssue.id] === 1 ? "#FF4500" : "#878A8C",
              }}
              onClick={() => handleUpvote(currentIssue.id)}
              aria-label="Upvote"
            />
            <Text strong style={{ margin: "8px 0", color: "#1A1A1B" }}>
              {getVoteCount(currentIssue.id, currentIssue.labels.length)}
            </Text>
            <Button
              type="text"
              size="small"
              icon={<ArrowDownOutlined />}
              style={{
                color: votes[currentIssue.id] === -1 ? "#7193FF" : "#878A8C",
              }}
              onClick={() => handleDownvote(currentIssue.id)}
              aria-label="Downvote"
            />
          </div>
          {}
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
                  {comments.length} Comments
                </Button>
                <Button
                  type="text"
                  icon={<ShareAltOutlined />}
                  size="middle"
                  onClick={handleShare}
                >
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
      <CommentsWrapper />
    </div>
  );
};
export default IssueDetail;
