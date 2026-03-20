import React from "react";
import { ConfigProvider, theme } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";

// Flat color palette — no gradients
const grapeTheme = {
  primaryColor: "#5e2a69",
  primaryColorHover: "#8a4a95",
  infoColor: "#1a4a6e",
  successColor: "#1e5631",
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
            colorWarning: "#92600a",
            colorError: "#8b2020",
            borderRadius: 8,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
            colorBgBase: "#faf9f7",
            colorBgContainer: "#ffffff",
            colorText: "#1a1025",
            colorTextSecondary: "#5c5570",
            colorBorder: "#e8e3ed",
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
