import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { List, Avatar, Tag, Space, Spin, Button, Divider, Typography, Empty } from "antd";
import { LoadingOutlined, MessageOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RootState, AppDispatch } from "../store";
import { fetchIssuesByCategory, setPage } from "../store/repositoriesSlice";
import { IssueType, RepositorySource } from "../types";
import SearchAndFilter from "./SearchAndFilter";

// 設置 dayjs 的相對時間插件
dayjs.extend(relativeTime);

const { Text } = Typography;

// 加載圖標
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const RepositoryIssueList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    issues, 
    status, 
    pagination, 
    activeCategory,
    repositories,
    hasMorePages 
  } = useSelector((state: RootState) => state.repositories);
  
  const { currentFilter } = useSelector((state: RootState) => state.search);

  // 追蹤每個來源的顏色
  const [repoColors, setRepoColors] = useState<Record<string, string>>({});

  // 在組件掛載時為每個來源生成隨機顏色
  useEffect(() => {
    // 預定義的顏色
    const colors = [
      "#f50", "#108ee9", "#87d068", "#2db7f5", "#673ab7",
      "#ff5722", "#4caf50", "#9c27b0", "#607d8b", "#ff9800"
    ];
    
    const newColors: Record<string, string> = {};
    repositories.forEach((repo, index) => {
      // 為每個倉庫循環使用顏色
      newColors[repo.id] = colors[index % colors.length];
    });
    
    setRepoColors(newColors);
  }, [repositories]);

  // 獲取更多問題
  const loadMore = useCallback(() => {
    if (activeCategory && !status.includes("loading")) {
      const nextPage = pagination.currentPage + 1;
      dispatch(setPage(nextPage));
      dispatch(fetchIssuesByCategory({
        categoryId: activeCategory,
        page: nextPage,
        perPage: pagination.perPage
      }));
    }
  }, [activeCategory, status, pagination.currentPage, pagination.perPage, dispatch]);

  // 獲取倉庫資料
  const getRepositoryById = (repoId: string): RepositorySource | undefined => {
    return repositories.find(repo => repo.id === repoId);
  };

  // 渲染倉庫標籤
  const renderSourceTag = (issue: IssueType) => {
    if (!issue.source) return null;
    
    const repo = getRepositoryById(issue.source);
    if (!repo) return null;
    
    return (
      <Tag color={repoColors[issue.source] || "#108ee9"}>
        {repo.name}
      </Tag>
    );
  };

  // 篩選並排序 issues
  const filteredIssues = useMemo(() => {
    // 如果沒有過濾條件，返回原始問題列表
    if (!currentFilter || Object.keys(currentFilter).length === 0) {
      return issues;
    }

    return issues.filter(issue => {
      // 關鍵字過濾
      if (currentFilter.keyword && currentFilter.keyword.trim() !== '') {
        const keyword = currentFilter.keyword.toLowerCase();
        const title = issue.title.toLowerCase();
        const body = issue.body ? issue.body.toLowerCase() : '';
        const username = issue.user.login.toLowerCase();
        
        if (!title.includes(keyword) && 
            !body.includes(keyword) && 
            !username.includes(keyword)) {
          return false;
        }
      }
      
      // 倉庫過濾
      if (currentFilter.repositories && 
          currentFilter.repositories.length > 0 && 
          issue.source && 
          !currentFilter.repositories.includes(issue.source)) {
        return false;
      }
      
      // 標籤過濾
      if (currentFilter.labels && currentFilter.labels.length > 0) {
        const issueLabels = issue.labels.map(l => l.name.toLowerCase());
        const filterLabels = currentFilter.labels.map(l => l.toLowerCase());
        
        if (!filterLabels.some(label => issueLabels.includes(label))) {
          return false;
        }
      }
      
      // 作者過濾
      if (currentFilter.authors && 
          currentFilter.authors.length > 0 && 
          !currentFilter.authors.includes(issue.user.login)) {
        return false;
      }
      
      // 日期過濾
      if (currentFilter.dateRange && (currentFilter.dateRange[0] || currentFilter.dateRange[1])) {
        const issueDate = currentFilter.sortBy === 'created' 
          ? new Date(issue.created_at) 
          : new Date(issue.updated_at);
        
        if (currentFilter.dateRange[0]) {
          const startDate = new Date(currentFilter.dateRange[0]);
          if (issueDate < startDate) {
            return false;
          }
        }
        
        if (currentFilter.dateRange[1]) {
          const endDate = new Date(currentFilter.dateRange[1]);
          if (issueDate > endDate) {
            return false;
          }
        }
      }
      
      return true;
    }).sort((a, b) => {
      // 排序
      const sortField = currentFilter.sortBy === 'created' ? 'created_at' : 'updated_at';
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      
      return currentFilter.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [issues, currentFilter]);

  // 自動加載更多過濾後的結果，如果過濾後結果太少
  useEffect(() => {
    const hasFilters = currentFilter && Object.keys(currentFilter).length > 0;
    const hasLimitedFilteredResults = filteredIssues.length < 5 && filteredIssues.length > 0;
    
    if (hasFilters && hasLimitedFilteredResults && hasMorePages && !status.includes("loading")) {
      loadMore();
    }
  }, [filteredIssues, currentFilter, hasMorePages, status, loadMore, activeCategory, pagination.perPage]);

  // 渲染議題列表
  return (
    <div>
      {/* 搜索和過濾組件 */}
      <div style={{ marginBottom: 16 }}>
        <SearchAndFilter />
      </div>
      
      {status === "loading" && issues.length === 0 ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin indicator={antIcon} />
        </div>
      ) : (
        <>
          {filteredIssues.length === 0 ? (
            <Empty 
              description={
                Object.keys(currentFilter).length > 0 
                  ? "No issues match your search criteria" 
                  : "No issues found"
              }
              style={{ margin: "40px 0" }}
            />
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <Text>Found {filteredIssues.length} issue(s)</Text>
              </div>
              <List
                itemLayout="vertical"
                dataSource={filteredIssues}
                renderItem={(issue) => (
                  <List.Item
                    key={`${issue.source}-${issue.number}`}
                    actions={[
                      <Space key="comments">
                        <MessageOutlined />
                        {issue.comments} Comments
                      </Space>,
                      <Space key="time">
                        <ClockCircleOutlined />
                        {dayjs(issue.updated_at).fromNow()}
                      </Space>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={issue.user.avatar_url} />}
                      title={
                        <Space size="middle">
                          <Link to={`/repository-issue/${issue.source}/${issue.number}`}>
                            {issue.title}
                          </Link>
                          {renderSourceTag(issue)}
                        </Space>
                      }
                      description={
                        <Space size="small" wrap>
                          <Text type="secondary">
                            Posted by {issue.user.login}
                          </Text>
                          <Divider type="vertical" />
                          {issue.labels.map((label) => (
                            <Tag
                              key={label.name}
                              color={`#${label.color}`}
                            >
                              {label.name}
                            </Tag>
                          ))}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </>
          )}
          {hasMorePages && (
            <div style={{ textAlign: "center", marginTop: 16, marginBottom: 16 }}>
              <Button
                onClick={loadMore}
                disabled={status === "loading"}
                type={status === "loading" ? "default" : "primary"}
              >
                {status === "loading" ? 
                  "Loading..." : 
                  `Load More`}
              </Button>
              {status === "loading" && <div style={{marginTop: 8}}>Loading more data from GitHub...</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RepositoryIssueList; 