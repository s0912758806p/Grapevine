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
  const config = {
    appendPadding: 10,
    data,
    angleField: valueField,
    colorField,
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
    interactions: [
      {
        type: "pie-legend-active",
      },
      {
        type: "element-active",
      },
    ],
  };

  return (
    <Card loading={loading} bordered={false} className="analytics-card">
      <Title level={4}>{title}</Title>
      {description && <p>{description}</p>}
      <Pie {...config} />
    </Card>
  );
};

export default PieChart;
