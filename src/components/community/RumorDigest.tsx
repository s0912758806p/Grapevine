import React from "react";
import {
  Card,
  Typography,
  Button,
  List,
  Row,
  Col,
  Space,
  Tag,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  StarOutlined,
  LikeOutlined,
  CommentOutlined,
  RightOutlined,
  MailOutlined,
} from "@ant-design/icons";
import "../../styles/Community.scss";

const { Title, Paragraph, Text } = Typography;

// Mock data for rumor digest
const DIGEST_DATA = {
  week: "May 12-18, 2024",
  highlightRumor: {
    title: "The Next Big JavaScript Framework",
    content:
      "Industry insiders have shared rumors that a new JavaScript framework that combines the best of React, Vue, and Svelte is being developed by veteran engineers from major tech companies. Early tests show 2x performance improvements over existing solutions.",
    votes: 241,
    comments: 53,
  },
  topRumors: [
    {
      id: 1,
      title: "Major Backend Framework Security Vulnerability",
      excerpt:
        "A critical zero-day vulnerability affecting a popular backend framework is set to be disclosed next week...",
      tags: ["Security", "Backend"],
    },
    {
      id: 2,
      title: "Big Tech Acquires AI Startup",
      excerpt:
        "Sources claim that one of the Silicon Valley giants has quietly acquired an AI research startup for their breakthrough in natural language processing...",
      tags: ["AI", "Acquisition"],
    },
    {
      id: 3,
      title: "Browser Vendor Working on Revolutionary Feature",
      excerpt:
        "A major browser vendor is reportedly working on a feature that could fundamentally change how web applications are structured...",
      tags: ["Web", "Browsers"],
    },
  ],
};

const RumorDigest: React.FC = () => {
  return (
    <Card className="rumor-digest">
      <Row gutter={[0, 16]} align="middle" className="digest-header">
        <Col span={18}>
          <Title level={4} className="section-title no-margin">
            <StarOutlined /> Weekly Rumor Digest
          </Title>
          <div className="digest-date">
            <CalendarOutlined /> {DIGEST_DATA.week}
          </div>
        </Col>
        <Col span={6} className="subscribe-container">
          <Button type="primary" icon={<MailOutlined />} size="small">
            Subscribe
          </Button>
        </Col>
      </Row>

      <div className="newsletter-content">
        <div className="highlight-rumor">
          <Text strong className="highlight-label">
            TOP STORY
          </Text>
          <Title level={5} className="highlight-title">
            {DIGEST_DATA.highlightRumor.title}
          </Title>
          <Paragraph className="highlight-content">
            {DIGEST_DATA.highlightRumor.content}
          </Paragraph>

          <Space size="middle" className="highlight-stats">
            <span>
              <LikeOutlined /> {DIGEST_DATA.highlightRumor.votes} votes
            </span>
            <span>
              <CommentOutlined /> {DIGEST_DATA.highlightRumor.comments} comments
            </span>
          </Space>
        </div>

        <Divider className="digest-divider" />

        <div className="trending-rumors">
          <Title level={5} className="section-subtitle">
            Also Trending This Week
          </Title>

          <List
            itemLayout="vertical"
            dataSource={DIGEST_DATA.topRumors}
            renderItem={(item) => (
              <List.Item className="digest-list-item" extra={<RightOutlined />}>
                <List.Item.Meta title={item.title} description={item.excerpt} />
                <div className="digest-item-tags">
                  {item.tags.map((tag) => (
                    <Tag key={tag} color="purple">
                      {tag}
                    </Tag>
                  ))}
                </div>
              </List.Item>
            )}
          />
        </div>

        <div className="view-all-container">
          <Button type="link">
            View Complete Digest <RightOutlined />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RumorDigest;
