import React from "react";
import { ConfigProvider, theme, App } from "antd";
interface AntConfigProviderProps {
  children: React.ReactNode;
}
const AntConfigProvider: React.FC<AntConfigProviderProps> = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF4500", 
          colorLink: "#0079D3", 
          borderRadius: 4,
        },
        algorithm: theme.defaultAlgorithm,
        hashed: true, 
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
};
export default AntConfigProvider;
