import React, { useState, useEffect } from "react";
import { Typography, Tabs, Space, Tag, Badge } from "antd";
import { BookOutlined, UserOutlined } from "@ant-design/icons";
import ModularIssueList from "../components/ModularIssueList";
import VineAnimation from "../components/VineAnimation";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/EssayPage.scss";

const { Title, Paragraph } = Typography;

// Define tab items for the Essays section
const tabItems = [
  {
    key: "ruanyf-weekly",
    label: (
      <span>
        <BookOutlined /> Ruanyf Weekly
      </span>
    ),
    children: <ModularIssueList type="ruanyf-weekly" />,
  },
  {
    key: "author-issues",
    label: (
      <span>
        <UserOutlined /> Author Issues
      </span>
    ),
    children: <ModularIssueList type="author-issues" />,
  },
];

const EssayPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get("tab");
  const validTabs = ["ruanyf-weekly", "author-issues"];
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "ruanyf-weekly"
  );

  // Update URL when tab changes
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "ruanyf-weekly") {
      navigate("/essays");
    } else {
      navigate(`/essays?tab=${key}`);
    }
  };

  // Handle URL changes
  useEffect(() => {
    if (tabFromUrl === "author-issues") {
      setActiveTab("author-issues");
    } else if (tabFromUrl === "ruanyf-weekly") {
      setActiveTab("ruanyf-weekly");
    }
  }, [tabFromUrl]);

  return (
    <div className="essay-page-container">
      <VineAnimation className="vine-background" />

      <div className="essay-header">
        <Title level={2} className="essay-title">
          <BookOutlined /> Essays
        </Title>
        <Paragraph className="essay-description">
          Explore articles and writings from our community. Browse Ruanyf Weekly
          for curated tech links, or Author Issues for technical insights and
          discussions. Looking for jobs? Check out the{" "}
          <a href="/jobs" style={{ color: "#5e2a69" }}>Jobs page</a>.
        </Paragraph>

        <Space wrap className="essay-category-tags">
          {/** list multiple tags */}
          {tabItems.map((item) => (
            <Tag
              key={item.key}
              color={activeTab === item.key ? "#5e2a69" : "default"}
              onClick={() => setActiveTab(item.key)}
              className="essay-category-tag"
            >
              {item.label}
              <Badge
                status={activeTab === item.key ? "success" : "default"}
                className="essay-category-badge"
              />
            </Tag>
          ))}
        </Space>
      </div>

      <div className="essay-content">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className="essay-tabs"
          tabBarStyle={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default EssayPage;
