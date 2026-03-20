import React from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Tag,
  Button,
  Divider,
  Progress,
} from "antd";
import {
  UserOutlined,
  TrophyOutlined,
  ReadOutlined,
  EditOutlined,
  MessageOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { LEVELS, BADGES, BadgeId, resetCharacter } from "../store/characterSlice";
import CharacterCard from "../components/character/CharacterCard";

const { Title, Text, Paragraph } = Typography;

function getXpProgress(xp: number, level: number) {
  const currentLevel = LEVELS.find((l) => l.level === level);
  const nextLevel = LEVELS.find((l) => l.level === level + 1);
  if (!nextLevel) return { current: xp, needed: xp, percent: 100 };
  const base = currentLevel?.minXp ?? 0;
  const cap = nextLevel.minXp;
  const current = xp - base;
  const needed = cap - base;
  const percent = Math.min(100, Math.round((current / needed) * 100));
  return { current, needed, percent };
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character);
  const { percent } = getXpProgress(character.xp, character.level);

  const stats = [
    { label: "Articles Read", value: character.totalArticlesRead, icon: <ReadOutlined />, color: "#5e2a69" },
    { label: "Issues Posted", value: character.totalIssuesPosted, icon: <EditOutlined />, color: "#1e5631" },
    { label: "Rumors Posted", value: character.totalRumorsPosted, icon: <MessageOutlined />, color: "#5e2a69" },
    { label: "Votes Cast",    value: character.totalVotesCast,    icon: <LikeOutlined />,   color: "#1e5631" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Title level={2} style={{ color: "#1a1025", marginBottom: 8, fontWeight: 700 }}>
        <UserOutlined style={{ color: "#5e2a69", marginRight: 10 }} />
        Your Profile
      </Title>
      <Paragraph style={{ color: "#5c5570", marginBottom: 32 }}>
        Your character sheet — track XP, levels, and badges earned on Grapevine.
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* Left column: character card + stats */}
        <Col xs={24} md={10}>
          <CharacterCard />

          <Divider style={{ borderColor: "#f0ecf5" }} />

          <Row gutter={[12, 12]}>
            {stats.map((s) => (
              <Col span={12} key={s.label}>
                <Card
                  bordered
                  size="small"
                  style={{ borderColor: "#e8e3ed", borderRadius: 10 }}
                >
                  <Statistic
                    title={
                      <Text style={{ color: "#5c5570", fontSize: 12 }}>{s.label}</Text>
                    }
                    value={s.value}
                    prefix={React.cloneElement(s.icon as React.ReactElement, {
                      style: { color: s.color },
                    })}
                    valueStyle={{ color: "#1a1025", fontSize: 22, fontWeight: 700 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Right column: level roadmap + badges */}
        <Col xs={24} md={14}>
          {/* Level Roadmap */}
          <Card
            bordered
            style={{ borderColor: "#e8e3ed", borderRadius: 12, marginBottom: 24 }}
          >
            <Title level={5} style={{ color: "#1a1025", marginBottom: 16 }}>
              <TrophyOutlined style={{ color: "#b8860b", marginRight: 8 }} />
              Level Roadmap
            </Title>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {LEVELS.map((l) => {
                const isCurrent = l.level === character.level;
                const isCompleted = l.level < character.level;
                return (
                  <div
                    key={l.level}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: isCurrent ? "#f5eef7" : isCompleted ? "#edf5f0" : "transparent",
                      border: isCurrent ? "1px solid #d4aede" : "1px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: isCompleted ? "#1e5631" : isCurrent ? "#5e2a69" : "#e8e3ed",
                        color: isCompleted || isCurrent ? "#fff" : "#9b92a8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {l.level}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text
                        strong={isCurrent}
                        style={{
                          color: isCurrent ? "#5e2a69" : isCompleted ? "#1e5631" : "#9b92a8",
                          fontSize: 14,
                        }}
                      >
                        {l.title}
                      </Text>
                    </div>
                    <Text style={{ color: "#9b92a8", fontSize: 12 }}>
                      {l.minXp} XP
                    </Text>
                    {isCurrent && (
                      <div style={{ width: 80 }}>
                        <Progress
                          percent={percent}
                          showInfo={false}
                          size="small"
                          strokeColor="#5e2a69"
                          trailColor="#f0ecf5"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* All Badges */}
          <Card
            bordered
            style={{ borderColor: "#e8e3ed", borderRadius: 12 }}
          >
            <Title level={5} style={{ color: "#1a1025", marginBottom: 16 }}>
              Badges
            </Title>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(Object.keys(BADGES) as BadgeId[]).map((id) => {
                const badge = BADGES[id];
                const earned = character.badges.includes(id);
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: earned ? "#fff7e6" : "#faf9f7",
                      border: `1px solid ${earned ? "#f7c948" : "#f0ecf5"}`,
                      opacity: earned ? 1 : 0.6,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{badge.icon}</span>
                    <div>
                      <Text strong style={{ color: earned ? "#b8860b" : "#5c5570", display: "block" }}>
                        {badge.label}
                      </Text>
                      <Text style={{ color: "#9b92a8", fontSize: 12 }}>
                        {badge.description}
                      </Text>
                    </div>
                    {earned && (
                      <Tag
                        style={{
                          marginLeft: "auto",
                          background: "#fff7e6",
                          borderColor: "#f7c948",
                          color: "#b8860b",
                          fontSize: 11,
                        }}
                      >
                        Earned
                      </Tag>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              danger
              size="small"
              type="text"
              onClick={() => {
                if (confirm("Reset your character? This cannot be undone.")) {
                  dispatch(resetCharacter());
                }
              }}
            >
              Reset character
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
