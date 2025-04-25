import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Form,
  Input,
  Button,
  Space,
  Alert,
  Card,
  Select,
  message,
  Switch,
  Progress,
  Tag,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
  UserOutlined,
  SaveOutlined,
  UploadOutlined,
  LinkOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { RootState } from "../store";
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const NewIssue: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { status, error } = useSelector(
    (state: RootState) => state.githubIssues
  );
  const [useCustomTags, setUseCustomTags] = useState(false);
  const [postType, setPostType] = useState<string>("text");
  const [titleLength, setTitleLength] = useState<number>(0);
  const [bodyLength, setBodyLength] = useState<number>(0);
  const [suggestedTags] = useState<string[]>([
    "general",
    "help",
    "discussion",
    "question",
    "feature",
    "bug",
  ]);
  useEffect(() => {
    const savedUsername = localStorage.getItem("grapevine_username");
    if (savedUsername) {
      form.setFieldsValue({ userName: savedUsername });
    }
  }, [form]);
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleLength(e.target.value.length);
  };
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBodyLength(e.target.value.length);
  };
  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (name) {
      localStorage.setItem("grapevine_username", name);
    } else {
      localStorage.removeItem("grapevine_username");
    }
  };
  const handleSubmit = async () => {
    try {
      // 由於現在沒有 issuesSlice，直接顯示成功信息並導航到首頁
      // 實際應用中，此處應調用創建 issue 的 API
      message.success("Post created successfully!");
      navigate("/");
    } catch (err) {
      message.error("Failed to create post. Please try again.");
      console.error("Failed to create post:", err);
    }
  };
  const getTagColor = (tag: string): string => {
    const colors = {
      general: "blue",
      help: "purple",
      discussion: "gold",
      question: "green",
      feature: "cyan",
      bug: "red",
    };
    return colors[tag as keyof typeof colors] || "default";
  };
  const handleTagSelect = (tag: string) => {
    form.setFieldsValue({ tag });
  };
  return (
    <div className="new-post">
      <Link to="/">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{ marginBottom: 16 }}
        >
          Back to Posts
        </Button>
      </Link>
      <Card style={{ marginBottom: 20, borderRadius: 4 }}>
        <Title level={4} style={{ marginBottom: 20 }}>
          Create a post
        </Title>
        {status === "failed" && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark="optional"
        >
          <Form.Item style={{ marginBottom: 16 }}>
            <Select
              value={postType}
              onChange={setPostType}
              style={{ width: 180 }}
            >
              <Option value="text">
                <Space>
                  <FileTextOutlined />
                  <span>Post</span>
                </Space>
              </Option>
              <Option value="image">
                <Space>
                  <UploadOutlined />
                  <span>Image & Video</span>
                </Space>
              </Option>
              <Option value="link">
                <Space>
                  <LinkOutlined />
                  <span>Link</span>
                </Space>
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="userName"
            label="Your Username"
            tooltip={{
              title: "This name will appear as the post author",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Your username (optional)"
              maxLength={20}
              onChange={handleUserNameChange}
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter a title" },
              { min: 3, message: "Title should be at least 3 characters" },
            ]}
            extra={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {titleLength}/100 characters
                </Text>
                {titleLength > 0 && (
                  <Progress
                    percent={Math.min(100, (titleLength / 100) * 100)}
                    size="small"
                    showInfo={false}
                    style={{ width: 100 }}
                    status={titleLength < 3 ? "exception" : undefined}
                  />
                )}
              </div>
            }
          >
            <Input
              placeholder="An interesting title"
              size="large"
              style={{ borderRadius: 4 }}
              maxLength={100}
              onChange={handleTitleChange}
              showCount={false}
            />
          </Form.Item>
          <Form.Item
            name="body"
            label="Content"
            rules={[
              { required: true, message: "Please enter post content" },
              { min: 10, message: "Content should be at least 10 characters" },
            ]}
            extra={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {bodyLength}/10000 characters
                </Text>
                {bodyLength > 0 && (
                  <Progress
                    percent={Math.min(100, (bodyLength / 10000) * 100)}
                    size="small"
                    showInfo={false}
                    style={{ width: 100 }}
                    status={bodyLength < 10 ? "exception" : undefined}
                  />
                )}
              </div>
            }
          >
            <TextArea
              placeholder="Enter your post content here..."
              autoSize={{ minRows: 6, maxRows: 12 }}
              maxLength={10000}
              onChange={handleBodyChange}
              showCount={false}
            />
          </Form.Item>
          <div className="tag-section" style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text strong>Tags</Text>
              <Space>
                <Switch
                  checked={useCustomTags}
                  onChange={setUseCustomTags}
                  size="small"
                />
                <Text type="secondary">Use custom tags</Text>
              </Space>
            </div>
            {useCustomTags ? (
              <Form.Item
                name="tag"
                label="Custom Tag"
                rules={[
                  {
                    required: true,
                    message: "Please provide at least one tag",
                  },
                ]}
              >
                <Input
                  placeholder="Enter a tag (e.g. 'question', 'discussion')"
                  maxLength={20}
                />
              </Form.Item>
            ) : (
              <div className="suggested-tags">
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Suggested Tags</Text>
                </div>
                <Space wrap>
                  {suggestedTags.map((tag) => (
                    <Tag
                      key={tag}
                      color={getTagColor(tag)}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Space>
                <Form.Item
                  name="tag"
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one tag",
                    },
                  ]}
                  style={{ display: "none" }}
                >
                  <Input />
                </Form.Item>
              </div>
            )}
          </div>
          <Divider style={{ margin: "24px 0" }} />
          <div
            className="form-actions"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="notes">
              <Text type="secondary" style={{ fontSize: 12 }}>
                <Space>
                  <ExclamationCircleOutlined />
                  <span>
                    By posting, you agree to our community guidelines.
                  </span>
                </Space>
              </Text>
            </div>
            <div className="buttons">
              <Space>
                <Button onClick={() => navigate("/")}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={status === "loading"}
                >
                  Post
                </Button>
              </Space>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};
export default NewIssue;
