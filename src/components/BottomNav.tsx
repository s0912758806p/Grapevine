import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  ReadOutlined,
  TeamOutlined,
  UserOutlined,
  CodeOutlined,
} from "@ant-design/icons";

interface NavTab {
  key: string;
  label: string;
  icon: React.ReactNode;
  to: string;
}

const TABS: NavTab[] = [
  { key: "/",         label: "Home",      icon: <HomeOutlined />,    to: "/" },
  { key: "/essays",   label: "Essays",    icon: <ReadOutlined />,    to: "/essays" },
  { key: "/jobs",     label: "Jobs",      icon: <CodeOutlined />,    to: "/jobs" },
  { key: "/community",label: "Community", icon: <TeamOutlined />,    to: "/community" },
  { key: "/profile",  label: "Profile",   icon: <UserOutlined />,    to: "/profile" },
];

const BottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (key: string) => {
    if (key === "/") return location.pathname === "/";
    return location.pathname.startsWith(key);
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: "#ffffff",
        borderTop: "1px solid #e8e3ed",
        display: "flex",
        justifyContent: "space-around",
        padding: "6px 0 env(safe-area-inset-bottom, 6px)",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.key);
        return (
          <Link
            key={tab.key}
            to={tab.to}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "4px 12px",
              color: active ? "#5e2a69" : "#9b92a8",
              textDecoration: "none",
              minWidth: 0,
              flex: 1,
            }}
          >
            <span
              style={{
                fontSize: 20,
                lineHeight: 1,
                transition: "transform 0.15s",
                transform: active ? "translateY(-1px)" : "none",
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </span>
            {active && (
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: 20,
                  height: 2,
                  background: "#5e2a69",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
