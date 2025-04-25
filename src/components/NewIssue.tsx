import React, { useState } from "react";
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
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  PictureOutlined,
  LinkOutlined,
  LoginOutlined,
  GithubOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { createIssueAsUserThunk } from "../store/issuesSlice";
import { RootState, AppDispatch } from "../store";
import { useAuth } from "../auth/AuthContext";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const NewIssue: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.issues);
  const { isAuthenticated, user, login, getUserToken } = useAuth();
  const [useCustomRepo, setUseCustomRepo] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // 處理提交
  const handleSubmit = async (values: {
    title: string;
    body: string;
    owner?: string;
    repo?: string;
  }) => {
    if (!isAuthenticated || !user) {
      messageApi.error("Please login with GitHub to create an issue");
      return;
    }

    const { title, body, owner, repo } = values;

    try {
      // 獲取用戶 token
      const token = getUserToken();

      if (!token) {
        messageApi.error(
          "Authentication token not found. Please try logging in again."
        );
        return;
      }

      // 使用用戶 token 創建 Issue
      const result = await dispatch(
        createIssueAsUserThunk({
          title,
          body,
          token,
          owner: useCustomRepo ? owner : undefined,
          repo: useCustomRepo ? repo : undefined,
        })
      );

      if (createIssueAsUserThunk.fulfilled.match(result)) {
        messageApi.success("Issue created successfully!");
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to create issue:", err);
    }
  };

  // 如果用戶未登錄，顯示登錄提示
  if (!isAuthenticated || !user) {
    return (
      <div className="new-post">
        {contextHolder}
        <Link to="/">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{ marginBottom: 16 }}
          >
            Back to Posts
          </Button>
        </Link>

        <Card style={{ textAlign: "center", padding: 24 }}>
          <Empty
            image={<GithubOutlined style={{ fontSize: 64 }} />}
            description={
              <Text>You need to login with GitHub before creating a post</Text>
            }
          />
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => login()}
            size="large"
            style={{ marginTop: 16 }}
          >
            Login with GitHub
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="new-post">
      {contextHolder}
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
          Create a post as {user.name || user.login}
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
        >
          <Form.Item style={{ marginBottom: 16 }}>
            <Select defaultValue="text" style={{ width: 140 }}>
              <Option value="text">Post</Option>
              <Option value="image">Image & Video</Option>
              <Option value="link">Link</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input
              placeholder="Title"
              size="large"
              style={{ borderRadius: 4 }}
            />
          </Form.Item>

          <Form.Item
            name="body"
            rules={[{ required: true, message: "Please enter post content" }]}
          >
            <TextArea
              placeholder="Text (optional)"
              rows={8}
              style={{ resize: "vertical", borderRadius: 4 }}
            />
          </Form.Item>

          <Form.Item>
            <Space align="center">
              <Switch
                checked={useCustomRepo}
                onChange={(checked) => setUseCustomRepo(checked)}
              />
              <Text>Use custom repository</Text>
              <Tooltip title="Enable this to specify your own GitHub repository for the issue">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          </Form.Item>

          {useCustomRepo && (
            <>
              <Form.Item
                name="owner"
                rules={[
                  { required: true, message: "Please enter repository owner" },
                ]}
              >
                <Input
                  placeholder="Repository Owner (username or organization)"
                  addonBefore="Owner"
                  defaultValue={user.login}
                />
              </Form.Item>

              <Form.Item
                name="repo"
                rules={[
                  { required: true, message: "Please enter repository name" },
                ]}
              >
                <Input placeholder="Repository Name" addonBefore="Repo" />
              </Form.Item>
            </>
          )}

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === "loading"}
              size="large"
              style={{ borderRadius: 20 }}
            >
              Post as {user.login}
            </Button>
            <Button icon={<PictureOutlined />} style={{ borderRadius: 20 }}>
              Images
            </Button>
            <Button icon={<LinkOutlined />} style={{ borderRadius: 20 }}>
              Link
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default NewIssue;
