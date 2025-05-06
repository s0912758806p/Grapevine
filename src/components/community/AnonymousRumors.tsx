import React, { useState } from "react";
import { Card, Typography, Avatar, Button, List, Badge } from "antd";
import {
  CaretUpOutlined,
  CaretDownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "../../styles/Community.scss";

const { Title, Paragraph } = Typography;

// Mock data for anonymous rumors
const MOCK_RUMORS = [
  {
    id: 1,
    content:
      "Heard that React 19 is completely rewriting the reconciliation algorithm...",
    votes: 42,
    timestamp: "2 hours ago",
    userVote: 0,
  },
  {
    id: 2,
    content:
      "Apple's next MacBook will use their own networking chips, ditching Broadcom entirely.",
    votes: 28,
    timestamp: "5 hours ago",
    userVote: 0,
  },
  {
    id: 3,
    content:
      "A major tech company is acquiring a popular open-source database project next month.",
    votes: 76,
    timestamp: "1 day ago",
    userVote: 0,
  },
  {
    id: 4,
    content:
      "The next JavaScript framework trend will be server components everywhere.",
    votes: 15,
    timestamp: "3 days ago",
    userVote: 0,
  },
  {
    id: 5,
    content:
      "Grapevine will be adding encrypted messaging between repository maintainers soon...",
    votes: 31,
    timestamp: "4 days ago",
    userVote: 0,
  },
];

const AnonymousRumors: React.FC = () => {
  const [rumors, setRumors] = useState(MOCK_RUMORS);

  const handleVote = (id: number, direction: 1 | -1) => {
    setRumors((prevRumors) =>
      prevRumors.map((rumor) => {
        if (rumor.id === id) {
          // If voting in the same direction as before, cancel the vote
          if (rumor.userVote === direction) {
            return {
              ...rumor,
              votes: rumor.votes - direction,
              userVote: 0,
            };
          }
          // If voting in the opposite direction, subtract the previous vote and add the new vote
          else if (rumor.userVote !== 0) {
            return {
              ...rumor,
              votes: rumor.votes - rumor.userVote + direction,
              userVote: direction,
            };
          }
          // If not voted before, simply add the vote
          else {
            return {
              ...rumor,
              votes: rumor.votes + direction,
              userVote: direction,
            };
          }
        }
        return rumor;
      })
    );
  };

  return (
    <Card className="rumor-wall">
      <Title level={4} className="section-title">
        Anonymous Rumor Wall
      </Title>
      <Paragraph className="section-description">
        Share and vote on the latest tech industry gossip. No attribution, just
        pure speculation.
      </Paragraph>

      <List
        itemLayout="horizontal"
        dataSource={rumors}
        renderItem={(item) => (
          <List.Item
            className="rumor-item"
            actions={[
              <span className="rumor-timestamp">{item.timestamp}</span>,
            ]}
          >
            <div className="vote-controls">
              <Button
                type="text"
                icon={<CaretUpOutlined />}
                className={item.userVote === 1 ? "voted-up" : ""}
                onClick={() => handleVote(item.id, 1)}
              />
              <span className="vote-count">{item.votes}</span>
              <Button
                type="text"
                icon={<CaretDownOutlined />}
                className={item.userVote === -1 ? "voted-down" : ""}
                onClick={() => handleVote(item.id, -1)}
              />
            </div>
            <List.Item.Meta
              avatar={
                <Badge count="?" color="#722ed1">
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#87d068" }}
                  />
                </Badge>
              }
              title={<div className="rumor-content">{item.content}</div>}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default AnonymousRumors;
