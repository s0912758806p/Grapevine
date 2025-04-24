import React from "react";
import { ConfigProvider, theme } from "antd";

interface AntConfigProviderProps {
  children: React.ReactNode;
}

// This component centralizes all Ant Design configuration for better React 18 compatibility
const AntConfigProvider: React.FC<AntConfigProviderProps> = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF4500", // Reddit orange
          colorLink: "#0079D3", // Reddit blue
          borderRadius: 4,
        },
        algorithm: theme.defaultAlgorithm,
        hashed: true, // Enables compatibility mode for newer React versions
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default AntConfigProvider;
