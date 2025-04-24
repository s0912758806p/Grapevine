import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import "./index.scss";
import "./ant-design-fixes.scss";
import { AuthProvider } from "./auth/AuthContext";

// Configure Ant Design's CSS in JS
import { StyleProvider } from "@ant-design/cssinjs";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StyleProvider hashPriority="high">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StyleProvider>
  </React.StrictMode>
);
