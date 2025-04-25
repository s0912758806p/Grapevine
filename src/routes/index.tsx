import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import IssueDetail from "../components/IssueDetail";
import IssueList from "../components/IssueList";
import NewIssue from "../components/NewIssue";
import CommentsExample from "../pages/CommentsExample";
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
    ],
  },
]);
export default router;
