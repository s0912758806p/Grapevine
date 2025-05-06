import React, { useState } from "react";
import {
  Layout,
  Input,
  Button,
  Menu,
  Dropdown,
  Avatar,
  Divider,
  Drawer,
} from "antd";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { MenuProps } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { RootState } from "../store";
import VineIcon from "./VineIcon";

const { Header, Content, Footer } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  // Get user role information
  const { isAuthor } = useSelector((state: RootState) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setMobileMenuOpen(false);
  };

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

  // Create menu items for main navigation
  const mainNavItems: MenuItem[] = [
    {
      key: "/",
      label: <Link to="/">Home</Link>,
    },
    {
      key: "/github-issues",
      label: <Link to="/github-issues">F2E Jobs</Link>,
    },
    {
      key: "/created-issues",
      label: <Link to="/created-issues">Author Issues</Link>,
    },
    ...(window.location.href.includes(`${import.meta.env.VITE_HOST_AUTHOR}`)
      ? [
          {
            key: "/manage-repositories",
            label: <Link to="/manage-repositories">Repositories</Link>,
          },
        ]
      : []),
    {
      key: "/community",
      label: <Link to="/community">Community</Link>,
      // icon: <TeamOutlined />,
    },
    {
      key: "/location",
      label: <Link to="/location">Location</Link>,
    },
    {
      key: "/analytics",
      label: <Link to="/analytics">Analytics</Link>,
    },
  ];

  // Create menu items for mobile navigation
  const mobileNavItems: MenuItem[] = [
    {
      key: "/",
      label: <Link to="/">Home</Link>,
      onClick: handleMenuClick,
    },
    {
      key: "/github-issues",
      label: <Link to="/github-issues">F2E Jobs</Link>,
      onClick: handleMenuClick,
    },
    {
      key: "/created-issues",
      label: <Link to="/created-issues">Author Issues</Link>,
      onClick: handleMenuClick,
    },
    ...(window.location.href.includes(`${import.meta.env.VITE_HOST_AUTHOR}`)
      ? [
          {
            key: "/manage-repositories",
            label: <Link to="/manage-repositories">Repositories</Link>,
            onClick: handleMenuClick,
          },
        ]
      : []),
    {
      key: "/community",
      label: <Link to="/community">Community</Link>,
      icon: <TeamOutlined />,
      onClick: handleMenuClick,
    },
    {
      key: "/location",
      label: <Link to="/location">Location</Link>,
      onClick: handleMenuClick,
    },
    {
      key: "/analytics",
      label: <Link to="/analytics">Analytics</Link>,
      onClick: handleMenuClick,
    },
    {
      type: "divider",
    },
    {
      key: "new-issue",
      label: <Link to="/new-issue">New Issue</Link>,
      onClick: handleMenuClick,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f7f5f0" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          background: "white",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Logo and title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center" }}>
            <VineIcon width={32} height={32} color="#5e2a69" />
            <span
              style={{
                marginLeft: "8px",
                fontSize: "18px",
                fontWeight: 600,
                background: "linear-gradient(135deg, #5e2a69 0%, #1e5631 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Grapevine
            </span>
          </Link>
        </div>

        <div
          className="header-nav-links hide-on-mobile"
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
            items={mainNavItems}
            theme="light"
          />
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
          <Link to="/new-issue" className="hide-on-mobile">
            <Button type="primary">New Issue</Button>
          </Link>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar
              style={{
                backgroundColor: isAuthor ? "#5e2a69" : "#1e5631",
                cursor: "pointer",
              }}
              icon={<UserOutlined />}
            />
          </Dropdown>

          {/* Mobile menu button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            className="hide-on-desktop"
            style={{ color: "#5e2a69" }}
          />
        </div>
      </Header>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={250}
      >
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            style={{ marginBottom: "16px" }}
          />

          <Menu
            mode="vertical"
            theme="light"
            selectedKeys={[location.pathname]}
            items={mobileNavItems}
          />
        </div>
      </Drawer>

      <Content>
        <div
          className="responsive-container"
          style={{
            padding: "24px 16px",
          }}
        >
          {children}
        </div>
      </Content>

      <Footer
        style={{
          background: "#f7f5f0",
          borderTop: "1px solid #e9e0ed",
          padding: "40px 16px 24px",
        }}
      >
        <div className="responsive-container">
          <div
            className="flex-col-mobile"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <VineIcon width={24} height={24} color="#5e2a69" />
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #5e2a69 0%, #1e5631 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Grapevine
              </span>
            </div>
            <div className="footer-links">
              <a href="#" style={{ color: "#5e2a69" }}>
                Terms
              </a>
              <Divider type="vertical" style={{ borderColor: "#e9e0ed" }} />
              <a href="#" style={{ color: "#5e2a69" }}>
                Privacy
              </a>
              <Divider type="vertical" style={{ borderColor: "#e9e0ed" }} />
              <a href="#" style={{ color: "#5e2a69" }}>
                Security
              </a>
              <Divider type="vertical" style={{ borderColor: "#e9e0ed" }} />
              <a href="#" style={{ color: "#5e2a69" }}>
                Status
              </a>
            </div>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default AppLayout;
