import React, { useState, useEffect } from "react";
import { Typography, Tabs, Space, Tag, Badge } from "antd";
import { BookOutlined, CodeOutlined, UserOutlined } from "@ant-design/icons";
import ModularIssueList from "../components/ModularIssueList";
import VineAnimation from "../components/VineAnimation";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/EssayPage.scss";

const { Title, Paragraph } = Typography;

// Define tab items for the Essays section
const tabItems = [
  {
    key: "f2e-jobs",
    label: (
      <span>
        <CodeOutlined /> F2E Jobs
      </span>
    ),
    children: <ModularIssueList type="f2e-jobs" />,
  },
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
  const [activeTab, setActiveTab] = useState(
    tabFromUrl === "author-issues" ? "author-issues" : "f2e-jobs"
  );

  // Update URL when tab changes
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "f2e-jobs") {
      navigate("/essays");
    } else {
      navigate(`/essays?tab=${key}`);
    }
  };

  // Handle URL changes
  useEffect(() => {
    if (tabFromUrl === "author-issues") {
      setActiveTab("author-issues");
    } else if (tabFromUrl === "f2e-jobs") {
      setActiveTab("f2e-jobs");
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
          Explore articles and job postings from our community. Browse F2E Jobs
          for frontend opportunities or Author Issues for technical insights and
          discussions.
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
