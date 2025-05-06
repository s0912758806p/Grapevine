import React from "react";
import { Row, Col, Typography, Divider } from "antd";
import AnonymousRumors from "./AnonymousRumors";
import ActiveLeaderboard from "./ActiveLeaderboard";
import RumorDigest from "./RumorDigest";
import "../../styles/Community.scss";

const { Title } = Typography;

const CommunityFeatures: React.FC = () => {
  return (
    <div className="community-features-container">
      <div className="community-header">
        <Title level={2} className="community-title">
          Grapevine Community
        </Title>
        <p className="community-subtitle">
          Where tech professionals share insights, rumors, and stay connected
        </p>
      </div>

      <Divider className="community-divider" />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <AnonymousRumors />
        </Col>
        <Col xs={24} lg={10}>
          <ActiveLeaderboard />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24}>
          <RumorDigest />
        </Col>
      </Row>
    </div>
  );
};

export default CommunityFeatures;
