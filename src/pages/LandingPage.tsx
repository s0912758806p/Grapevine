import React from "react";
import { Typography, Row, Col, Card, Button, Space, Tag } from "antd";
import { Link } from "react-router-dom";
import {
  CodeOutlined,
  BookOutlined,
  TeamOutlined,
  AreaChartOutlined,
  EditOutlined,
  CommentOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  FireOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import "../styles/LandingPage.scss";

const { Title, Paragraph } = Typography;

const channels = [
  {
    icon: <CodeOutlined />,
    title: "F2E Jobs",
    desc: "Curated frontend engineer job listings, maintained by the community and updated regularly.",
    tag: "Jobs",
    tagColor: "#1e5631",
    link: "/essays?tab=f2e-jobs",
    cta: "Browse Jobs",
  },
  {
    icon: <BookOutlined />,
    title: "Ruanyf Weekly",
    desc: "Ruan Yifeng's tech enthusiast weekly digest — curated articles and resources every week.",
    tag: "Weekly",
    tagColor: "#5e2a69",
    link: "/essays?tab=ruanyf-weekly",
    cta: "Read Weekly",
  },
  {
    icon: <EditOutlined />,
    title: "Author Articles",
    desc: "Developers publish technical insights, project reflections, and learning notes here.",
    tag: "Articles",
    tagColor: "#3d7a4f",
    link: "/essays?tab=author-issues",
    cta: "Read Articles",
  },
  {
    icon: <TeamOutlined />,
    title: "Community",
    desc: "Anonymous discussion board, active contributor rankings — where developers connect.",
    tag: "Community",
    tagColor: "#8a4a95",
    link: "/community",
    cta: "Join Discussion",
  },
];

const features = [
  {
    icon: <GlobalOutlined />,
    title: "Aggregated Quality Content",
    desc: "Integrates content from multiple GitHub repositories — F2E jobs, tech weeklies, and community articles all in one place.",
  },
  {
    icon: <CommentOutlined />,
    title: "Discuss & Share",
    desc: "Comment directly under any article, or share ideas anonymously on the community board. Backed by GitHub Issues for a traceable discussion trail.",
  },
  {
    icon: <AreaChartOutlined />,
    title: "Track & Analyze",
    desc: "View reading history, trending tags, and repository activity. Let data drive your learning path and technology decisions.",
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="hero-section">
        <div className="hero-badge">
          <FireOutlined />
          <span>Developer Content Community</span>
        </div>

        <Title level={1} className="hero-title">
          Discuss, Post, and Share Your
          <span className="hero-title-accent"> Developer Ideas</span>
        </Title>

        <Paragraph className="hero-subtitle">
          Grapevine is a developer community platform built on GitHub Issues.<br />
          Read tech articles, browse frontend jobs, follow weekly digests, and connect with developers worldwide.
        </Paragraph>

        <Space size="middle" wrap className="hero-actions">
          <Link to="/essays">
            <Button type="primary" size="large" icon={<RocketOutlined />} className="hero-btn-primary">
              Start Exploring
            </Button>
          </Link>
          <Link to="/community">
            <Button size="large" icon={<TeamOutlined />} className="hero-btn-secondary">
              Join Community
            </Button>
          </Link>
        </Space>

        <div className="hero-tags">
          <Tag color="purple">Tech Articles</Tag>
          <Tag color="green">F2E Jobs</Tag>
          <Tag color="blue">Ruanyf Weekly</Tag>
          <Tag color="orange">Developer Community</Tag>
        </div>
      </div>

      {/* ── Channels ──────────────────────────────────── */}
      <div className="channels-section">
        <div className="section-header">
          <Title level={2} className="section-title">Explore Content Channels</Title>
          <Paragraph className="section-desc">
            Four channels covering all the developer content you need
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {channels.map((ch) => (
            <Col xs={24} sm={12} lg={6} key={ch.title}>
              <Card className="channel-card" variant="borderless">
                <div className="channel-icon" style={{ color: ch.tagColor }}>
                  {ch.icon}
                </div>
                <Tag
                  className="channel-tag"
                  style={{ backgroundColor: ch.tagColor, color: "white", border: "none" }}
                >
                  {ch.tag}
                </Tag>
                <Title level={4} className="channel-title">{ch.title}</Title>
                <Paragraph className="channel-desc">{ch.desc}</Paragraph>
                <Link to={ch.link}>
                  <Button
                    type="link"
                    className="channel-cta"
                    style={{ color: ch.tagColor, paddingLeft: 0 }}
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                  >
                    {ch.cta}
                  </Button>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ── Features ──────────────────────────────────── */}
      <div className="features-section">
        <div className="section-header">
          <Title level={2} className="section-title">Why Grapevine?</Title>
          <Paragraph className="section-desc">
            More than a reading tool — a community ecosystem for developer growth
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          {features.map((f) => (
            <Col xs={24} md={8} key={f.title}>
              <div className="feature-item">
                <div className="feature-icon-wrap">{f.icon}</div>
                <Title level={4} className="feature-title">{f.title}</Title>
                <Paragraph className="feature-desc">{f.desc}</Paragraph>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* ── CTA Banner ────────────────────────────────── */}
      <div className="cta-section">
        <Title level={2} className="cta-title">Ready to get started?</Title>
        <Paragraph className="cta-desc">
          Join Grapevine and discuss, learn, and grow with developers worldwide.
        </Paragraph>
        <Space size="middle" wrap>
          <Link to="/essays">
            <Button type="primary" size="large" className="cta-btn-primary">
              Browse All Articles
            </Button>
          </Link>
          <Link to="/new-issue">
            <Button size="large" ghost className="cta-btn-secondary">
              Post Your Thoughts
            </Button>
          </Link>
        </Space>
      </div>
    </div>
  );
};

export default LandingPage;
