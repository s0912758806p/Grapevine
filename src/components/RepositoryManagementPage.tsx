import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Layout,
  Typography,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Tooltip,
  Divider,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  GithubOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../store";
import {
  addRepository,
  updateRepository,
  removeRepository,
  toggleRepositoryActive,
  addCategory,
  updateCategory,
  removeCategory,
} from "../store/repositoriesSlice";
import { RepositorySource, CategoryType } from "../types";

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

const RepositoryManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { repositories, categories } = useSelector(
    (state: RootState) => state.repositories
  );

  // 狀態管理
  const [isRepoModalVisible, setIsRepoModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingRepo, setEditingRepo] = useState<RepositorySource | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(
    null
  );
  const [repoForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  // 重置表單
  const resetRepoForm = () => {
    repoForm.resetFields();
    setEditingRepo(null);
  };

  const resetCategoryForm = () => {
    categoryForm.resetFields();
    setEditingCategory(null);
  };

  // 打開添加/編輯倉庫模態框
  const showRepoModal = (repo?: RepositorySource) => {
    if (repo) {
      setEditingRepo(repo);
      repoForm.setFieldsValue(repo);
    } else {
      resetRepoForm();
    }
    setIsRepoModalVisible(true);
  };

  // 打開添加/編輯分類模態框
  const showCategoryModal = (category?: CategoryType) => {
    if (category) {
      setEditingCategory(category);
      categoryForm.setFieldsValue(category);
    } else {
      resetCategoryForm();
    }
    setIsCategoryModalVisible(true);
  };

  // 處理倉庫表單提交
  const handleRepoSubmit = (values: RepositorySource) => {
    // 確保 isActive 欄位存在
    const repoData = {
      ...values,
      isActive: values.isActive === undefined ? true : values.isActive,
    };

    if (editingRepo) {
      // 編輯現有倉庫
      dispatch(updateRepository(repoData));
      message.success("Repository updated");
    } else {
      // 添加新倉庫
      dispatch(addRepository(repoData));
      message.success("Repository added");
    }
    setIsRepoModalVisible(false);
    resetRepoForm();
  };

  // 處理分類表單提交
  const handleCategorySubmit = (values: CategoryType) => {
    if (editingCategory) {
      // 編輯現有分類
      dispatch(updateCategory(values));
      message.success("Category updated");
    } else {
      // 添加新分類
      dispatch(addCategory(values));
      message.success("Category added");
    }
    setIsCategoryModalVisible(false);
    resetCategoryForm();
  };

  // 確認刪除倉庫
  const confirmDeleteRepo = (id: string) => {
    Modal.confirm({
      title: "Confirm delete",
      content:
        "Are you sure you want to delete this repository source? This action cannot be undone.",
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: () => {
        dispatch(removeRepository(id));
        message.success("Repository deleted");
      },
    });
  };

  // 確認刪除分類
  const confirmDeleteCategory = (id: string) => {
    if (id === "all") {
      message.error("Cannot delete the 'all' category");
      return;
    }

    Modal.confirm({
      title: "Confirm delete",
      content:
        "Are you sure you want to delete this category? This action cannot be undone.",
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: () => {
        dispatch(removeCategory(id));
        message.success("Category deleted");
      },
    });
  };

  // 倉庫表格列定義
  const repoColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Owner/Repository",
      key: "ownerRepo",
      render: (_: unknown, record: RepositorySource) =>
        `${record.owner}/${record.repo}`,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => {
        const cat = categories.find((c) => c.id === category);
        return cat ? cat.name : "No category";
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Status",
      key: "isActive",
      render: (_: unknown, record: RepositorySource) => (
        <Switch
          checked={record.isActive}
          onChange={() => dispatch(toggleRepositoryActive(record.id))}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: RepositorySource) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => showRepoModal(record)}
              type="text"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => confirmDeleteRepo(record.id)}
              type="text"
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 分類表格列定義
  const categoryColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Sort order",
      dataIndex: "order",
      key: "order",
    },
    {
      title: "Default",
      dataIndex: "isDefault",
      key: "isDefault",
      render: (isDefault: boolean) => (isDefault ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: CategoryType) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => showCategoryModal(record)}
              type="text"
              disabled={record.id === "all"}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => confirmDeleteCategory(record.id)}
              type="text"
              danger
              disabled={record.id === "all"}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: "0 24px", minHeight: 280 }}>
      <Card variant="borderless" style={{ marginTop: 24, marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/")}
          style={{ marginBottom: 16 }}
        >
          Back to home
        </Button>
        <Title level={2}>Content Source Management</Title>
        <Text type="secondary">
          Manage which GitHub repositories Grapevine gets content from and
          organize them into different categories.
        </Text>

        <Divider orientation="left">GitHub repositories</Divider>
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showRepoModal()}
          >
            Add repository
          </Button>
        </div>
        <Table columns={repoColumns} dataSource={repositories} rowKey="id" />

        <Divider orientation="left">Content Categories</Divider>
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showCategoryModal()}
          >
            Add category
          </Button>
        </div>
        <Table columns={categoryColumns} dataSource={categories} rowKey="id" />
      </Card>

      {/* 添加/編輯倉庫模態框 */}
      <Modal
        title={editingRepo ? "Edit repository" : "Add new repository"}
        open={isRepoModalVisible}
        onCancel={() => {
          setIsRepoModalVisible(false);
          resetRepoForm();
        }}
        footer={null}
      >
        <Form
          form={repoForm}
          layout="vertical"
          onFinish={handleRepoSubmit}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="id"
            label="Identifier"
            rules={[
              { required: true, message: "Please enter a unique identifier" },
            ]}
            tooltip={{
              title:
                "A short code to uniquely identify this repository, e.g. 'grapevine'",
              icon: <QuestionCircleOutlined />,
            }}
          >
            <Input placeholder="Enter a unique identifier" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Display name"
            rules={[
              { required: true, message: "Please enter the repository name" },
            ]}
          >
            <Input placeholder="Enter the repository name" />
          </Form.Item>

          <Form.Item
            name="owner"
            label="GitHub username"
            rules={[
              { required: true, message: "Please enter the GitHub username" },
            ]}
          >
            <Input prefix={<GithubOutlined />} placeholder="e.g. octocat" />
          </Form.Item>

          <Form.Item
            name="repo"
            label="GitHub repository name"
            rules={[
              {
                required: true,
                message: "Please enter the GitHub repository name",
              },
            ]}
          >
            <Input placeholder="e.g. hello-world" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="A short description of the repository" />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Select placeholder="Select a category">
              <Option value="">No category</Option>
              {categories
                .filter((cat) => cat.id !== "all")
                .map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Enable" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRepo ? "Update" : "Add"}
              </Button>
              <Button
                onClick={() => {
                  setIsRepoModalVisible(false);
                  resetRepoForm();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加/編輯分類模態框 */}
      <Modal
        title={editingCategory ? "Edit category" : "Add new category"}
        open={isCategoryModalVisible}
        onCancel={() => {
          setIsCategoryModalVisible(false);
          resetCategoryForm();
        }}
        footer={null}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCategorySubmit}
        >
          <Form.Item
            name="id"
            label="Identifier"
            rules={[
              { required: true, message: "Please enter a unique identifier" },
            ]}
            tooltip={{
              title:
                "A short code to uniquely identify this category, e.g. 'news'",
              icon: <QuestionCircleOutlined />,
            }}
          >
            <Input placeholder="Enter a unique identifier" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Display name"
            rules={[
              { required: true, message: "Please enter the category name" },
            ]}
          >
            <Input placeholder="Enter the category name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="A short description of the category" />
          </Form.Item>

          <Form.Item
            name="order"
            label="Sort order"
            tooltip={{
              title: "Smaller numbers will be displayed first",
              icon: <QuestionCircleOutlined />,
            }}
          >
            <Input type="number" placeholder="Sort order (number)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Update" : "Add"}
              </Button>
              <Button
                onClick={() => {
                  setIsCategoryModalVisible(false);
                  resetCategoryForm();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default RepositoryManagementPage;
