import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import IssueDetail from "../components/IssueDetail";
import HomePage from "../components/HomePage";
import NewIssue from "../components/NewIssue";
import CommentsExample from "../pages/CommentsExample";
import F2EIssueDetail from "../components/F2EIssueDetail";
import RepositoryIssueDetail from "../components/RepositoryIssueDetail";
import RepositoryManagementPage from "../components/RepositoryManagementPage";
import LocationPage from "../pages/LocationPage";
import AnalyticsDashboard from "../pages/AnalyticsDashboard";
import LandingPage from "../pages/LandingPage";
import IssueSubmissionPage from "../pages/IssueSubmissionPage";
import CommunityPage from "../pages/CommunityPage";
import EssayPage from "../pages/EssayPage";

// Create router with all future flags enabled
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "",
          element: <LandingPage />,
        },
        {
          path: "home",
          element: <HomePage />,
        },
        {
          path: "github-issues",
          element: <Navigate to="/essays" replace />,
        },
        {
          path: "created-issues",
          element: <Navigate to="/essays?tab=author-issues" replace />,
        },
        {
          path: "issue-submitted",
          element: <IssueSubmissionPage />,
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
        },
        {
          path: "location",
          element: <LocationPage />,
        },
        {
          path: "analytics",
          element: <AnalyticsDashboard />,
        },
        {
          path: "community",
          element: <CommunityPage />,
        },
        {
          path: "essays",
          element: <EssayPage />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

export default router;
