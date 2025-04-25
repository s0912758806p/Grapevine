import React from "react";
import { Typography, Card, Space, Alert, Divider, Button } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import Utterances from "../components/Utterances";
import { utterancesConfig } from "../utils/utterancesConfig";
import { useAuth } from "../auth/AuthContext";

const { Title, Paragraph } = Typography;

const CommentsExample: React.FC = () => {
  const { isAuthenticated, user, login } = useAuth();

  const handleLogin = () => {
    login();
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography>
        <Title level={2}>GitHub Comments</Title>
        <Paragraph>
          Utterances is a lightweight comments widget built on GitHub issues. To
          comment, you need to authorize with your GitHub account.
        </Paragraph>
      </Typography>

      {isAuthenticated ? (
        <Alert
          message="GitHub Authentication"
          description={
            <>
              You are logged in as{" "}
              <strong>{user?.name || user?.login || "GitHub User"}</strong>. You
              can now comment on discussions using your GitHub account.
            </>
          }
          type="success"
          showIcon
        />
      ) : (
        <>
          <Alert
            message="GitHub Authentication Required"
            description="Please sign in with GitHub to participate in discussions."
            type="info"
            showIcon
          />
          <Button
            type="primary"
            icon={<GithubOutlined />}
            onClick={handleLogin}
            size="large"
          >
            Login with GitHub
          </Button>
        </>
      )}

      <Divider />

      <Card>
        <Utterances {...utterancesConfig} />
      </Card>
    </Space>
  );
};

export default CommentsExample;
