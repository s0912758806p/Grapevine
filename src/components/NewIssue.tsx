import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Tooltip,
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
import {
  createIssueThunk,
  createIssueWithLabelsThunk,
} from "../store/issuesSlice";
import { RootState, AppDispatch } from "../store";
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const NewIssue: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.issues);
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
  const handleSubmit = async (values: {
    title: string;
    body: string;
    tag?: string;
    userName?: string;
  }) => {
    const { title, body, tag, userName } = values;
    try {
      let result;
      if (useCustomTags && tag) {
        result = await dispatch(
          createIssueWithLabelsThunk({
            title,
            body,
            tag,
            userName,
          })
        );
      } else {
        result = await dispatch(
          createIssueThunk({
            title,
            body,
            userName,
          })
        );
      }
      if (result.meta.requestStatus === "fulfilled") {
        message.success("Post created successfully!");
        navigate("/");
      }
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
                  {bodyLength}/2000 characters
                </Text>
                {bodyLength > 0 && (
                  <Progress
                    percent={Math.min(100, (bodyLength / 2000) * 100)}
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
              placeholder="Share your thoughts in detail..."
              rows={8}
              style={{ resize: "vertical", borderRadius: 4 }}
              maxLength={2000}
              onChange={handleBodyChange}
              showCount={false}
            />
          </Form.Item>
          <Form.Item>
            <Space align="center">
              <Switch
                checked={useCustomTags}
                onChange={(checked) => setUseCustomTags(checked)}
              />
              <Text>Add tags to your post</Text>
              <Tooltip title="Tags help categorize your post and make it easier to find">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          </Form.Item>
          {useCustomTags && (
            <>
              <Form.Item
                name="tag"
                label="Tag"
                rules={[
                  { required: true, message: "Please enter or select a tag" },
                ]}
                extra={
                  <Paragraph style={{ fontSize: 12 }}>
                    <Text type="secondary">
                      Select from suggested tags or enter your own
                    </Text>
                  </Paragraph>
                }
              >
                <Input
                  placeholder="Enter a tag (e.g., 'discussion', 'question')"
                  style={{ borderRadius: 4 }}
                  suffix={
                    <Tooltip title="Tags help categorize your post">
                      <InfoCircleOutlined
                        style={{ color: "rgba(0,0,0,.45)" }}
                      />
                    </Tooltip>
                  }
                />
              </Form.Item>
              <div style={{ marginBottom: 16 }}>
                <Text style={{ marginRight: 8 }}>Suggested tags:</Text>
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
              </div>
            </>
          )}
          <Divider />
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
                loading={status === "loading"}
              >
                Create Post
              </Button>
              <Button
                htmlType="button"
                size="large"
                danger
                icon={<ExclamationCircleOutlined />}
                onClick={() => {
                  form.resetFields();
                  setTitleLength(0);
                  setBodyLength(0);
                }}
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
export default NewIssue;
