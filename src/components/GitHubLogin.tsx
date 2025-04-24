import React from "react";
import { Avatar, Dropdown, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useAuth } from "../auth/AuthContext";
import type { MenuProps } from "antd";

const GitHubLogin: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <span>{user?.name || user?.login || "GitHub User"}</span>,
      disabled: true,
    },
    {
      key: "divider",
      type: "divider",
    },
    {
      key: "2",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      {isAuthenticated && user && (
        <Dropdown menu={{ items }} trigger={["click"]}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <Avatar
                src={user?.avatar_url}
                icon={<UserOutlined />}
                size="small"
                style={{
                  backgroundColor: user?.avatar_url ? "transparent" : "#1677ff",
                }}
              />
              <span style={{ marginLeft: "4px", color: "#fff" }}>
                {user?.name || user?.login || "User"}
              </span>
              <DownOutlined style={{ fontSize: "12px" }} />
            </Space>
          </a>
        </Dropdown>
      )}
    </>
  );
};

export default GitHubLogin;
