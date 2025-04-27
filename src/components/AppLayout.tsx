import React, { useState } from "react";
import { Layout, Input, Button, Menu, Dropdown, Avatar, Divider, Drawer, Modal } from "antd";
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
  MenuOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { RootState } from "../store";
import GeoLocation from "./GeoLocation";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

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

  // Create menu items for main navigation
  const mainNavItems: MenuItem[] = [
    {
      key: "/issues",
      label: <Link to="/">Issues</Link>,
    },
    {
      key: "/pull-requests",
      label: <Link to="/">Pull requests</Link>,
    },
    {
      key: "/discussions",
      label: <Link to="/">Discussions</Link>,
    },
    {
      key: "/projects",
      label: <Link to="/">Projects</Link>,
    },
  ];

  // Create menu items for mobile navigation
  const mobileNavItems: MenuItem[] = [
    {
      key: "/issues",
      label: <Link to="/">Issues</Link>,
      onClick: handleMenuClick,
    },
    {
      key: "/pull-requests",
      label: <Link to="/">Pull requests</Link>,
      onClick: handleMenuClick,
    },
    {
      key: "/discussions",
      label: <Link to="/">Discussions</Link>,
      onClick: handleMenuClick,
    },
    {
      key: "/projects",
      label: <Link to="/">Projects</Link>,
      onClick: handleMenuClick,
    },
    {
      type: "divider",
    },
    {
      key: "new-issue",
      label: "New issue",
      icon: <PlusOutlined />,
      onClick: handleMenuClick,
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <BellOutlined />,
      onClick: handleMenuClick,
    },
    {
      key: "location-modal",
      label: "快速獲取位置",
      icon: <EnvironmentOutlined />,
      onClick: () => {
        handleMenuClick();
        setLocationModalVisible(true);
      },
    },
    {
      key: "location-page",
      label: <Link to="/location">位置服務頁面</Link>,
      icon: <EnvironmentOutlined />,
      onClick: handleMenuClick,
    },
  ];

  // 添加位置服務下拉菜單
  const locationMenuItems: MenuItem[] = [
    {
      key: "show-location-modal",
      label: "快速獲取位置",
      icon: <EnvironmentOutlined />,
      onClick: () => setLocationModalVisible(true),
    },
    {
      key: "go-to-location-page",
      label: <Link to="/location">位置服務頁面</Link>,
      icon: <EnvironmentOutlined />,
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
            <div
              className="search-container hide-on-mobile"
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

            <div className="hide-on-mobile">
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
              
              {/* 更新位置服務按鈕為下拉選單 */}
              <Dropdown menu={{ items: locationMenuItems }} placement="bottomRight">
                <Button
                  type="text"
                  icon={<EnvironmentOutlined />}
                  style={{ color: "var(--color-fg-default)" }}
                />
              </Dropdown>
            </div>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                style={{
                  backgroundColor: isAuthor ? "#4F46E5" : "#9CA3AF",
                  cursor: "pointer",
                }}
                icon={<UserOutlined />}
              />
            </Dropdown>

            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="hide-on-desktop"
              style={{ color: "var(--color-fg-default)" }}
            />
          </div>
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
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            style={{ marginBottom: "16px" }}
          />
          
          <Menu 
            mode="vertical" 
            selectedKeys={[location.pathname]}
            items={mobileNavItems}
          />
        </div>
      </Drawer>

      {/* 位置服務彈窗 */}
      <Modal
        title="位置服務"
        open={locationModalVisible}
        onCancel={() => setLocationModalVisible(false)}
        footer={null}
        width={600}
      >
        <GeoLocation />
      </Modal>

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
          background: "var(--color-canvas-subtle)",
          borderTop: "1px solid var(--color-border-muted)",
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <SmileOutlined style={{ fontSize: "24px" }} />
              <span style={{ fontSize: "16px", fontWeight: 600 }}>
                Grapevine
              </span>
            </div>
            <div className="footer-links">
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
            </div>
          </div>
          
          {/* Additional footer content */}
        </div>
      </Footer>
    </Layout>
  );
};

export default AppLayout;

