import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Form,
  Input,
  Switch,
  Button,
  Divider,
  message,
} from "antd";
import { SettingOutlined, UserOutlined, BellOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const STORAGE_KEY = "grapevine_settings";

interface UserSettings {
  displayName: string;
  notificationsEnabled: boolean;
  weeklyDigestEnabled: boolean;
}

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return defaultSettings;
}

const defaultSettings: UserSettings = {
  displayName: "",
  notificationsEnabled: true,
  weeklyDigestEnabled: true,
};

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  useEffect(() => {
    form.setFieldsValue(settings);
  }, []);

  const handleSave = (values: UserSettings) => {
    const next = { ...settings, ...values };
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    message.success("Settings saved");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Title level={2} style={{ color: "#1a1025", marginBottom: 8, fontWeight: 700 }}>
        <SettingOutlined style={{ color: "#5e2a69", marginRight: 10 }} />
        Settings
      </Title>
      <Paragraph style={{ color: "#5c5570", marginBottom: 32 }}>
        Preferences are stored locally in your browser.
      </Paragraph>

      <Form form={form} layout="vertical" onFinish={handleSave} initialValues={settings}>
        {/* Profile */}
        <Card
          bordered
          style={{ borderColor: "#e8e3ed", borderRadius: 12, marginBottom: 24 }}
        >
          <Title level={5} style={{ color: "#1a1025", marginBottom: 16 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            Profile
          </Title>
          <Form.Item
            name="displayName"
            label={<Text style={{ color: "#5c5570" }}>Display name</Text>}
          >
            <Input
              placeholder="Your display name"
              style={{ borderColor: "#e8e3ed" }}
            />
          </Form.Item>
        </Card>

        {/* Notifications */}
        <Card
          bordered
          style={{ borderColor: "#e8e3ed", borderRadius: 12, marginBottom: 24 }}
        >
          <Title level={5} style={{ color: "#1a1025", marginBottom: 16 }}>
            <BellOutlined style={{ marginRight: 8 }} />
            Notifications
          </Title>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <Text strong style={{ color: "#1a1025", display: "block" }}>
                Enable notifications
              </Text>
              <Text style={{ color: "#9b92a8", fontSize: 13 }}>
                XP gains and level-up alerts
              </Text>
            </div>
            <Form.Item name="notificationsEnabled" valuePropName="checked" style={{ margin: 0 }}>
              <Switch style={{ backgroundColor: settings.notificationsEnabled ? "#5e2a69" : undefined }} />
            </Form.Item>
          </div>

          <Divider style={{ borderColor: "#f0ecf5", margin: "0 0 16px" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text strong style={{ color: "#1a1025", display: "block" }}>
                Weekly digest
              </Text>
              <Text style={{ color: "#9b92a8", fontSize: 13 }}>
                Receive a weekly summary of community activity
              </Text>
            </div>
            <Form.Item name="weeklyDigestEnabled" valuePropName="checked" style={{ margin: 0 }}>
              <Switch style={{ backgroundColor: settings.weeklyDigestEnabled ? "#5e2a69" : undefined }} />
            </Form.Item>
          </div>
        </Card>

        <Button
          type="primary"
          htmlType="submit"
          style={{ background: "#5e2a69", borderColor: "#5e2a69" }}
        >
          Save settings
        </Button>
      </Form>
    </div>
  );
};

export default SettingsPage;
