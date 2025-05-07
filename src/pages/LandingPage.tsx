import React from "react";
import { Typography, Row, Col, Card, Button, Space, Divider } from "antd";
import { Link } from "react-router-dom";
import {
  BranchesOutlined,
  TeamOutlined,
  FileSearchOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";
import "../styles/LandingPage.scss";

const { Title, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="content-overlay">
          <Title style={{ color: "#fff" }} level={1}>
            Grapevine
          </Title>
          <Paragraph className="hero-subtitle">
            Cultivate collaboration, branch out ideas, and grow your projects
            together
          </Paragraph>
          <Space size="middle">
            <Link to="/created-issues">
              <Button type="primary" size="large" className="hero-button">
                See Issues
              </Button>
            </Link>
            <Link to="/new-issue">
              <Button size="large" className="hero-button-secondary">
                Create New Issue
              </Button>
            </Link>
          </Space>
        </div>
      </div>

      <div className="features-section">
        <Title level={2} className="section-title">
          How Grapevine Helps Your Team Flourish
        </Title>

        <Row gutter={[32, 32]} className="feature-cards">
          <Col xs={24} md={12} lg={6}>
            <Card className="feature-card" variant="borderless">
              <BranchesOutlined className="feature-icon" />
              <Title level={4}>Branch & Connect</Title>
              <Paragraph>
                Link related issues across repositories like branches on a vine,
                creating natural workflows.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Card className="feature-card" variant="borderless">
              <TeamOutlined className="feature-icon" />
              <Title level={4}>Community Tending</Title>
              <Paragraph>
                Nurture contributions and foster growth through integrated
                communication tools.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Card className="feature-card" variant="borderless">
              <FileSearchOutlined className="feature-icon" />
              <Title level={4}>Issue Cultivation</Title>
              <Paragraph>
                Organize and prioritize issues with intuitive tracking and
                filtering capabilities.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Card className="feature-card" variant="borderless">
              <AreaChartOutlined className="feature-icon" />
              <Title level={4}>Growth Insights</Title>
              <Paragraph>
                Visualize project progress and team contributions with
                beautiful, organic analytics.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider className="section-divider" />

      <div className="dashboard-preview">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} lg={12}>
            <Title level={2} className="section-title">
              Your Development Ecosystem
            </Title>
            <Paragraph className="preview-text">
              Grapevine transforms how teams collaborate on GitHub issues and
              project management. With an organic approach to development
              workflows, you can visualize connections between issues,
              repositories, and team members.
            </Paragraph>
            <Link to="/analytics">
              <Button type="primary" className="preview-button">
                Explore Analytics
              </Button>
            </Link>
          </Col>
          <Col xs={24} lg={12}>
            <div className="preview-image-container">
              <div className="preview-image dashboard-image"></div>
            </div>
          </Col>
        </Row>
      </div>

      <Divider className="section-divider" />

      <div className="location-preview">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} lg={12} className="preview-image-col">
            <div className="preview-image-container">
              <div className="preview-image map-image"></div>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <Title level={2} className="section-title">
              Geographic Project Roots
            </Title>
            <Paragraph className="preview-text">
              Visualize where your team and contributions come from with
              integrated geographical mapping. Connect with collaborators and
              understand the global reach of your project's influence.
            </Paragraph>
            <Link to="/location">
              <Button type="primary" className="preview-button">
                View Map
              </Button>
            </Link>
          </Col>
        </Row>
      </div>

      <div className="cta-section">
        <Title level={2}>Ready to Watch Your Projects Thrive?</Title>
        <Paragraph>
          Join the growing community of teams using Grapevine to tend to their
          GitHub projects.
        </Paragraph>
        <Link to="/">
          <Button type="primary" size="large" className="cta-button">
            Get Started Today
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
