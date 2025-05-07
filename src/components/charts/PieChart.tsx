import React from "react";
import { Pie } from "@ant-design/charts";
import { Card, Typography } from "antd";

const { Title } = Typography;

interface DataItem {
  type: string;
  value: number;
}

interface PieChartProps {
  data: DataItem[];
  title: string;
  description?: string;
  colorField?: string;
  valueField?: string;
  loading?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  description,
  colorField = "type",
  valueField = "value",
  loading = false,
}) => {
  // Ensure there's always data to render
  const safeData =
    data && data.length > 0 ? data : [{ type: "No Data", value: 0 }];

  // Using minimal configuration to avoid compatibility issues with different versions of @ant-design/charts
  const config = {
    appendPadding: 10,
    data: safeData,
    angleField: valueField,
    colorField,
    radius: 0.8,
    legend: {
      position: "bottom",
    },
  };

  return (
    <Card loading={loading} variant="borderless" className="analytics-card">
      <Title level={4}>{title}</Title>
      {description && <p>{description}</p>}
      <Pie {...config} />
    </Card>
  );
};

export default PieChart;
