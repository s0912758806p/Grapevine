import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Avatar,
  Divider,
  Spin,
  Alert,
  Button,
  Card,
  message,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import dayjs from "dayjs";
import { RootState, AppDispatch } from "../store";
import { fetchRepositoryIssueThunk } from "../store/repositoriesSlice";
import UtterancesComments from "./UtterancesComments";
import { recordView } from "../services/analyticsService";

const { Title, Text } = Typography;

// Create a simple Markdown renderer without syntax highlighting
const SimpleMarkdownContent: React.FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
    {content}
  </ReactMarkdown>
);

const RepositoryIssueDetail: React.FC = () => {
  const { repoId, issueNumber } = useParams<{
    repoId: string;
    issueNumber: string;
  }>();
  const dispatch = useDispatch<AppDispatch>();

  const { currentIssue, status, error, repositories } = useSelector(
    (state: RootState) => state.repositories
  );

  // 查找相應的倉庫數據
  const repository = repositories.find((repo) => repo.id === repoId);

  useEffect(() => {
    if (repoId && issueNumber) {
      dispatch(
        fetchRepositoryIssueThunk({
          repoId,
          issueNumber: parseInt(issueNumber, 10),
        })
      )
        .unwrap()
        .then((issue) => {
          // Record view in analytics
          recordView(issue);
        })
        .catch((error) => {
          console.error("Failed to fetch repository issue:", error);
          message.error("Failed to load issue details.");
        });
    }
  }, [dispatch, repoId, issueNumber, message]);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <Alert
        message="Load error"
        description={error || "Cannot load issue details"}
        type="error"
        showIcon
      />
    );
  }

  if (!currentIssue) {
    return (
      <Alert
        message="Not found"
        description="Cannot find the specified issue or repository source"
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="issue-detail-container" style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* 返回按鈕 */}
            <Link to="/">
              <Button icon={<ArrowLeftOutlined />}>Back to list</Button>
            </Link>

            {/* 來源標籤 */}
            {repository && (
              <Tag color="#108ee9" style={{ marginBottom: 8 }}>
                {repository.name}
              </Tag>
            )}

            {/* 標題 */}
            <Title level={2}>{currentIssue.title}</Title>

            {/* 作者資訊和時間 */}
            <Space split={<Divider type="vertical" />}>
              <Space>
                <Avatar src={currentIssue.user.avatar_url} />
                <Text strong>{currentIssue.user.login}</Text>
              </Space>

              <Space>
                <ClockCircleOutlined />
                <Text>
                  {dayjs(currentIssue.created_at).format("YYYY-MM-DD HH:mm")}
                </Text>
              </Space>

              {currentIssue.html_url && (
                <a
                  href={currentIssue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button type="link" icon={<GithubOutlined />}>
                    View on GitHub
                  </Button>
                </a>
              )}
            </Space>

            {/* 標籤 */}
            <div>
              {currentIssue.labels.map((label) => (
                <Tag
                  key={label.name}
                  color={`#${label.color}`}
                  style={{ marginRight: 8, marginBottom: 8 }}
                >
                  {label.name}
                </Tag>
              ))}
            </div>

            <Divider />

            {/* 內容 */}
            <Card bordered={false} style={{ width: "100%" }}>
              <div className="markdown-body">
                <SimpleMarkdownContent content={currentIssue.body || ""} />
              </div>
            </Card>

            <Divider orientation="left">Comments</Divider>

            {/* 評論區 */}
            {repository && (
              <UtterancesComments
                repo={`${repository.owner}/${repository.repo}`}
                issueTerm={currentIssue.number.toString()}
              />
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default RepositoryIssueDetail;
