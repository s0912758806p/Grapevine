import React from "react";
import { Button, Avatar, Dropdown, Space, message } from "antd";
import {
  GithubOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useAuth } from "../auth/AuthContext";
import type { MenuProps } from "antd";

const GitHubLogin: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleLogin = () => {
    login();
    // Redirect users to the comments page where they can see the Sign in with GitHub button
    message.info(
      "Please use the GitHub sign-in button in the comments section to authenticate"
    );
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
      {isAuthenticated ? (
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
              <DownOutlined style={{ fontSize: "12px" }} />
            </Space>
          </a>
        </Dropdown>
      ) : (
        <Button
          type="primary"
          icon={<GithubOutlined />}
          size="small"
          onClick={handleLogin}
        >
          GitHub Login
        </Button>
      )}
    </>
  );
};

export default GitHubLogin;
