import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Row, Col, Button, Space, Typography } from "antd";
import { PlusOutlined, SettingOutlined } from "@ant-design/icons";
import CategoryTabs from "./CategoryTabs";
import RepositoryIssueList from "./RepositoryIssueList";
import { RootState } from "../store";

const { Title } = Typography;

const HomePage: React.FC = () => {
  const { isAuthor } = useSelector((state: RootState) => state.user);

  return (
    <div className="home-container">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ padding: "0 16px", marginBottom: 16 }}>
            <Space size="large" align="center" style={{ marginBottom: 16 }}>
              <Title level={2} style={{ margin: 0 }}>
                Welcome to Grapevine
              </Title>
            </Space>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
              <Space>
                {isAuthor && (
                  <Link to="/new-issue">
                    <Button type="primary" icon={<PlusOutlined />}>
                      Create New Post
                    </Button>
                  </Link>
                )}
              </Space>
              
              <Space>
                {window.location.href.includes(`${import.meta.env.VITE_HOST_AUTHOR}`) && (
                  <Link to="/manage-repositories">
                    <Button icon={<SettingOutlined />}>
                      Manage Sources
                    </Button>
                  </Link>
                )}
              </Space>
            </div>
          </div>
        </Col>

        <Col span={24}>
          <CategoryTabs />
        </Col>
        
        <Col span={24} style={{ padding: "0 16px" }}>
          <RepositoryIssueList />
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
