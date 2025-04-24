import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import { store } from "./store";
import AppLayout from "./components/AppLayout";
import IssueList from "./components/IssueList";
import IssueDetail from "./components/IssueDetail";
import NewIssue from "./components/NewIssue";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#FF4500", // Reddit orange
            colorLink: "#0079D3", // Reddit blue
            borderRadius: 4,
          },
        }}
      >
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<IssueList />} />
              <Route path="/issue/:issueNumber" element={<IssueDetail />} />
              <Route path="/new-issue" element={<NewIssue />} />
            </Routes>
          </AppLayout>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
