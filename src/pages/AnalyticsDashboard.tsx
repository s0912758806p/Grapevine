import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Divider,
  Button,
  Alert,
  Tabs,
  Empty,
} from "antd";
import {
  ReadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TagOutlined,
  DeleteOutlined,
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
} from "../services/analyticsService";

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
  const [showNoDataAlert, setShowNoDataAlert] = useState<boolean>(false);

  // Load data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    const history = getViewHistory();
    setViewHistory(history);
    setTopViewed(getTopViewed(10));
    setReadingTime(getFormattedReadingTime());
    setTopTags(getMostInteractedTags(10));
    setDaysSinceFirstView(getDaysSinceFirstView());
    setActivityByDay(getActivityByDayOfWeek());
    setViewsBySource(getViewsBySource());
    setRecentSearches(getRecentSearches());

    // Show alert if no data is available
    setShowNoDataAlert(history.length === 0);
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

  // Format top tags data for visualization
  //   const topTagsData = topTags.map((tag) => ({
  //     category: tag.tag,
  //     value: tag.count,
  //   }));

  // Define tabs for the dashboard
  const tabItems: TabsProps["items"] = [
    {
      key: "overview",
      label: "Overview",
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless">
                <Statistic
                  title="Total Posts Viewed"
                  value={Object.keys(viewsBySource).length}
                  prefix={<EyeOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless">
                <Statistic
                  title="Total Reading Time"
                  value={readingTime}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false}>
                <Statistic
                  title="Active Days"
                  value={daysSinceFirstView}
                  prefix={<ReadOutlined />}
                  suffix="days"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false}>
                <Statistic
                  title="Tags Interacted"
                  value={Object.keys(topTags).length}
                  prefix={<TagOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">Activity by Day</Divider>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card bordered={false}>
                <div style={{ height: 300 }}>
                  {activityByDayData.some((day) => day.value > 0) ? (
                    <div style={{ display: "flex", height: "100%" }}>
                      {activityByDayData.map((day, index) => (
                        <div
                          key={index}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              marginTop: "auto",
                              width: "60%",
                              background: "#1677ff",
                              height: `${
                                (day.value /
                                  Math.max(
                                    ...activityByDayData.map((d) => d.value)
                                  )) *
                                  100 || 0
                              }%`,
                            }}
                          />
                          <div style={{ marginTop: "8px" }}>{day.category}</div>
                          <div style={{ fontSize: "12px" }}>{day.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="No activity data available" />
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">Content Sources</Divider>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card bordered={false}>
                <div style={{ height: 300 }}>
                  {viewsBySourceData.length > 0 ? (
                    <div style={{ display: "flex", height: "100%" }}>
                      {viewsBySourceData.map((source, index) => (
                        <div
                          key={index}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Text>{source.type}</Text>
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "flex-end",
                              width: "100%",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "60%",
                                background: `hsl(${index * 30}, 70%, 50%)`,
                                height: `${
                                  (source.value /
                                    Math.max(
                                      ...viewsBySourceData.map((s) => s.value)
                                    )) *
                                  80
                                }%`,
                                minHeight: "20px",
                                borderRadius: "4px 4px 0 0",
                              }}
                            />
                          </div>
                          <Text>{source.value} views</Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="No source data available" />
                  )}
                </div>
              </Card>
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
          <Divider orientation="left">Most Viewed Posts</Divider>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card variant="borderless">
                {topViewed.length > 0 ? (
                  topViewed.map((issue, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div>#{issue.issueNumber}</div>
                        <div>Views: {issue.viewCount}</div>
                      </div>
                      <div>
                        <Button
                          type="link"
                          href={`/issue/${issue.issueNumber}`}
                        >
                          View Post
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty description="No post view data available" />
                )}
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">Top Tags</Divider>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card variant="borderless">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {topTags.length > 0 ? (
                    topTags.map((tag, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "4px 12px",
                          background: `hsl(${index * 20}, 70%, 90%)`,
                          borderRadius: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
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
                          }}
                        >
                          {tag.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <Empty description="No tag data available" />
                  )}
                </div>
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
          <Divider orientation="left">Recent Views</Divider>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card variant="borderless">
                {viewHistory.length > 0 ? (
                  viewHistory.map((view, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: 16,
                        padding: "12px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text strong>
                          #{view.issueNumber} - {view.title}
                        </Text>
                        <Text type="secondary">
                          {formatDate(view.timestamp)}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          Reading time: {Math.floor(view.readingTime / 60)}m{" "}
                          {view.readingTime % 60}s
                        </Text>
                        <Text type="secondary" style={{ marginLeft: 16 }}>
                          Source: {view.source}
                        </Text>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty description="No browsing history available" />
                )}
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">Recent Searches</Divider>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card variant="borderless">
                {recentSearches.length > 0 ? (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "4px 12px",
                          background: "#f0f0f0",
                          borderRadius: "16px",
                        }}
                      >
                        {search}
                      </div>
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
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {window.location.href.includes(
            `${import.meta.env.VITE_HOST_AUTHOR}`
          ) && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Title level={2}>Personal Analytics Dashboard</Title>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearData}
              >
                Clear Data
              </Button>
            </div>
          )}

          {showNoDataAlert && (
            <Alert
              message="No Analytics Data Available"
              description="Start browsing content to collect usage analytics. Your data is stored locally and is not shared."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Tabs defaultActiveKey="overview" items={tabItems} />
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;
