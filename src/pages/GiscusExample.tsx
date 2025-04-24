import React from "react";
import { Typography, Card, Space, Alert, Divider } from "antd";
import GiscusAuth from "../components/GiscusAuth";
import { giscusConfig } from "../utils/giscusConfig";
import { useAuth } from "../auth/AuthContext";

const { Title, Paragraph } = Typography;

const GiscusExample: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography>
        <Title level={2}>Giscus Comments</Title>
        <Paragraph>
          Giscus is a comments system powered by GitHub Discussions. To comment,
          you need to authorize with your GitHub account.
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
        <Alert
          message="GitHub Authentication Required"
          description="Please sign in with GitHub using the button below to participate in discussions."
          type="info"
          showIcon
        />
      )}

      <Divider />

      <Card>
        <GiscusAuth {...giscusConfig} />
      </Card>
    </Space>
  );
};

export default GiscusExample;
