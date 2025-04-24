import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import AppLayout from "./components/AppLayout";
import IssueList from "./components/IssueList";
import IssueDetail from "./components/IssueDetail";
import NewIssue from "./components/NewIssue";
import AntConfigProvider from "./components/AntConfigProvider";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <AntConfigProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<IssueList />} />
              <Route path="/issue/:issueNumber" element={<IssueDetail />} />
              <Route path="/new-issue" element={<NewIssue />} />
            </Routes>
          </AppLayout>
        </Router>
      </AntConfigProvider>
    </Provider>
  );
}

export default App;
