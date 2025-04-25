import React, { useState } from "react";
import { Avatar, Dropdown, Space, Button, Tooltip, message } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  GithubOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useAuth } from "../auth/AuthContext";
import type { MenuProps } from "antd";

const GitHubLogin: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
      // 登錄過程可能很快或慢，所以我們設置一個超時
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Login error:", err);
      messageApi.error("Login failed. Please try again.");
      setLoading(false);
    }
  };

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
      {contextHolder}
      {isAuthenticated && user ? (
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
      ) : (
        <Tooltip title="Sign in with GitHub">
          <Button
            type="text"
            icon={<GithubOutlined />}
            onClick={handleLogin}
            loading={loading}
            style={{ color: "#fff" }}
          >
            Login
          </Button>
        </Tooltip>
      )}
    </>
  );
};

export default GitHubLogin;
