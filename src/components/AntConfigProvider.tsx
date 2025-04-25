import React from "react";
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";

interface AntConfigProviderProps {
  children: React.ReactNode;
}

const AntConfigProvider: React.FC<AntConfigProviderProps> = ({ children }) => {
  const githubTheme = {
    token: {
      colorPrimary: "#0969da",
      colorSuccess: "#1a7f37",
      colorWarning: "#9a6700",
      colorError: "#cf222e",
      colorText: "#24292f",
      colorTextSecondary: "#57606a",
      colorBgContainer: "#ffffff",
      colorBgElevated: "#ffffff",
      colorBgLayout: "#f6f8fa",
      colorBgSpotlight: "#f6f8fa",
      colorBorder: "#d0d7de",
      borderRadius: 6,
      fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
    },
    components: {
      Button: {
        colorPrimaryHover: "#0860c7",
        borderRadius: 6,
        controlHeight: 32,
        paddingContentHorizontal: 16,
      },
      Input: {
        borderRadius: 6,
        controlHeight: 32,
      },
      Menu: {
        itemSelectedBg: "#f6f8fa",
        itemSelectedColor: "#24292f",
        itemHoverBg: "#f6f8fa",
        itemHoverColor: "#24292f",
        colorActiveBarWidth: 0,
        colorActiveBarHeight: 0,
        borderRadius: 0,
      },
      Select: {
        borderRadius: 6,
        controlHeight: 32,
      },
      Card: {
        colorBorder: "#d0d7de",
        borderRadius: 6,
      },
      Table: {
        borderRadius: 6,
        colorBgContainer: "#ffffff",
        colorBorderSecondary: "#d0d7de",
      },
    },
  };

  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider theme={githubTheme}>{children}</ConfigProvider>
    </StyleProvider>
  );
};

export default AntConfigProvider;
