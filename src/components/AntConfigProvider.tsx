import React from "react";
import { ConfigProvider, theme } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";

// Define grape and vine theme colors
const grapeTheme = {
  primaryColor: "#5e2a69",
  primaryColorHover: "#8a4a95",
  infoColor: "#1e5631",
  successColor: "#3d7a4f",
};

interface AntConfigProviderProps {
  children: React.ReactNode;
}

const AntConfigProvider: React.FC<AntConfigProviderProps> = ({ children }) => {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: grapeTheme.primaryColor,
            colorLink: grapeTheme.primaryColor,
            colorInfo: grapeTheme.infoColor,
            colorSuccess: grapeTheme.successColor,
            borderRadius: 8,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
            colorBgContainer: "#ffffff",
            colorText: "#333333",
            colorTextSecondary: "#666666",
          },
          components: {
            Button: {
              colorPrimary: grapeTheme.primaryColor,
              colorPrimaryHover: grapeTheme.primaryColorHover,
              borderRadius: 8,
              controlHeightLG: 44,
            },
            Card: {
              borderRadiusLG: 16,
              boxShadowTertiary: "0 8px 24px rgba(94, 42, 105, 0.1)",
            },
            Menu: {
              itemSelectedBg: "#f5eef7",
              itemSelectedColor: grapeTheme.primaryColor,
              itemHoverColor: grapeTheme.primaryColor,
            },
            Input: {
              borderRadius: 8,
              colorBorder: "#e0e0e0",
            },
            Select: {
              borderRadius: 8,
            },
            Tabs: {
              colorPrimary: grapeTheme.primaryColor,
            },
            Table: {
              borderRadius: 8,
              colorBgContainer: "#ffffff",
            },
          },
          algorithm: theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
};

export default AntConfigProvider;
