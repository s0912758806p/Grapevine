import React from "react";
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
} from "antd";
import {
  ArrowLeftOutlined,
  PictureOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { createIssueThunk } from "../store/issuesSlice";
import { RootState, AppDispatch } from "../store";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const NewIssue: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.issues);

  const handleSubmit = async (values: { title: string; body: string }) => {
    const result = await dispatch(createIssueThunk(values));
    if (createIssueThunk.fulfilled.match(result)) {
      navigate("/");
    }
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

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === "loading"}
              size="large"
              style={{ borderRadius: 20 }}
            >
              Post
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
