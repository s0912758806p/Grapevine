import React, { useState } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Select,
  Switch,
  Divider,
} from "antd";
import { EnvironmentOutlined, CodeOutlined } from "@ant-design/icons";
import ModularIssueList from "../components/ModularIssueList";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const JobsPage: React.FC = () => {
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedStack, setSelectedStack] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined
  );

  const techOptions = [
    "React",
    "Vue",
    "TypeScript",
    "Node.js",
    "Go",
    "Python",
    "Rust",
    "Java",
    "Flutter",
    "React Native",
  ];

  const locationOptions = [
    "Remote",
    "Beijing",
    "Shanghai",
    "Shenzhen",
    "Hangzhou",
    "Chengdu",
    "Guangzhou",
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <Title
          level={2}
          style={{ color: "#1a1025", marginBottom: 8, fontWeight: 700 }}
        >
          <CodeOutlined style={{ color: "#5e2a69", marginRight: 10 }} />
          Job Board
        </Title>
        <Paragraph style={{ color: "#5c5570", fontSize: 16, margin: 0 }}>
          Frontend engineering opportunities sourced from the community.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* Filter Sidebar */}
        <Col xs={24} lg={6}>
          <Card
            bordered
            style={{
              borderColor: "#e8e3ed",
              borderRadius: 12,
              position: "sticky",
              top: 80,
            }}
          >
            <Title level={5} style={{ color: "#1a1025", marginBottom: 20 }}>
              Filters
            </Title>

            <div style={{ marginBottom: 20 }}>
              <Text
                strong
                style={{
                  color: "#5c5570",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Remote
              </Text>
              <Space>
                <Switch
                  checked={remoteOnly}
                  onChange={setRemoteOnly}
                  style={{
                    backgroundColor: remoteOnly ? "#5e2a69" : undefined,
                  }}
                />
                <Text style={{ color: "#1a1025" }}>Remote only</Text>
              </Space>
            </div>

            <Divider style={{ borderColor: "#f0ecf5", margin: "16px 0" }} />

            <div style={{ marginBottom: 20 }}>
              <Text
                strong
                style={{
                  color: "#5c5570",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Location
              </Text>
              <Select
                style={{ width: "100%" }}
                placeholder="Any location"
                allowClear
                value={selectedLocation}
                onChange={setSelectedLocation}
              >
                {locationOptions.map((loc) => (
                  <Option key={loc} value={loc}>
                    {loc}
                  </Option>
                ))}
              </Select>
            </div>

            <Divider style={{ borderColor: "#f0ecf5", margin: "16px 0" }} />

            <div style={{ marginBottom: 20 }}>
              <Text
                strong
                style={{
                  color: "#5c5570",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Tech Stack
              </Text>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Any stack"
                value={selectedStack}
                onChange={setSelectedStack}
                maxTagCount={3}
              >
                {techOptions.map((tech) => (
                  <Option key={tech} value={tech}>
                    {tech}
                  </Option>
                ))}
              </Select>
            </div>

            {(remoteOnly || selectedLocation || selectedStack.length > 0) && (
              <Button
                type="link"
                style={{ color: "#5e2a69", padding: 0 }}
                onClick={() => {
                  setRemoteOnly(false);
                  setSelectedLocation(undefined);
                  setSelectedStack([]);
                }}
              >
                Clear all filters
              </Button>
            )}
          </Card>
        </Col>

        {/* Job Listings */}
        <Col xs={24} lg={18}>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#5c5570" }}>
              Showing frontend engineering jobs
            </Text>
            <Space>
              {remoteOnly && (
                <Tag
                  color="purple"
                  closable
                  onClose={() => setRemoteOnly(false)}
                >
                  Remote only
                </Tag>
              )}
              {selectedLocation && (
                <Tag
                  closable
                  onClose={() => setSelectedLocation(undefined)}
                  style={{
                    borderColor: "#d4aede",
                    color: "#5e2a69",
                    background: "#f5eef7",
                  }}
                >
                  <EnvironmentOutlined /> {selectedLocation}
                </Tag>
              )}
              {selectedStack.map((tech) => (
                <Tag
                  key={tech}
                  closable
                  onClose={() =>
                    setSelectedStack(selectedStack.filter((t) => t !== tech))
                  }
                  style={{
                    borderColor: "#a3cbb0",
                    color: "#1e5631",
                    background: "#edf5f0",
                  }}
                >
                  {tech}
                </Tag>
              ))}
            </Space>
          </div>

          <ModularIssueList type="f2e-jobs" />
        </Col>
      </Row>
    </div>
  );
};

export default JobsPage;
