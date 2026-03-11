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

  // Calculate content count by category
  const getCountByCategory = (categoryId: string): number => {
    if (categoryId === "all") {
      // For "all" category, count all active repositories
      return repositories.filter(repo => repo.isActive).length;
    }
    // For other categories, count active repositories in that category
    return repositories.filter(repo => repo.isActive && repo.category === categoryId).length;
  };

  // Fetch issues for the default category on first render
  useEffect(() => {
    if (activeCategory) {
      dispatch(fetchIssuesByCategory({ 
        categoryId: activeCategory, 
        page: 1, 
        perPage: 10 
      }));
    }
  }, [dispatch, activeCategory]);

  // Handle tab change
  const handleTabChange = (key: string) => {
    dispatch(setActiveCategory(key));
  };

  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );

  // Tab items
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