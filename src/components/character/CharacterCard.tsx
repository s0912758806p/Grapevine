import React from "react";
import { Card, Progress, Avatar, Space, Typography, Tooltip, Tag } from "antd";
import { TrophyOutlined, UserOutlined, FireOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { LEVELS, BADGES, BadgeId } from "../../store/characterSlice";

const { Text, Title } = Typography;

interface CharacterCardProps {
  compact?: boolean;
}

function getXpProgress(xp: number, level: number): { current: number; needed: number; percent: number } {
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

const CharacterCard: React.FC<CharacterCardProps> = ({ compact = false }) => {
  const { xp, level, levelTitle, badges, streak } = useSelector(
    (state: RootState) => state.character
  );
  const { current, needed, percent } = getXpProgress(xp, level);

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar
          size={36}
          style={{ backgroundColor: "#5e2a69", flexShrink: 0 }}
          icon={<UserOutlined />}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Text strong style={{ color: "#1a1025", fontSize: 13 }}>
              {levelTitle}
            </Text>
            <Tag
              style={{
                background: "#f5eef7",
                borderColor: "#d4aede",
                color: "#5e2a69",
                fontSize: 11,
                margin: 0,
                padding: "0 6px",
              }}
            >
              Lv.{level}
            </Tag>
          </div>
          <Progress
            percent={percent}
            showInfo={false}
            size="small"
            strokeColor="#5e2a69"
            trailColor="#f0ecf5"
            style={{ marginBottom: 0 }}
          />
          <Text style={{ color: "#9b92a8", fontSize: 11 }}>
            {current}/{needed} XP
          </Text>
        </div>
      </div>
    );
  }

  return (
    <Card
      bordered
      style={{ borderColor: "#e8e3ed", borderRadius: 12 }}
    >
      {/* Avatar + Level */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <Avatar
          size={64}
          style={{ backgroundColor: "#5e2a69", flexShrink: 0 }}
          icon={<UserOutlined />}
        />
        <div>
          <Title level={5} style={{ margin: 0, color: "#1a1025" }}>
            {levelTitle}
          </Title>
          <Space size={6} style={{ marginTop: 4 }}>
            <Tag
              style={{
                background: "#f5eef7",
                borderColor: "#d4aede",
                color: "#5e2a69",
                fontWeight: 600,
              }}
            >
              Level {level}
            </Tag>
            {streak > 0 && (
              <Tag
                icon={<FireOutlined />}
                style={{
                  background: "#fff7e6",
                  borderColor: "#f7c948",
                  color: "#b8860b",
                }}
              >
                {streak}-day streak
              </Tag>
            )}
          </Space>
        </div>
      </div>

      {/* XP Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ color: "#5c5570", fontSize: 13 }}>Experience</Text>
          <Text style={{ color: "#1a1025", fontSize: 13, fontWeight: 600 }}>
            {xp} XP total
          </Text>
        </div>
        <Progress
          percent={percent}
          showInfo={false}
          strokeColor="#5e2a69"
          trailColor="#f0ecf5"
        />
        <Text style={{ color: "#9b92a8", fontSize: 12 }}>
          {current} / {needed} XP to next level
          {level < LEVELS.length && ` (${LEVELS.find((l) => l.level === level + 1)?.title})`}
        </Text>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <Text
            strong
            style={{
              color: "#5c5570",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: 8,
            }}
          >
            <TrophyOutlined style={{ marginRight: 4 }} />
            Badges
          </Text>
          <Space wrap>
            {badges.map((id) => {
              const badge = BADGES[id as BadgeId];
              return (
                <Tooltip key={id} title={badge.description}>
                  <Tag
                    style={{
                      background: "#fff7e6",
                      borderColor: "#f7c948",
                      color: "#b8860b",
                      fontSize: 13,
                      padding: "2px 10px",
                    }}
                  >
                    {badge.icon} {badge.label}
                  </Tag>
                </Tooltip>
              );
            })}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default CharacterCard;
