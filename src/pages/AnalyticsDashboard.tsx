import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Button,
  Alert,
  Tabs,
  Empty,
  List,
  Tag,
  Table,
  Badge,
  Tooltip,
} from "antd";
import {
  ReadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TagOutlined,
  DeleteOutlined,
  GithubOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { TabsProps } from "antd";
import {
  getFormattedReadingTime,
  getTopViewed,
  getMostInteractedTags,
  getViewHistory,
  getActivityByDayOfWeek,
  getViewsBySource,
  clearAnalyticsData,
  getDaysSinceFirstView,
  getRecentSearches,
  getRepoActivity,
  getTotalIssuesCreated,
  getTotalIssuesUpdated,
  getTotalReposTracked,
  getMostActiveRepos,
} from "../services/analyticsService";
import { Link } from "react-router-dom";
import BarChart from "../components/charts/BarChart";
import PieChart from "../components/charts/PieChart";
import VineIcon from "../components/VineIcon";

const { Title, Text } = Typography;

// Define the viewRecord type
interface ViewRecord {
  id: number;
  issueNumber: number;
  title: string;
  timestamp: number;
  readingTime: number;
  source: string;
}

interface RepoActivity {
  repoId: string;
  repoOwner: string;
  repoName: string;
  created: number;
  updated: number;
  lastFetched: number;
}

// Helper function to format date for display
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const AnalyticsDashboard: React.FC = () => {
  const [topViewed, setTopViewed] = useState<
    { issueNumber: number; viewCount: number }[]
  >([]);
  const [readingTime, setReadingTime] = useState<string>("0m");
  const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);
  const [viewHistory, setViewHistory] = useState<ViewRecord[]>([]);
  const [daysSinceFirstView, setDaysSinceFirstView] = useState<number>(0);
  const [activityByDay, setActivityByDay] = useState<number[]>([]);
  const [viewsBySource, setViewsBySource] = useState<Record<string, number>>(
    {}
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [repoActivity, setRepoActivity] = useState<RepoActivity[]>([]);
  const [totalIssuesCreated, setTotalIssuesCreated] = useState<number>(0);
  const [totalIssuesUpdated, setTotalIssuesUpdated] = useState<number>(0);
  const [totalReposTracked, setTotalReposTracked] = useState<number>(0);
  const [mostActiveRepos, setMostActiveRepos] = useState<RepoActivity[]>([]);
  const [showNoDataAlert, setShowNoDataAlert] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    setLoading(true);

    try {
      const history = getViewHistory();
      setViewHistory(history);
      setTopViewed(getTopViewed(10));
      setReadingTime(getFormattedReadingTime());
      setTopTags(getMostInteractedTags(10));
      setDaysSinceFirstView(getDaysSinceFirstView());
      setActivityByDay(getActivityByDayOfWeek());
      setViewsBySource(getViewsBySource());
      setRecentSearches(getRecentSearches());

      // Load repository activity data
      setRepoActivity(getRepoActivity());
      setTotalIssuesCreated(getTotalIssuesCreated());
      setTotalIssuesUpdated(getTotalIssuesUpdated());
      setTotalReposTracked(getTotalReposTracked());
      setMostActiveRepos(getMostActiveRepos(5));

      // Show alert if no data is available
      setShowNoDataAlert(history.length === 0);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all analytics data? This action cannot be undone."
      )
    ) {
      clearAnalyticsData();
      loadAnalyticsData();
    }
  };

  // Format activity by day of week data for visualization
  const activityByDayData = [
    { category: "Sun", value: activityByDay[0] || 0 },
    { category: "Mon", value: activityByDay[1] || 0 },
    { category: "Tue", value: activityByDay[2] || 0 },
    { category: "Wed", value: activityByDay[3] || 0 },
    { category: "Thu", value: activityByDay[4] || 0 },
    { category: "Fri", value: activityByDay[5] || 0 },
    { category: "Sat", value: activityByDay[6] || 0 },
  ];

  // Format views by source data for visualization
  const viewsBySourceData = Object.entries(viewsBySource).map(
    ([source, count]) => ({
      type: source === "unknown" ? "Other" : source,
      value: count,
    })
  );

  // Repository activity table columns
  const repoColumns = [
    {
      title: "Repository",
      dataIndex: "repoName",
      key: "repoName",
      render: (text: string, record: RepoActivity) => (
        <span>
          <GithubOutlined style={{ marginRight: 8 }} />
          {record.repoOwner}/{text}
        </span>
      ),
    },
    {
      title: "New Issues (24h)",
      dataIndex: "created",
      key: "created",
      render: (created: number) => (
        <Badge
          count={created}
          showZero
          style={{
            backgroundColor: created > 0 ? "#52c41a" : "#f5f5f5",
            color: created > 0 ? "white" : "#999",
          }}
        />
      ),
    },
    {
      title: "Updated Issues (24h)",
      dataIndex: "updated",
      key: "updated",
      render: (updated: number) => (
        <Badge
          count={updated}
          showZero
          style={{
            backgroundColor: updated > 0 ? "#1890ff" : "#f5f5f5",
            color: updated > 0 ? "white" : "#999",
          }}
        />
      ),
    },
    {
      title: "Last Fetched",
      dataIndex: "lastFetched",
      key: "lastFetched",
      render: (lastFetched: number) => (
        <Tooltip title={formatDate(lastFetched)}>
          {new Date(lastFetched).toLocaleDateString()}
        </Tooltip>
      ),
    },
  ];

  // Define tabs for the dashboard
  const tabItems: TabsProps["items"] = [
    {
      key: "overview",
      label: "Overview",
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="Total Posts Viewed"
                  value={Object.keys(viewsBySource).length}
                  prefix={<EyeOutlined style={{ color: "#5e2a69" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="Total Reading Time"
                  value={readingTime}
                  prefix={<ClockCircleOutlined style={{ color: "#1e5631" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="Active Days"
                  value={daysSinceFirstView}
                  prefix={<ReadOutlined style={{ color: "#5e2a69" }} />}
                  suffix="days"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="Tags Interacted"
                  value={Object.keys(topTags).length}
                  prefix={<TagOutlined style={{ color: "#1e5631" }} />}
                />
              </Card>
            </Col>
          </Row>

          {/* Repository Activity Summary */}
          <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
            <Col xs={24} sm={12} md={8}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="Repositories Tracked"
                  value={totalReposTracked}
                  prefix={<GithubOutlined style={{ color: "#5e2a69" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="New Issues (24h)"
                  value={totalIssuesCreated}
                  prefix={<PlusOutlined style={{ color: "#52c41a" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="Updated Issues (24h)"
                  value={totalIssuesUpdated}
                  prefix={<EditOutlined style={{ color: "#1890ff" }} />}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts row */}
          <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
            <Col xs={24} lg={12}>
              <BarChart
                data={activityByDayData}
                title="Activity by Day of Week"
                description="Your content reading pattern by day"
                color="#5e2a69"
                loading={loading}
              />
            </Col>
            <Col xs={24} lg={12}>
              <PieChart
                data={viewsBySourceData}
                title="Content Sources"
                description="Distribution of content viewed by source"
                loading={loading}
              />
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "posts",
      label: "Post Analytics",
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title="Most Viewed Posts"
                variant="borderless"
                className="analytics-card"
                loading={loading}
              >
                {topViewed.length > 0 ? (
                  <List
                    dataSource={topViewed}
                    renderItem={(issue) => (
                      <List.Item
                        actions={[
                          <Link to={`/issue/${issue.issueNumber}`}>View</Link>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <VineIcon width={24} height={24} color="#5e2a69" />
                          }
                          title={`#${issue.issueNumber}`}
                          description={`${issue.viewCount} ${
                            issue.viewCount === 1 ? "view" : "views"
                          }`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No post view data available" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Top Tags"
                variant="borderless"
                className="analytics-card"
                loading={loading}
              >
                {topTags.length > 0 ? (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {topTags.map((tag, index) => (
                      <Tag
                        key={index}
                        color={`hsl(${index * 20}, 70%, 80%)`}
                        style={{
                          padding: "4px 8px",
                          margin: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#111",
                        }}
                      >
                        <span>{tag.tag}</span>
                        <span
                          style={{
                            background: "#fff",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "inline-flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {tag.count}
                        </span>
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Empty description="No tag data available" />
                )}
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "repositories",
      label: "Repository Analytics",
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card
                title="Repository Activity"
                variant="borderless"
                className="analytics-card"
                loading={loading}
              >
                {repoActivity.length > 0 ? (
                  <Table
                    dataSource={repoActivity}
                    columns={repoColumns}
                    rowKey="repoId"
                    pagination={{ pageSize: 5 }}
                  />
                ) : (
                  <Empty description="No repository activity data available" />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
            <Col span={24}>
              <Card
                title="Most Active Repositories"
                variant="borderless"
                className="analytics-card"
                loading={loading}
              >
                {mostActiveRepos.length > 0 ? (
                  <List
                    dataSource={mostActiveRepos}
                    renderItem={(repo) => (
                      <List.Item
                        actions={[
                          <Tooltip
                            title={`${repo.created} new, ${repo.updated} updated`}
                          >
                            <Badge
                              count={repo.created + repo.updated}
                              overflowCount={999}
                            />
                          </Tooltip>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <GithubOutlined
                              style={{ fontSize: 24, color: "#5e2a69" }}
                            />
                          }
                          title={`${repo.repoOwner}/${repo.repoName}`}
                          description={`Last updated: ${new Date(
                            repo.lastFetched
                          ).toLocaleDateString()}`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No active repositories data available" />
                )}
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "history",
      label: "Browsing History",
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card
                title="Recent Views"
                variant="borderless"
                className="analytics-card"
                loading={loading}
              >
                {viewHistory.length > 0 ? (
                  <List
                    dataSource={viewHistory}
                    renderItem={(view) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Link to={`/issue/${view.issueNumber}`}>
                                #{view.issueNumber} - {view.title}
                              </Link>
                              <Text type="secondary">
                                {formatDate(view.timestamp)}
                              </Text>
                            </div>
                          }
                          description={
                            <div>
                              <Text type="secondary">
                                Reading time:{" "}
                                {Math.floor(view.readingTime / 60)}m{" "}
                                {view.readingTime % 60}s
                              </Text>
                              <Text type="secondary" style={{ marginLeft: 16 }}>
                                Source: {view.source}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No browsing history available" />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
            <Col span={24}>
              <Card
                title="Recent Searches"
                variant="borderless"
                className="analytics-card"
                loading={loading}
              >
                {recentSearches.length > 0 ? (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {recentSearches.map((search, index) => (
                      <Tag
                        key={index}
                        style={{
                          padding: "4px 12px",
                          margin: "4px",
                          background: "#f0f0f0",
                          borderRadius: "16px",
                          color: "#333",
                        }}
                      >
                        {search}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Empty description="No search history available" />
                )}
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
  ];

  return (
    <div className="analytics-dashboard">
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Title level={2} style={{ margin: 0, color: "#5e2a69" }}>
              Personal Analytics Dashboard
            </Title>
            <Button danger icon={<DeleteOutlined />} onClick={handleClearData}>
              Clear Data
            </Button>
          </div>

          {showNoDataAlert && (
            <Alert
              message="No Analytics Data Available"
              description="Start browsing content to collect usage analytics. Your data is stored locally and is not shared."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Tabs
            defaultActiveKey="overview"
            items={tabItems}
            className="grapevine-tabs"
          />
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;
