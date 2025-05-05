import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Typography,
  Result,
  Descriptions,
  Tag,
  Button,
  Card,
  Space,
  Divider,
} from "antd";
import {
  TagOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import VineAnimation from "../components/VineAnimation";

const { Title, Paragraph } = Typography;

const IssueSubmissionPage: React.FC = () => {
  // 從location獲取issue數據，如果沒有則使用示例數據
  const location = useLocation();
  const issueData = location.state?.issueData || {
    title: "Example Issue Title",
    body: "This is an example issue description. In a real application, this would contain the actual content of the submitted issue.",
    labels: ["enhancement", "documentation", "good first issue"],
    repository: `${import.meta.env.VITE_GITHUB_REPO_OWNER}/${
      import.meta.env.VITE_GITHUB_REPO_NAME
    }`,
    number: "123",
    created_at: new Date().toISOString(),
    status: "open",
  };

  return (
    <div className="issue-submission-page">
      <VineAnimation className="vine-background" />

      <div className="content-container">
        <Result
          status="success"
          title="Issue Successfully Created!"
          subTitle={`Your issue has been submitted to ${issueData.repository} and is now being tracked.`}
          extra={[
            <Link to="/created-issues" key="view-issues">
              <Button type="primary">View Author Issues</Button>
            </Link>,
            <Link to="/new-issue" key="create-another">
              <Button>Create Another Issue</Button>
            </Link>,
          ]}
        />

        <Divider />

        <Card
          title={
            <Title level={4} style={{ margin: 0 }}>
              <FileTextOutlined style={{ marginRight: 12 }} />
              Issue Details
            </Title>
          }
          className="issue-details-card"
        >
          <Descriptions
            bordered
            column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
          >
            <Descriptions.Item label="Title" span={3}>
              {issueData.title}
            </Descriptions.Item>

            <Descriptions.Item label="Issue Number">
              #{issueData.number}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag color={issueData.status === "open" ? "green" : "red"}>
                {issueData.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Repository">
              <Space>
                <GithubOutlined />
                {issueData.repository}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Created" span={3}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              {new Date(issueData.created_at).toLocaleString()}
            </Descriptions.Item>

            <Descriptions.Item label="Labels" span={3}>
              <Space size="small" wrap>
                {issueData.labels.map((label: string, index: number) => (
                  <Tag
                    key={index}
                    color={getTagColor(label)}
                    icon={<TagOutlined />}
                  >
                    {label}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Description" span={3}>
              <div className="issue-description">{issueData.body}</div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Paragraph type="secondary">
            This issue has been successfully logged in the author's repository
            and can be viewed on the Author Issues page.
          </Paragraph>

          <Link to="/">
            <Button type="link" icon={<ArrowLeftOutlined />}>
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate colors for tags
function getTagColor(label: string): string {
  const colors = {
    bug: "red",
    enhancement: "blue",
    documentation: "purple",
    "good first issue": "green",
    help: "orange",
    question: "cyan",
  };
  return colors[label as keyof typeof colors] || "default";
}

export default IssueSubmissionPage;
