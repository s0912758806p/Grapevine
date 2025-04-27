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
            <Title level={2}>Location Service</Title>
            <Typography.Paragraph>
              On this page, you can get your current location, view the map, and get detailed address information.
            </Typography.Paragraph>
          </div>
        </Col>

        <Col xs={24} md={16}>
          <GeoLocation />
        </Col>

        <Col xs={24} md={8}>
          <Card title="Location Service Description" size="small">
            <Typography.Paragraph>
              <strong>How to use:</strong>
              <ul>
                <li>Click the "Get current location" button to get your geolocation</li>
                <li>You need to allow the browser to access your location</li>
                <li>After successful retrieval, you can view detailed location information and a map</li>
              </ul>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Privacy Statement:</strong>
              <ul>
                <li>Your location information will only be stored in your browser</li>
                <li>We will not send your location information to third parties</li>
                <li>You can clear your location data at any time</li>
              </ul>
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LocationPage; 