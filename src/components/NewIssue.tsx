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
  ExclamationCircleOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { RootState } from "../store";
const { Title, Text } = Typography;
const { TextArea } = Input;
const NewIssue: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { status, error } = useSelector(
    (state: RootState) => state.githubIssues
  );
  const [useCustomTags, setUseCustomTags] = useState(false);
  const [titleLength, setTitleLength] = useState<number>(0);
  const [bodyLength, setBodyLength] = useState<number>(0);
  const [suggestedTags] = useState<string[]>([
    "enhancement",
    "bug",
    "documentation",
    "question",
    "help-wanted",
    "good-first-issue",
  ]);

  const repository = `${import.meta.env.VITE_GITHUB_REPO_OWNER}/${
    import.meta.env.VITE_GITHUB_REPO_NAME
  }`;

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
      // 顯示成功訊息
      message.success(`Issue created successfully in ${repository}!`);
      // 跳轉到Issue提交頁面，將表單數據傳遞過去
      navigate("/issue-submitted", {
        state: {
          issueData: {
            ...form.getFieldsValue(),
            repository,
            number: Math.floor(Math.random() * 1000), // 模擬issue編號
            created_at: new Date().toISOString(),
            status: "open",
            labels: form.getFieldValue("tag")
              ? [form.getFieldValue("tag")]
              : [],
          },
        },
      });
    } catch (err) {
      message.error("Failed to create issue. Please try again.");
      console.error("Failed to create issue:", err);
    }
  };
  const getTagColor = (tag: string): string => {
    const colors = {
      enhancement: "blue",
      bug: "red",
      documentation: "purple",
      question: "green",
      "help-wanted": "orange",
      "good-first-issue": "cyan",
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
          Back
        </Button>
      </Link>
      <Card style={{ marginBottom: 20, borderRadius: 4 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          <GithubOutlined style={{ marginRight: 12 }} />
          Create a New Issue
        </Title>

        <Alert
          message={`This issue will be created in: ${repository}`}
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

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
          <Form.Item
            name="userName"
            label="Your Username"
            tooltip={{
              title: "This name will appear as the issue author",
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
            label="Issue Title"
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
              placeholder="Brief description of the issue"
              size="large"
              style={{ borderRadius: 4 }}
              maxLength={100}
              onChange={handleTitleChange}
              showCount={false}
            />
          </Form.Item>
          <Form.Item
            name="body"
            label="Issue Description"
            rules={[
              { required: true, message: "Please enter issue description" },
              {
                min: 10,
                message: "Description should be at least 10 characters",
              },
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
              placeholder="Provide a detailed description of the issue..."
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Switch
                  size="small"
                  checked={useCustomTags}
                  onChange={setUseCustomTags}
                  style={{ marginRight: 8 }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Custom tag
                </Text>
              </div>
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
