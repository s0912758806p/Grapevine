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
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import CommentSection from "../components/CommentSection";
import { fetchCommentsThunk } from "../store/commentsSlice";
import { fetchGithubIssuesThunk } from "../store/githubIssuesSlice";
import { RootState, AppDispatch } from "../store";
import { CommentType } from "../types";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
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
  const issues = useSelector((state: RootState) => state.githubIssues.issues);
  const commentsById = useSelector(
    (state: RootState) => state.comments.comments
  );
  useEffect(() => {
    dispatch(fetchGithubIssuesThunk({ page: 1, perPage: 20 }));
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
  // Define Tabs items
  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <CommentOutlined /> Comment Thread
        </span>
      ),
      children: (
        <Card>
          <Select
            style={{ width: "100%", marginBottom: 16 }}
            placeholder="Select an issue to view comments"
            onChange={handleIssueChange}
            value={selectedIssueNumber}
          >
            {issues.map((issue) => (
              <Option key={issue.number} value={issue.number}>
                #{issue.number} - {issue.title}
              </Option>
            ))}
          </Select>
          {selectedIssueNumber && commentsById[selectedIssueNumber] ? (
            <CommentSection
              issueNumber={selectedIssueNumber}
            />
          ) : (
            <Empty description="No comments found. Select an issue to view its comments." />
          )}
        </Card>
      )
    },
    {
      key: "2",
      label: (
        <span>
          <FireOutlined /> Recent Activity
        </span>
      ),
      children: (
        <Card>{recentComments.length > 0 ? renderRecentComments() : <Empty />}</Card>
      )
    }
  ];
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
          <Tabs defaultActiveKey="1" items={tabItems} />
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Forum Statistics" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Topics"
                  value={issues.length}
                  prefix={<EyeOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Comments"
                  value={totalComments}
                  prefix={<CommentOutlined />}
                />
              </Col>
              <Col span={24}>
                <Divider style={{ margin: "12px 0" }} />
                <Title level={5}>Most Active Users</Title>
                {activeUsers.length > 0 ? (
                  renderActiveUsers()
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No active users yet"
                  />
                )}
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default CommentsExample;
