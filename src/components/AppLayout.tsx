import React from "react";
import { Layout, Typography, Input, Button, Avatar, Space } from "antd";
import { Link } from "react-router-dom";
import {
  RedditOutlined,
  SearchOutlined,
  BellOutlined,
  PlusOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Search } = Input;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh", background: "#DAE0E6" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          height: "48px",
          background: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "20px",
            }}
          >
            <RedditOutlined
              style={{ fontSize: "28px", color: "#FF4500", marginRight: "8px" }}
            />
            <Title level={4} style={{ color: "black", margin: 0 }}>
              Grapevine
            </Title>
          </div>
        </Link>

        <Search
          placeholder="Search posts"
          allowClear
          style={{
            width: "400px",
            margin: "0 20px",
          }}
          prefix={<SearchOutlined style={{ color: "#818384" }} />}
        />

        <div
          style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
        >
          <Space size="large">
            <Button
              type="text"
              icon={<PlusOutlined />}
              href="/new-issue"
              style={{ color: "#0079D3" }}
            />
            <Button
              type="text"
              icon={<MessageOutlined />}
              style={{ color: "#0079D3" }}
            />
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: "#0079D3" }}
            />
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#FF4500" }}
            />
          </Space>
        </div>
      </Header>

      <Content style={{ padding: "24px 0" }}>
        <div
          className="container"
          style={{ maxWidth: "1000px", margin: "0 auto" }}
        >
          <div
            style={{
              background: "#DAE0E6",
              minHeight: 280,
            }}
          >
            {children}
          </div>
        </div>
      </Content>

      <Footer
        style={{ textAlign: "center", background: "white", padding: "12px 0" }}
      >
        Grapevine Forum ©{new Date().getFullYear()} - Reddit Style
      </Footer>
    </Layout>
  );
};

export default AppLayout;
