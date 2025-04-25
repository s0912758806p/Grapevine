import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Card,
  Space,
  Divider,
  Select,
  List,
  Avatar,
  Statistic,
  Row,
  Col,
  Alert,
  Button,
  Tabs,
  Badge,
  Empty,
  Tooltip,
} from "antd";
import {
  CommentOutlined,
  EyeOutlined,
  FireOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import CommentSection from "../components/CommentSection";
import { fetchIssuesThunk } from "../store/issuesSlice";
import { fetchCommentsThunk } from "../store/commentsSlice";
import { RootState, AppDispatch } from "../store";
import { IssueType, CommentType } from "../types";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
interface CommentWithIssue extends CommentType {
  issueTitle?: string;
  issueNumber: number;
}
const CommentsExample: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedIssueNumber, setSelectedIssueNumber] = useState<number>(1);
  const [recentComments, setRecentComments] = useState<CommentWithIssue[]>([]);
  const [commentLikes, setCommentLikes] = useState<Record<number, number>>({});
  const [baseCommentLikes, setBaseCommentLikes] = useState<
    Record<number, number>
  >({});
  const issues = useSelector((state: RootState) => state.issues.issues);
  const issuesStatus = useSelector((state: RootState) => state.issues.status);
  const commentsById = useSelector(
    (state: RootState) => state.comments.comments
  );
  useEffect(() => {
    dispatch(fetchIssuesThunk());
  }, [dispatch]);
  useEffect(() => {
    if (selectedIssueNumber) {
      dispatch(fetchCommentsThunk(selectedIssueNumber));
    }
  }, [dispatch, selectedIssueNumber]);
  useEffect(() => {
    if (issues.length > 0) {
      const allComments: CommentWithIssue[] = [];
      issues.forEach((issue) => {
        if (issue.comments > 0 && !commentsById[issue.number]) {
          dispatch(fetchCommentsThunk(issue.number));
        }
        if (commentsById[issue.number]) {
          const issueComments = commentsById[issue.number].map((comment) => ({
            ...comment,
            issueNumber: issue.number,
            issueTitle: issue.title,
          }));
          allComments.push(...issueComments);
        }
      });
      const sorted = allComments
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10);
      setRecentComments(sorted);
    }
  }, [issues, commentsById, dispatch]);
  useEffect(() => {
    if (
      recentComments.length > 0 &&
      Object.keys(baseCommentLikes).length === 0
    ) {
      const initialBaseLikes: Record<number, number> = {};
      recentComments.forEach((comment) => {
        initialBaseLikes[comment.id] = Math.floor(Math.random() * 5) + 1;
      });
      setBaseCommentLikes(initialBaseLikes);
    }
  }, [recentComments, baseCommentLikes]);
  const totalComments = Object.values(commentsById).reduce(
    (sum, comments) => sum + comments.length,
    0
  );
  const getActiveUsers = () => {
    const userCounts: Record<string, number> = {};
    Object.values(commentsById).forEach((comments) => {
      comments.forEach((comment) => {
        const username = comment.user.login;
        userCounts[username] = (userCounts[username] || 0) + 1;
      });
    });
    return Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };
  const activeUsers = getActiveUsers();
  const handleIssueChange = (value: number) => {
    setSelectedIssueNumber(value);
  };
  const handleCommentLike = useCallback((commentId: number, liked: boolean) => {
    setCommentLikes((prev) => {
      const currentValue = prev[commentId] || 0;
      if ((liked && currentValue === 1) || (!liked && currentValue === -1)) {
        const newLikes = { ...prev };
        delete newLikes[commentId];
        return newLikes;
      }
      if (liked && currentValue === -1) {
        return {
          ...prev,
          [commentId]: 1,
        };
      } else if (!liked && currentValue === 1) {
        return {
          ...prev,
          [commentId]: -1,
        };
      }
      return {
        ...prev,
        [commentId]: liked ? 1 : -1,
      };
    });
  }, []);
  const getCommentLikeCount = (commentId: number) => {
    const baseCount = baseCommentLikes[commentId] || 1;
    const userVote = commentLikes[commentId] || 0;
    return Math.max(0, baseCount + userVote);
  };
  const renderRecentComments = () => (
    <List
      itemLayout="horizontal"
      dataSource={recentComments}
      renderItem={(comment) => (
        <List.Item
          actions={[
            <Tooltip title="Like">
              <Button
                type="text"
                size="small"
                icon={<LikeOutlined />}
                onClick={() => handleCommentLike(comment.id, true)}
                style={{
                  color: commentLikes[comment.id] === 1 ? "#1890ff" : undefined,
                }}
              >
                {getCommentLikeCount(comment.id)}
              </Button>
            </Tooltip>,
            <Tooltip title="Dislike">
              <Button
                type="text"
                size="small"
                icon={<DislikeOutlined />}
                onClick={() => handleCommentLike(comment.id, false)}
                style={{
                  color:
                    commentLikes[comment.id] === -1 ? "#ff4d4f" : undefined,
                }}
              />
            </Tooltip>,
          ]}
        >
          <List.Item.Meta
            avatar={<Avatar src={comment.user.avatar_url} />}
            title={
              <Space>
                <Text strong>{comment.user.login}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(comment.created_at).fromNow()}
                </Text>
              </Space>
            }
            description={
              <div>
                <Link to={`/issue/${comment.issueNumber}`}>
                  <Text type="secondary">On: {comment.issueTitle}</Text>
                </Link>
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 4 }}>
                  {comment.body}
                </Paragraph>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
  const renderActiveUsers = () => (
    <List
      size="small"
      dataSource={activeUsers}
      renderItem={([username, count]) => (
        <List.Item
          extra={<Badge count={count} style={{ backgroundColor: "#52c41a" }} />}
        >
          <Space>
            <TeamOutlined />
            <Text>{username}</Text>
          </Space>
        </List.Item>
      )}
    />
  );
  return (
    <div className="comments-page">
      <Typography>
        <Title level={2}>
          <CommentOutlined style={{ marginRight: 12 }} />
          Forum Comments
        </Title>
        <Paragraph>
          This is our community discussion forum. View discussions, participate
          in conversations, and share your thoughts on various topics.
        </Paragraph>
      </Typography>
      <Divider />
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={
                <span>
                  <CommentOutlined /> Comment Thread
                </span>
              }
              key="1"
            >
              <Card
                title="Post Comments"
                extra={
                  <Select
                    style={{ width: 250 }}
                    placeholder="Select a post"
                    value={selectedIssueNumber}
                    onChange={handleIssueChange}
                    loading={issuesStatus === "loading"}
                  >
                    {issues.map((issue: IssueType) => (
                      <Option key={issue.number} value={issue.number}>
                        {issue.title}
                      </Option>
                    ))}
                  </Select>
                }
              >
                {issuesStatus === "loading" && (
                  <div style={{ marginBottom: 16 }}>
                    <Alert message="Loading posts..." type="info" showIcon />
                  </div>
                )}
                {issuesStatus === "failed" && (
                  <div style={{ marginBottom: 16 }}>
                    <Alert
                      message="Failed to load posts"
                      type="error"
                      showIcon
                    />
                  </div>
                )}
                {issuesStatus === "succeeded" && issues.length === 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Alert message="No posts found" type="warning" showIcon />
                  </div>
                )}
                {issues.find(
                  (issue) => issue.number === selectedIssueNumber
                ) && (
                  <div style={{ marginBottom: 16 }}>
                    <Link to={`/issue/${selectedIssueNumber}`}>
                      <Button type="link" icon={<EyeOutlined />}>
                        View Full Post
                      </Button>
                    </Link>
                  </div>
                )}
                <CommentSection issueNumber={selectedIssueNumber} />
              </Card>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined /> Recent Comments
                </span>
              }
              key="2"
            >
              <Card title="Recent Activity">
                {recentComments.length > 0 ? (
                  renderRecentComments()
                ) : (
                  <Empty description="No recent comments" />
                )}
              </Card>
            </TabPane>
          </Tabs>
        </Col>
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Card title="Community Stats">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Posts"
                    value={issues.length}
                    prefix={<FireOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Comments"
                    value={totalComments}
                    prefix={<CommentOutlined />}
                  />
                </Col>
              </Row>
            </Card>
            <Card title="Most Active Users">
              {activeUsers.length > 0 ? (
                renderActiveUsers()
              ) : (
                <Empty description="No active users yet" />
              )}
            </Card>
            <Card title="Latest Posts">
              <List
                size="small"
                dataSource={issues.slice(0, 5)}
                renderItem={(issue: IssueType) => (
                  <List.Item>
                    <Link to={`/issue/${issue.number}`}>{issue.title}</Link>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
export default CommentsExample;
