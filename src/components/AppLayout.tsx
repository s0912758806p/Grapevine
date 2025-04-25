import React, { useState } from "react";
import { Layout, Input, Button, Menu, Dropdown, Avatar, Divider } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { MenuProps } from "antd";
import {
  SmileOutlined,
  SearchOutlined,
  BellOutlined,
  PlusOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { RootState } from "../store";

const { Header, Content, Footer } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  // Get user role information
  const { isAuthor } = useSelector((state: RootState) => state.user);
  const [searchFocused, setSearchFocused] = useState(false);

  const userMenuItems: MenuItem[] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Your profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign out",
    },
  ];

  const plusMenuItems: MenuItem[] = [
    {
      key: "new-repository",
      label: "New repository",
    },
    {
      key: "new-issue",
      label: "New issue",
    },
    {
      key: "new-pr",
      label: "New pull request",
    },
  ];

  return (
    <Layout
      style={{ minHeight: "100vh", background: "var(--color-canvas-default)" }}
    >
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: "62px",
          background: "var(--color-canvas-default)",
          borderBottom: "1px solid var(--color-border-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center" }}>
            <SmileOutlined style={{ fontSize: "32px", color: "#000000" }} />
          </Link>

          <div
            className="header-nav-links"
            style={{ display: "flex", marginLeft: "24px" }}
          >
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              style={{
                border: "none",
                background: "transparent",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              <Menu.Item key="/issues">
                <Link to="/">Issues</Link>
              </Menu.Item>
              <Menu.Item key="/pull-requests">
                <Link to="/">Pull requests</Link>
              </Menu.Item>
              <Menu.Item key="/discussions">
                <Link to="/">Discussions</Link>
              </Menu.Item>
              <Menu.Item key="/projects">
                <Link to="/">Projects</Link>
              </Menu.Item>
            </Menu>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{ position: "relative", maxWidth: "272px", width: "100%" }}
            >
              <Input
                placeholder="Search or jump to..."
                prefix={
                  <SearchOutlined style={{ color: "var(--color-fg-subtle)" }} />
                }
                style={{
                  backgroundColor: "var(--color-canvas-subtle)",
                  border: searchFocused
                    ? "1px solid var(--color-accent-fg)"
                    : "1px solid var(--color-border-default)",
                  borderRadius: "6px",
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchFocused && (
                <div
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-fg-subtle)",
                    fontSize: "12px",
                    backgroundColor: "var(--color-scale-gray-1)",
                    padding: "1px 6px",
                    borderRadius: "3px",
                  }}
                >
                  /
                </div>
              )}
            </div>

            <Dropdown menu={{ items: plusMenuItems }} placement="bottomRight">
              <Button
                type="text"
                icon={<PlusOutlined />}
                style={{ color: "var(--color-fg-default)" }}
              />
            </Dropdown>

            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: "var(--color-fg-default)" }}
            />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                style={{
                  backgroundColor: isAuthor ? "#4F46E5" : "#9CA3AF",
                  cursor: "pointer",
                }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </div>
      </Header>

      <Content>
        <div
          className="container"
          style={{
            padding: "24px 16px",
          }}
        >
          {children}
        </div>
      </Content>

      <Footer
        style={{
          background: "var(--color-canvas-subtle)",
          borderTop: "1px solid var(--color-border-muted)",
          padding: "40px 16px 24px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <SmileOutlined style={{ fontSize: "24px" }} />
              <span style={{ fontSize: "16px", fontWeight: 600 }}>
                Grapevine
              </span>
            </div>
            <div>
              <a href="#" style={{ color: "var(--color-fg-muted)" }}>
                Terms
              </a>
              <Divider
                type="vertical"
                style={{ borderColor: "var(--color-border-muted)" }}
              />
              <a href="#" style={{ color: "var(--color-fg-muted)" }}>
                Privacy
              </a>
              <Divider
                type="vertical"
                style={{ borderColor: "var(--color-border-muted)" }}
              />
              <a href="#" style={{ color: "var(--color-fg-muted)" }}>
                Security
              </a>
              <Divider
                type="vertical"
                style={{ borderColor: "var(--color-border-muted)" }}
              />
              <a href="#" style={{ color: "var(--color-fg-muted)" }}>
                Status
              </a>
              <Divider
                type="vertical"
                style={{ borderColor: "var(--color-border-muted)" }}
              />
              <a href="#" style={{ color: "var(--color-fg-muted)" }}>
                Help
              </a>
            </div>
          </div>
          <div
            style={{
              color: "var(--color-fg-muted)",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} Grapevine. All rights reserved.
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default AppLayout;
