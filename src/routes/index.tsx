import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import IssueDetail from "../components/IssueDetail";
import IssueList from "../components/IssueList";
import NewIssue from "../components/NewIssue";
import CommentsExample from "../pages/CommentsExample";
import AuthCallback from "../components/AuthCallback";

// 創建路由
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <IssueList />,
      },
      {
        path: "issue/:issueNumber",
        element: <IssueDetail />,
      },
      {
        path: "new-issue",
        element: <NewIssue />,
      },
      {
        path: "comments",
        element: <CommentsExample />,
      },
      {
        path: "auth/callback",
        element: <AuthCallback />,
      },
    ],
  },
]);

export default router;
