import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Badge, Typography } from "antd";
import type { TabsProps } from "antd";
import { RootState, AppDispatch } from "../store";
import { fetchIssuesByCategory, setActiveCategory } from "../store/repositoriesSlice";

const { Text } = Typography;

const CategoryTabs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, repositories, activeCategory, issues } = useSelector(
    (state: RootState) => state.repositories
  );

  // 根據類別計算內容數量
  const getCountByCategory = (categoryId: string): number => {
    if (categoryId === "all") {
      // 對於 "all" 類別，計算所有活動倉庫的議題數量
      return repositories.filter(repo => repo.isActive).length;
    }
    // 對於其他類別，計算屬於該類別的活動倉庫數量
    return repositories.filter(repo => repo.isActive && repo.category === categoryId).length;
  };

  // 在首次渲染時獲取默認類別的問題
  useEffect(() => {
    if (activeCategory) {
      dispatch(fetchIssuesByCategory({ 
        categoryId: activeCategory, 
        page: 1, 
        perPage: 10 
      }));
    }
  }, [dispatch, activeCategory]);

  // 處理標籤變更
  const handleTabChange = (key: string) => {
    dispatch(setActiveCategory(key));
  };

  // 按順序對類別進行排序
  const sortedCategories = [...categories].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );

  // 標籤項
  const tabItems: TabsProps["items"] = sortedCategories.map(category => ({
    key: category.id,
    label: (
      <span>
        {category.name}
        <Badge 
          count={getCountByCategory(category.id)} 
          style={{ 
            marginLeft: 8,
            backgroundColor: category.id === 'all' ? '#1677ff' : '#52c41a'
          }} 
        />
      </span>
    ),
    children: (
      <div>
        {issues.length > 0 ? (
          <Text>Loaded {issues.length} issues</Text>
        ) : (
          <Text>No available content</Text>
        )}
      </div>
    ),
  }));

  return (
    <Tabs 
      defaultActiveKey={activeCategory || "all"} 
      style={{ padding: "0 16px" }} 
      items={tabItems}
      onChange={handleTabChange}
    />
  );
};

export default CategoryTabs; 