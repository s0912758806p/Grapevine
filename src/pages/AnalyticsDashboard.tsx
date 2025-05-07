import React, { useEffect, useState, useMemo } from "react";
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
  Table,
  Badge,
  Tooltip,
  Progress,
  Calendar,
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  GithubOutlined,
  PlusOutlined,
  EditOutlined,
  UserOutlined,
  FireOutlined,
  CalendarOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { TabsProps } from "antd";
import { clearAnalyticsData } from "../services/analyticsService";
import { Link } from "react-router-dom";
import BarChart from "../components/charts/BarChart";
import {
  getFilteredViewHistory,
  getFilteredRepoActivity,
  getFilteredMostActiveRepos,
  getContributionMetrics,
  getActivityByDate,
  getRepoContributionsOverTime,
  getDetailedContributionsByDate,
  getActivityByDayOfWeekFromRepos,
} from "../services/authorAnalyticsService";
import { formatDate, formatShortDate } from "../utils/dateUtils";
import {
  ViewRecord,
  RepoActivity,
  ContributionMetrics,
  DailyActivity,
} from "../types/analytics";

const { Title, Text } = Typography;

const AnalyticsDashboard: React.FC = () => {
  const [viewHistory, setViewHistory] = useState<ViewRecord[]>([]);
  const [repoActivity, setRepoActivity] = useState<RepoActivity[]>([]);
  const [mostActiveRepos, setMostActiveRepos] = useState<RepoActivity[]>([]);
  const [contributionMetrics, setContributionMetrics] =
    useState<ContributionMetrics>({
      totalContributions: 0,
      issuesCreated: 0,
      issuesUpdated: 0,
      repos: 0,
      avgContributionsPerRepo: 0,
    });
  const [activityByDate, setActivityByDate] = useState<DailyActivity[]>([]);
  const [contributionsOverTime, setContributionsOverTime] = useState<
    { date: string; contributions: number }[]
  >([]);
  const [activityByDay, setActivityByDay] = useState<number[]>([]);
  const [showNoDataAlert, setShowNoDataAlert] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Activity heatmap data formatted for the Calendar component
  const calendarData = useMemo(() => {
    const data: Record<string, number> = {};

    // Ensure we're using consistently formatted date strings
    activityByDate.forEach((item) => {
      // Normalize the date format to ensure consistency
      const normalizedDate = new Date(item.date);
      const dateKey = formatShortDate(normalizedDate.getTime());
      data[dateKey] = item.count;
    });

    return data;
  }, [activityByDate]);

  // Contributions over time formatted for BarChart
  const contributionsChartData = useMemo(
    () =>
      contributionsOverTime.map((item) => ({
        category: item.date.substring(5), // Only show month/day for cleaner display
        value: item.contributions,
      })),
    [contributionsOverTime]
  );

  // Activity by day of week data for visualization
  const activityByDayData = useMemo(
    () => [
      { category: "Sun", value: activityByDay[0] || 0 },
      { category: "Mon", value: activityByDay[1] || 0 },
      { category: "Tue", value: activityByDay[2] || 0 },
      { category: "Wed", value: activityByDay[3] || 0 },
      { category: "Thu", value: activityByDay[4] || 0 },
      { category: "Fri", value: activityByDay[5] || 0 },
      { category: "Sat", value: activityByDay[6] || 0 },
    ],
    [activityByDay]
  );

  // Load data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    setLoading(true);

    try {
      // Load filtered data focused on the target author
      const history = getFilteredViewHistory();
      setViewHistory(history);

      // Get repository activity
      const repoActivityData = getFilteredRepoActivity();
      setRepoActivity(repoActivityData);
      setMostActiveRepos(getFilteredMostActiveRepos(5));

      // Calculate contribution metrics
      setContributionMetrics(getContributionMetrics());

      // Get activity patterns
      setActivityByDate(getActivityByDate());
      setContributionsOverTime(getRepoContributionsOverTime(30));
      setActivityByDay(getActivityByDayOfWeekFromRepos());

      // Show alert if no data is available
      setShowNoDataAlert(history.length === 0 && repoActivityData.length === 0);
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

  // Repository activity table columns
  const repoColumns = [
    {
      title: "Repository",
      dataIndex: "repoName",
      key: "repoName",
      render: (text: string, record: RepoActivity) => (
        <span>
          <GithubOutlined style={{ marginRight: 8 }} />
          <Link
            to={`https://github.com/${record.repoOwner}/${text}`}
            target="_blank"
          >
            {text}
          </Link>
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
          showZero={true}
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
          showZero={true}
          style={{
            backgroundColor: updated > 0 ? "#1890ff" : "#f5f5f5",
            color: updated > 0 ? "white" : "#999",
          }}
        />
      ),
    },
    {
      title: "Total Activity",
      key: "totalActivity",
      render: (_: unknown, record: RepoActivity) => {
        const total = record.created + record.updated;
        return (
          <Progress
            percent={Math.min(100, total * 10)}
            size="small"
            showInfo={false}
            strokeColor="#5e2a69"
          />
        );
      },
    },
    {
      title: "Last Updated",
      dataIndex: "lastFetched",
      key: "lastFetched",
      render: (lastFetched: number) => (
        <Tooltip title={formatDate(lastFetched)}>
          {formatShortDate(lastFetched)}
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
                  title="Total Contributions"
                  value={contributionMetrics.totalContributions}
                  prefix={<FireOutlined style={{ color: "#e25822" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="Issues Created"
                  value={contributionMetrics.issuesCreated}
                  prefix={<PlusOutlined style={{ color: "#52c41a" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="Issues Updated"
                  value={contributionMetrics.issuesUpdated}
                  prefix={<EditOutlined style={{ color: "#1890ff" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" className="analytics-card">
                <Statistic
                  title="Active Repositories"
                  value={contributionMetrics.repos}
                  prefix={<GithubOutlined style={{ color: "#5e2a69" }} />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <CalendarOutlined
                      style={{ marginRight: 8, color: "#5e2a69" }}
                    />
                    <span>Activity Trends (Daily Contributions)</span>
                  </div>
                }
                variant="borderless"
                className="analytics-card"
                loading={loading}
              >
                <BarChart
                  data={contributionsChartData.slice(-14)} // Show last 14 days for better visibility
                  title=""
                  description="Daily contribution activity by s0912758806p"
                  color="#5e2a69"
                  loading={loading}
                />
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 12,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Shows actual contributions (created + updated issues) by day
                  over the last 14 days
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <ClockCircleOutlined
                      style={{ marginRight: 8, color: "#1e5631" }}
                    />
                    <span>Activity by Day of Week</span>
                  </div>
                }
                variant="borderless"
                className="analytics-card"
                loading={loading}
              >
                <BarChart
                  data={activityByDayData}
                  title=""
                  description="Estimated contribution pattern by day of week"
                  color="#1e5631"
                  loading={loading}
                />
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 12,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Analyzes repository data and view history to estimate typical
                  weekly activity pattern
                </div>
              </Card>
            </Col>
          </Row>

          {contributionMetrics.mostActiveRepo && (
            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              <Col span={24}>
                <Card variant="borderless" className="analytics-card">
                  <Row>
                    <Col span={12}>
                      <Statistic
                        title="Most Active Repository"
                        value={contributionMetrics.mostActiveRepo}
                        prefix={<StarOutlined style={{ color: "#faad14" }} />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Avg. Contributions per Repo"
                        value={contributionMetrics.avgContributionsPerRepo}
                        precision={1}
                        prefix={<FireOutlined style={{ color: "#e25822" }} />}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          )}
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
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <GithubOutlined
                      style={{ marginRight: 8, color: "#5e2a69" }}
                    />
                    <span>Repository Activity</span>
                  </div>
                }
                variant="borderless"
                className="analytics-card"
                loading={loading}
              >
                {repoActivity.length > 0 ? (
                  <Table
                    dataSource={repoActivity}
                    columns={repoColumns}
                    rowKey="repoId"
                    pagination={{ pageSize: 8 }}
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
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FireOutlined
                      style={{ marginRight: 8, color: "#e25822" }}
                    />
                    <span>Most Active Repositories</span>
                  </div>
                }
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
                              style={{ backgroundColor: "#5e2a69" }}
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
                          title={
                            <Link
                              to={`https://github.com/${repo.repoOwner}/${repo.repoName}`}
                              target="_blank"
                            >
                              {repo.repoName}
                            </Link>
                          }
                          description={
                            <div>
                              <Progress
                                percent={Math.min(
                                  100,
                                  (repo.created + repo.updated) * 5
                                )}
                                size="small"
                                showInfo={false}
                                strokeColor={{
                                  from: "#e25822",
                                  to: "#5e2a69",
                                }}
                              />
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                Last updated:{" "}
                                {formatShortDate(repo.lastFetched)}
                              </Text>
                            </div>
                          }
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
      key: "activity",
      label: "Activity Calendar",
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CalendarOutlined
                    style={{ marginRight: 8, color: "#5e2a69" }}
                  />
                  <span>Activity Calendar</span>
                </div>
              }
              variant="borderless"
              className="analytics-card"
              loading={loading}
            >
              {activityByDate.length > 0 ? (
                <div className="site-calendar-demo-card">
                  <Calendar
                    fullscreen={false}
                    dateCellRender={(date) => {
                      // Use correct date format
                      const dateObj = date.toDate();
                      const dateString = formatShortDate(dateObj.getTime());
                      const count = calendarData[dateString] || 0;

                      if (count === 0) return null;

                      // Get repo information for this date if available
                      const detailedData =
                        getDetailedContributionsByDate(repoActivity)[
                          dateString
                        ];
                      const repoNames = detailedData?.repos || [];

                      return (
                        <Tooltip
                          title={
                            <>
                              <div>
                                <strong>
                                  {dateString}: {count} contribution(s)
                                </strong>
                              </div>
                              {repoNames.length > 0 && (
                                <div>Repos: {repoNames.join(", ")}</div>
                              )}
                            </>
                          }
                        >
                          <div
                            className="activity-badge"
                            style={{
                              backgroundColor:
                                count > 3
                                  ? "#5e2a69"
                                  : count > 1
                                  ? "#8c6697"
                                  : "#bfa8c9",
                              width: "100%",
                              height: "100%",
                              borderRadius: "4px",
                              color: "white",
                              textAlign: "center",
                              lineHeight: "24px",
                            }}
                          >
                            {count}
                          </div>
                        </Tooltip>
                      );
                    }}
                  />
                </div>
              ) : (
                <Empty description="No activity calendar data available" />
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "history",
      label: "Browsing History",
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <EyeOutlined style={{ marginRight: 8, color: "#5e2a69" }} />
                  <span>Recent Views</span>
                </div>
              }
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
                              Reading time: {Math.floor(view.readingTime / 60)}m{" "}
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
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="No browsing history available" />
              )}
            </Card>
          </Col>
        </Row>
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
              <UserOutlined style={{ marginRight: 12 }} />
              Author's Activity Dashboard
            </Title>
            <Button danger icon={<DeleteOutlined />} onClick={handleClearData}>
              Clear Data
            </Button>
          </div>

          {showNoDataAlert && (
            <Alert
              message={`No Analytics Data Available for Author`}
              description="Start browsing content or tracking repositories to collect analytics data. Your data is stored locally and is not shared."
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
