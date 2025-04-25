import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Row, Col, Tabs, Button, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import IssueList from "./IssueList";
import F2EIssueList from "./F2EIssueList";
import { RootState } from "../store";

const { Title } = Typography;
const { TabPane } = Tabs;

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

            {isAuthor && (
              <div style={{ marginTop: 16 }}>
                <Link to="/new-issue">
                  <Button type="primary" icon={<PlusOutlined />}>
                    Create New Post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Col>

        <Col span={24}>
          <Tabs defaultActiveKey="f2e-jobs" style={{ padding: "0 16px" }}>
            <TabPane tab="F2E Jobs" key="f2e-jobs">
              <F2EIssueList />
            </TabPane>
            <TabPane tab="Grapevine Community" key="grapevine">
              <IssueList />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
