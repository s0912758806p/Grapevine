import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Card,
  List,
  Avatar,
  Form,
  Input,
  Button,
  Divider,
  Empty,
  message,
  Spin,
  Tooltip,
  Alert,
} from "antd";
import {
  CommentOutlined,
  UserOutlined,
  SendOutlined,
  LikeOutlined,
  DislikeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { fetchCommentsThunk, addCommentThunk } from "../store/commentsSlice";
import { RootState, AppDispatch } from "../store";
import { createSelector } from "@reduxjs/toolkit";
dayjs.extend(relativeTime);
const { Text, Paragraph } = Typography;
const { TextArea } = Input;
interface CommentSectionProps {
  issueNumber: number;
  className?: string;
}
const makeSelectCommentsData = () =>
  createSelector(
    [
      (state: RootState) => state.comments.comments,
      (state: RootState) => state.comments.status,
      (state: RootState) => state.comments.error,
      (_: RootState, issueNumber: number) => issueNumber,
    ],
    (commentsData, status, error, issueNumber) => ({
      comments: commentsData[issueNumber] || [],
      status,
      error,
    })
  );
const CommentSection: React.FC<CommentSectionProps> = ({
  issueNumber,
  className = "",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [userName, setUserName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [characterCount, setCharacterCount] = useState<number>(0);
  const [commentLikes, setCommentLikes] = useState<Record<number, number>>({});
  const [baseCommentLikes, setBaseCommentLikes] = useState<
    Record<number, number>
  >({});
  const selectCommentsData = useMemo(() => makeSelectCommentsData(), []);
  const { comments, status, error } = useSelector((state: RootState) =>
    selectCommentsData(state, issueNumber)
  );
  useEffect(() => {
    const savedUsername = localStorage.getItem("grapevine_username");
    if (savedUsername) {
      setUserName(savedUsername);
      form.setFieldsValue({ userName: savedUsername });
    }
  }, [form]);
  useEffect(() => {
    if (issueNumber) {
      dispatch(fetchCommentsThunk(issueNumber));
    }
  }, [dispatch, issueNumber]);
  useEffect(() => {
    if (comments.length > 0 && Object.keys(baseCommentLikes).length === 0) {
      const initialBaseLikes: Record<number, number> = {};
      comments.forEach((comment) => {
        initialBaseLikes[comment.id] = Math.floor(Math.random() * 5) + 1;
      });
      setBaseCommentLikes(initialBaseLikes);
    }
  }, [comments, baseCommentLikes]);
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharacterCount(e.target.value.length);
    },
    []
  );
  const handleUserNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setUserName(name);
      if (name) {
        localStorage.setItem("grapevine_username", name);
      } else {
        localStorage.removeItem("grapevine_username");
      }
    },
    []
  );
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
  const handleSubmit = async (values: { body: string; userName?: string }) => {
    if (!values.body.trim()) {
      message.warning("評論內容不能為空");
      return;
    }
    try {
      setSubmitting(true);
      await dispatch(
        addCommentThunk({
          issueNumber,
          body: values.body,
          userName: values.userName || userName || undefined,
        })
      ).unwrap();
      form.resetFields(["body"]);
      setCharacterCount(0);
      message.success("評論發布成功");
    } catch {
      message.error("發布評論失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };
  const getCommentLikeCount = (commentId: number) => {
    const baseCount = baseCommentLikes[commentId] || 1;
    const userVote = commentLikes[commentId] || 0;
    return Math.max(0, baseCount + userVote);
  };
  return (
    <div className={`comment-section ${className}`}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <CommentOutlined style={{ marginRight: 8 }} />
            <span>評論 ({comments.length})</span>
          </div>
        }
        bordered={false}
        style={{ marginTop: 16 }}
        extra={
          status === "loading" && comments.length === 0 ? (
            <Spin size="small" />
          ) : null
        }
      >
        {}
        {status === "failed" && (
          <Alert
            message="Failed to load comments"
            description={error || "Please try again later"}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {}
        {status === "loading" && comments.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px 0",
            }}
          >
            <Spin />
          </div>
        ) : comments.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={comments}
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
                        color:
                          commentLikes[comment.id] === 1
                            ? "#1890ff"
                            : undefined,
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
                          commentLikes[comment.id] === -1
                            ? "#ff4d4f"
                            : undefined,
                      }}
                    />
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={comment.user.avatar_url}
                      alt={comment.user.login}
                    />
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong>{comment.user.login}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(comment.created_at).fromNow()}
                      </Text>
                    </div>
                  }
                  description={
                    <Paragraph
                      style={{
                        whiteSpace: "pre-wrap",
                        margin: 0,
                      }}
                      ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
                    >
                      {comment.body}
                    </Paragraph>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description="Be the first to comment"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
        <Divider />
        {}
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="userName"
            label="Your Name"
            tooltip={{
              title: "This name will be displayed with your comment",
              icon: <InfoCircleOutlined />,
            }}
            initialValue={userName}
          >
            <Input
              placeholder="Your name (optional)"
              prefix={<UserOutlined />}
              maxLength={20}
              onChange={handleUserNameChange}
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="body"
            label="Your Comment"
            rules={[{ required: true, message: "Please enter your comment" }]}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {characterCount}/1000 characters
              </Text>
            }
          >
            <TextArea
              rows={4}
              placeholder="Share your thoughts..."
              maxLength={1000}
              showCount={false}
              onChange={handleTextChange}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={submitting}
              disabled={status === "loading"}
            >
              Submit Comment
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
export default CommentSection;
