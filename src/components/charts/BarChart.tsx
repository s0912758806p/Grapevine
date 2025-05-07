import React from "react";
import { Column } from "@ant-design/plots";
import { Card, Typography } from "antd";

const { Title } = Typography;

interface DataItem {
  category: string;
  value: number;
}

interface BarChartProps {
  data: DataItem[];
  title: string;
  description?: string;
  xField?: string;
  yField?: string;
  color?: string;
  loading?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  description,
  xField = "category",
  yField = "value",
  color = "#1677ff",
  loading = false,
}) => {
  // Ensure there's always data to render
  const safeData =
    data && data.length > 0 ? data : [{ category: "No Data", value: 0 }];

  // Using minimal configuration to avoid compatibility issues with different versions of @ant-design/plots
  const config = {
    data: safeData,
    xField,
    yField,
    color,
    columnWidthRatio: 0.6,
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };

  return (
    <Card loading={loading} variant="borderless" className="analytics-card">
      <Title level={4}>{title}</Title>
      {description && <p>{description}</p>}
      <Column {...config} />
    </Card>
  );
};

export default BarChart;
