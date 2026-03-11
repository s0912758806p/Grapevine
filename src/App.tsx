import { Suspense } from "react";
import { Provider } from "react-redux";
import { Outlet } from "react-router-dom";
import { Spin } from "antd";
import { store } from "./store";
import AppLayout from "./components/AppLayout";
import AntConfigProvider from "./components/AntConfigProvider";
// App.scss is now imported via main.scss

const PageFallback = () => (
  <div style={{ textAlign: "center", padding: "60px 0" }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <AntConfigProvider>
        <AppLayout>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </AppLayout>
      </AntConfigProvider>
    </Provider>
  );
}
export default App;
