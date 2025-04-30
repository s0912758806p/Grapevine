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
  const config = {
    data,
    xField,
    yField,
    columnWidthRatio: 0.6,
    color,
    label: {
      position: "top",
      style: {
        fill: "black",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      [yField]: {
        alias: title,
      },
    },
  };

  return (
    <Card loading={loading} bordered={false} className="analytics-card">
      <Title level={4}>{title}</Title>
      {description && <p>{description}</p>}
      <Column {...config} />
    </Card>
  );
};

export default BarChart;
