import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import IssueDetail from "../components/IssueDetail";
import HomePage from "../components/HomePage";
import NewIssue from "../components/NewIssue";
import CommentsExample from "../pages/CommentsExample";
import F2EIssueDetail from "../components/F2EIssueDetail";
import RepositoryIssueDetail from "../components/RepositoryIssueDetail";
import RepositoryManagementPage from "../components/RepositoryManagementPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "issue/:issueNumber",
        element: <IssueDetail />,
      },
      {
        path: "f2e-issue/:issueNumber",
        element: <F2EIssueDetail />,
      },
      {
        path: "repository-issue/:repoId/:issueNumber",
        element: <RepositoryIssueDetail />,
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
        path: "manage-repositories",
        element: <RepositoryManagementPage />,
      }
    ],
  },
]);

export default router;
