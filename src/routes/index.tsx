import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import IssueDetail from "../components/IssueDetail";
import IssueList from "../components/IssueList";
import NewIssue from "../components/NewIssue";
import GiscusExample from "../pages/GiscusExample";
import AuthCallback from "../components/AuthCallback";

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
        element: <GiscusExample />,
      },
      {
        path: "auth/callback",
        element: <AuthCallback />,
      },
    ],
  },
]);

export default router;
