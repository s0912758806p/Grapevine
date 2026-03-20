import React from "react";
import { Tooltip } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface LevelBadgeProps {
  /** If provided, display for a specific level+title instead of from Redux */
  level?: number;
  title?: string;
  size?: "sm" | "md";
}

const LEVEL_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "#edf5f0", text: "#1e5631" },
  2: { bg: "#edf5f0", text: "#3d7a4f" },
  3: { bg: "#f5eef7", text: "#5e2a69" },
  4: { bg: "#f5eef7", text: "#5e2a69" },
  5: { bg: "#fff7e6", text: "#b8860b" },
  6: { bg: "#fff7e6", text: "#b8860b" },
  7: { bg: "#fef0f0", text: "#8b2020" },
};

const LevelBadge: React.FC<LevelBadgeProps> = ({ level, title, size = "sm" }) => {
  const character = useSelector((state: RootState) => state.character);
  const lvl = level ?? character.level;
  const ttl = title ?? character.levelTitle;
  const colors = LEVEL_COLORS[lvl] ?? LEVEL_COLORS[1];

  const fontSize = size === "sm" ? 11 : 13;
  const padding = size === "sm" ? "1px 8px" : "3px 12px";

  return (
    <Tooltip title={ttl}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          background: colors.bg,
          color: colors.text,
          fontSize,
          fontWeight: 600,
          padding,
          borderRadius: 20,
          border: `1px solid ${colors.text}33`,
          lineHeight: 1.5,
          whiteSpace: "nowrap",
        }}
      >
        Lv.{lvl}
      </span>
    </Tooltip>
  );
};

export default LevelBadge;
