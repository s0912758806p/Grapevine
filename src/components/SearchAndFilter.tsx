import React, { useState, useEffect } from 'react';
import { 
  Input, Select, Button, Row, Col, Card, Tag, Drawer, Space, 
  Typography, DatePicker, Tooltip, Divider 
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, SaveOutlined, 
  DeleteOutlined, SortAscendingOutlined, SortDescendingOutlined,
  StarFilled
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import dayjs from 'dayjs';
import { SearchFilter } from '../types';
import { setSearchFilter, clearSearchFilter, saveSearchFilter, removeSavedFilter } from '../store/searchSlice';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SearchAndFilter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { repositories } = useSelector((state: RootState) => state.repositories);
  const { currentFilter, savedFilters } = useSelector((state: RootState) => state.search);

  // Local state for the form values
  const [keyword, setKeyword] = useState(currentFilter.keyword || '');
  const [selectedRepos, setSelectedRepos] = useState<string[]>(currentFilter.repositories || []);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(currentFilter.labels || []);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(currentFilter.authors || []);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>(
    currentFilter.dateRange 
      ? [
          currentFilter.dateRange[0] ? dayjs(currentFilter.dateRange[0]) : null,
          currentFilter.dateRange[1] ? dayjs(currentFilter.dateRange[1]) : null
        ] 
      : [null, null]
  );
  const [sortBy, setSortBy] = useState(currentFilter.sortBy || 'updated');
  const [sortOrder, setSortOrder] = useState(currentFilter.sortOrder || 'desc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedFilterName, setSavedFilterName] = useState('');

  // Collect all available labels from the issues
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);

  // Load labels and authors
  useEffect(() => {
    // This would typically come from an API or be collected from the loaded issues
    // For demo purposes, let's set some sample values
    setAvailableLabels(['bug', 'feature', 'documentation', 'enhancement', 'help wanted', 'good first issue']);
    setAvailableAuthors(['johndoe', 'janedoe', 'bobsmith', 'alicejones']);
  }, []);

  // Handle search submission
  const handleSearch = () => {
    const filter: SearchFilter = {
      keyword,
      repositories: selectedRepos,
      labels: selectedLabels,
      authors: selectedAuthors,
      dateRange: dateRange[0] || dateRange[1] 
        ? [dateRange[0]?.toISOString() || null, dateRange[1]?.toISOString() || null] 
        : null,
      sortBy,
      sortOrder
    };
    
    dispatch(setSearchFilter(filter));
    setShowAdvanced(false);
  };

  // Clear all filters
  const handleClear = () => {
    setKeyword('');
    setSelectedRepos([]);
    setSelectedLabels([]);
    setSelectedAuthors([]);
    setDateRange([null, null]);
    setSortBy('updated');
    setSortOrder('desc');
    dispatch(clearSearchFilter());
  };

  // Save current filter
  const handleSaveFilter = () => {
    if (!savedFilterName.trim()) return;
    
    const filterToSave: SearchFilter = {
      id: `filter-${Date.now()}`,
      name: savedFilterName,
      keyword,
      repositories: selectedRepos,
      labels: selectedLabels,
      authors: selectedAuthors,
      dateRange: dateRange[0] || dateRange[1] 
        ? [dateRange[0]?.toISOString() || null, dateRange[1]?.toISOString() || null] 
        : null,
      sortBy,
      sortOrder
    };
    
    dispatch(saveSearchFilter(filterToSave));
    setSavedFilterName('');
  };

  // Load a saved filter
  const handleLoadFilter = (filter: SearchFilter) => {
    setKeyword(filter.keyword || '');
    setSelectedRepos(filter.repositories || []);
    setSelectedLabels(filter.labels || []);
    setSelectedAuthors(filter.authors || []);
    setDateRange(
      filter.dateRange 
        ? [
            filter.dateRange[0] ? dayjs(filter.dateRange[0]) : null,
            filter.dateRange[1] ? dayjs(filter.dateRange[1]) : null
          ] 
        : [null, null]
    );
    setSortBy(filter.sortBy || 'updated');
    setSortOrder(filter.sortOrder || 'desc');
    dispatch(setSearchFilter(filter));
  };

  // Remove a saved filter
  const handleRemoveFilter = (filterId: string) => {
    dispatch(removeSavedFilter(filterId));
  };

  // Active repositories for dropdown
  const activeRepos = repositories.filter(repo => repo.isActive);

  return (
    <div className="search-filter-container">
      {/* Basic search bar */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={16} md={18} lg={20}>
          <Input
            placeholder="Search issues by keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            size="large"
          />
        </Col>
        <Col xs={24} sm={8} md={6} lg={4}>
          <Space style={{ width: '100%' }}>
            <Button 
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              size="large"
            >
              Search
            </Button>
            <Button 
              icon={<FilterOutlined />}
              onClick={() => setShowAdvanced(true)}
              size="large"
            >
              Filter
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Active filter display */}
      {(keyword || selectedRepos.length > 0 || selectedLabels.length > 0 || 
        selectedAuthors.length > 0 || (dateRange[0] || dateRange[1])) && (
        <Card 
          size="small" 
          title="Active Filters" 
          style={{ marginBottom: 16 }}
          extra={
            <Button 
              size="small" 
              icon={<DeleteOutlined />} 
              onClick={handleClear}
            >
              Clear All
            </Button>
          }
        >
          <Row gutter={[8, 8]}>
            {keyword && (
              <Col>
                <Tag closable onClose={() => setKeyword('')}>
                  Keyword: {keyword}
                </Tag>
              </Col>
            )}
            
            {selectedRepos.map(repoId => {
              const repo = repositories.find(r => r.id === repoId);
              return repo ? (
                <Col key={`repo-${repoId}`}>
                  <Tag 
                    closable 
                    onClose={() => setSelectedRepos(selectedRepos.filter(id => id !== repoId))}
                  >
                    Repository: {repo.name}
                  </Tag>
                </Col>
              ) : null;
            })}
            
            {selectedLabels.map(label => (
              <Col key={`label-${label}`}>
                <Tag 
                  closable 
                  onClose={() => setSelectedLabels(selectedLabels.filter(l => l !== label))}
                >
                  Label: {label}
                </Tag>
              </Col>
            ))}
            
            {selectedAuthors.map(author => (
              <Col key={`author-${author}`}>
                <Tag 
                  closable 
                  onClose={() => setSelectedAuthors(selectedAuthors.filter(a => a !== author))}
                >
                  Author: {author}
                </Tag>
              </Col>
            ))}
            
            {(dateRange[0] || dateRange[1]) && (
              <Col>
                <Tag 
                  closable 
                  onClose={() => setDateRange([null, null])}
                >
                  Date: {dateRange[0]?.format('YYYY-MM-DD') || 'Any'} to {dateRange[1]?.format('YYYY-MM-DD') || 'Any'}
                </Tag>
              </Col>
            )}
            
            <Col>
              <Tag color="blue">
                Sort: {sortBy === 'created' ? 'Created' : 'Updated'} 
                {sortOrder === 'asc' ? ' (Oldest first)' : ' (Newest first)'}
              </Tag>
            </Col>
          </Row>
        </Card>
      )}

      {/* Saved filters display */}
      {savedFilters.length > 0 && (
        <Card size="small" title="Saved Filters" style={{ marginBottom: 16 }}>
          <Row gutter={[8, 8]}>
            {savedFilters.map(filter => (
              <Col key={`saved-${filter.id}`}>
                <Tag 
                  color="purple"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleLoadFilter(filter)}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    handleRemoveFilter(filter.id || '');
                  }}
                >
                  <StarFilled style={{ marginRight: 4 }} />
                  {filter.name}
                </Tag>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Advanced filter drawer */}
      <Drawer
        title="Advanced Search & Filter"
        width={480}
        onClose={() => setShowAdvanced(false)}
        open={showAdvanced}
        footer={
          <Row justify="space-between" align="middle">
            <Col span={16}>
              <Space>
                <Input
                  placeholder="Filter name"
                  value={savedFilterName}
                  onChange={(e) => setSavedFilterName(e.target.value)}
                  style={{ width: 150 }}
                />
                <Button 
                  icon={<SaveOutlined />} 
                  onClick={handleSaveFilter}
                  disabled={!savedFilterName.trim()}
                >
                  Save Filter
                </Button>
              </Space>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleClear}>
                  Reset
                </Button>
                <Button type="primary" onClick={handleSearch}>
                  Apply
                </Button>
              </Space>
            </Col>
          </Row>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Keyword search */}
          <div>
            <Text strong>Keyword</Text>
            <Input
              placeholder="Search issues by keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: '100%', marginTop: 8 }}
            />
          </div>

          <Divider />

          {/* Repository filter */}
          <div>
            <Text strong>Repositories</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select repositories"
              value={selectedRepos}
              onChange={setSelectedRepos}
              optionFilterProp="children"
            >
              {activeRepos.map(repo => (
                <Option key={repo.id} value={repo.id}>
                  {repo.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Label filter */}
          <div>
            <Text strong>Labels</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select labels"
              value={selectedLabels}
              onChange={setSelectedLabels}
              optionFilterProp="children"
            >
              {availableLabels.map(label => (
                <Option key={label} value={label}>
                  {label}
                </Option>
              ))}
            </Select>
          </div>

          {/* Author filter */}
          <div>
            <Text strong>Authors</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select authors"
              value={selectedAuthors}
              onChange={setSelectedAuthors}
              optionFilterProp="children"
            >
              {availableAuthors.map(author => (
                <Option key={author} value={author}>
                  {author}
                </Option>
              ))}
            </Select>
          </div>

          {/* Date range filter */}
          <div>
            <Text strong>Date Range</Text>
            <RangePicker 
              style={{ width: '100%', marginTop: 8 }}
              value={dateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null]}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
            />
          </div>

          <Divider />

          {/* Sorting options */}
          <div>
            <Text strong>Sort By</Text>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Select
                  style={{ width: '100%' }}
                  value={sortBy}
                  onChange={setSortBy}
                >
                  <Option value="updated">Updated Date</Option>
                  <Option value="created">Created Date</Option>
                </Select>
              </Col>
              <Col span={12}>
                <Tooltip title={sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}>
                  <Button 
                    icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    style={{ width: '100%' }}
                  >
                    {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </div>
        </Space>
      </Drawer>
    </div>
  );
};

export default SearchAndFilter; 