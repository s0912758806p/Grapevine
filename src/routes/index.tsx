import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
// LandingPage is statically imported — it's the first page users see
import LandingPage from "../pages/LandingPage";

// All other pages are lazy-loaded to reduce the initial bundle size
const HomePage = lazy(() => import("../components/HomePage"));
const IssueDetail = lazy(() => import("../components/IssueDetail"));
const NewIssue = lazy(() => import("../components/NewIssue"));
const CommentsExample = lazy(() => import("../pages/CommentsExample"));
const F2EIssueDetail = lazy(() => import("../components/F2EIssueDetail"));
const RepositoryIssueDetail = lazy(
  () => import("../components/RepositoryIssueDetail")
);
const RuanyfWeeklyDetail = lazy(
  () => import("../components/RuanyfWeeklyDetail")
);
const RepositoryManagementPage = lazy(
  () => import("../components/RepositoryManagementPage")
);
const LocationPage = lazy(() => import("../pages/LocationPage"));
const AnalyticsDashboard = lazy(() => import("../pages/AnalyticsDashboard"));
const IssueSubmissionPage = lazy(() => import("../pages/IssueSubmissionPage"));
const CommunityPage = lazy(() => import("../pages/CommunityPage"));
const EssayPage = lazy(() => import("../pages/EssayPage"));

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
          path: "ruanyf-weekly/:issueNumber",
          element: <RuanyfWeeklyDetail />,
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
