import React from "react";
import { Row, Col, Typography, Card } from "antd";
import GeoLocation from "../components/GeoLocation";

const { Title } = Typography;

const LocationPage: React.FC = () => {
  return (
    <div className="location-page-container">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ marginBottom: 24 }}>
            <Title level={2}>位置服務</Title>
            <Typography.Paragraph>
              在此頁面您可以獲取當前位置、查看地圖並獲取詳細地址信息。
            </Typography.Paragraph>
          </div>
        </Col>

        <Col xs={24} md={16}>
          <GeoLocation />
        </Col>

        <Col xs={24} md={8}>
          <Card title="位置服務說明" size="small">
            <Typography.Paragraph>
              <strong>如何使用：</strong>
              <ul>
                <li>點擊"獲取當前位置"按鈕來獲取您的地理位置</li>
                <li>您需要允許瀏覽器訪問您的位置</li>
                <li>獲取成功後，您可以查看詳細的位置信息和地圖</li>
              </ul>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>隱私說明：</strong>
              <ul>
                <li>您的位置信息只會存儲在您的瀏覽器中</li>
                <li>我們不會將您的位置信息發送給第三方</li>
                <li>您可以隨時清除您的位置數據</li>
              </ul>
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LocationPage; 