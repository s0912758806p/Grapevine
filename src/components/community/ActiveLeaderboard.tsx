import React from "react";
import { Card, Typography, List, Avatar, Tag, Tooltip } from "antd";
import {
  CrownOutlined,
  TrophyOutlined,
  FireOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import "../../styles/Community.scss";

const { Title, Paragraph } = Typography;

// Mock data for active commenters
const MOCK_ACTIVE_USERS = [
  {
    id: 1,
    name: "techguru42",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=techguru42",
    comments: 47,
    likes: 215,
    tags: ["React", "TypeScript"],
  },
  {
    id: 2,
    name: "codewizard",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=codewizard",
    comments: 36,
    likes: 187,
    tags: ["Node.js", "GraphQL"],
  },
  {
    id: 3,
    name: "devinsider",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=devinsider",
    comments: 29,
    likes: 132,
    tags: ["CSS", "UX/UI"],
  },
  {
    id: 4,
    name: "bytehacker",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=bytehacker",
    comments: 24,
    likes: 116,
    tags: ["Python", "AI"],
  },
  {
    id: 5,
    name: "algorithmace",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=algorithmace",
    comments: 21,
    likes: 89,
    tags: ["Algorithms", "Data Structures"],
  },
];

const ActiveLeaderboard: React.FC = () => {
  // Function to determine medal icon based on ranking
  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <CrownOutlined style={{ color: "#FFD700" }} />;
      case 1:
        return <TrophyOutlined style={{ color: "#C0C0C0" }} />;
      case 2:
        return <TrophyOutlined style={{ color: "#CD7F32" }} />;
      default:
        return null;
    }
  };

  return (
    <Card className="active-leaderboard">
      <Title level={4} className="section-title">
        <FireOutlined /> Top Commenters This Week
      </Title>
      <Paragraph className="section-description">
        Our most active community members sharing insights and gossip.
      </Paragraph>

      <List
        itemLayout="horizontal"
        dataSource={MOCK_ACTIVE_USERS}
        renderItem={(item, index) => (
          <List.Item className="leaderboard-item">
            <List.Item.Meta
              avatar={
                <div className="leaderboard-avatar-container">
                  {getMedalIcon(index) && (
                    <div className="medal-icon">{getMedalIcon(index)}</div>
                  )}
                  <Avatar src={item.avatar} size={48} />
                </div>
              }
              title={
                <div className="user-name-container">
                  <span className="user-name">{item.name}</span>
                  <span className="rank-number">#{index + 1}</span>
                </div>
              }
              description={
                <div className="user-stats">
                  <Tooltip title="Comments this week">
                    <span className="stat-item">
                      <MessageOutlined /> {item.comments}
                    </span>
                  </Tooltip>
                  <div className="user-tags">
                    {item.tags.map((tag) => (
                      <Tag key={tag} color="purple" className="expertise-tag">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ActiveLeaderboard;
