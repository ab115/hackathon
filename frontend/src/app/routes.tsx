import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

const AdminLayout = lazy(() => import("./components/layouts/AdminLayout").then(m => ({ default: m.AdminLayout })));
const StudentLayout = lazy(() => import("./components/layouts/StudentLayout").then(m => ({ default: m.StudentLayout })));
const LandingPage = lazy(() => import("./components/pages/LandingPage").then(m => ({ default: m.LandingPage })));
const AdminDashboard = lazy(() => import("./components/pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const CreateHackathon = lazy(() => import("./components/pages/admin/CreateHackathon").then(m => ({ default: m.CreateHackathon })));
const ManageHackathons = lazy(() => import("./components/pages/admin/ManageHackathons").then(m => ({ default: m.ManageHackathons })));
const AdminLeaderboard = lazy(() => import("./components/pages/admin/AdminLeaderboard").then(m => ({ default: m.AdminLeaderboard })));
const JudgingPortal = lazy(() => import("./components/pages/admin/JudgingPortal").then(m => ({ default: m.JudgingPortal })));
const StudentDashboard = lazy(() => import("./components/pages/student/StudentDashboard").then(m => ({ default: m.StudentDashboard })));
const BrowseHackathons = lazy(() => import("./components/pages/student/BrowseHackathons").then(m => ({ default: m.BrowseHackathons })));
const StudentProfile = lazy(() => import("./components/pages/student/StudentProfile").then(m => ({ default: m.StudentProfile })));
const TeamFormation = lazy(() => import("./components/pages/student/TeamFormation").then(m => ({ default: m.TeamFormation })));
const Submissions = lazy(() => import("./components/pages/student/Submissions").then(m => ({ default: m.Submissions })));
const PublicLeaderboard = lazy(() => import("./components/pages/student/PublicLeaderboard").then(m => ({ default: m.PublicLeaderboard })));
const Mentorship = lazy(() => import("./components/pages/student/Mentorship").then(m => ({ default: m.Mentorship })));
const Resources = lazy(() => import("./components/pages/student/Resources").then(m => ({ default: m.Resources })));

const FallbackLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Suspense fallback={<FallbackLoader />}><LandingPage /></Suspense>,
  },
  {
    path: "/admin",
    element: <Suspense fallback={<FallbackLoader />}><AdminLayout /></Suspense>,
    children: [
      { index: true, element: <Suspense fallback={<FallbackLoader />}><AdminDashboard /></Suspense> },
      { path: "create", element: <Suspense fallback={<FallbackLoader />}><CreateHackathon /></Suspense> },
      { path: "manage", element: <Suspense fallback={<FallbackLoader />}><ManageHackathons /></Suspense> },
      { path: "leaderboard", element: <Suspense fallback={<FallbackLoader />}><AdminLeaderboard /></Suspense> },
      { path: "judging", element: <Suspense fallback={<FallbackLoader />}><JudgingPortal /></Suspense> },
    ],
  },
  {
    path: "/student",
    element: <Suspense fallback={<FallbackLoader />}><StudentLayout /></Suspense>,
    children: [
      { index: true, element: <Suspense fallback={<FallbackLoader />}><StudentDashboard /></Suspense> },
      { path: "hackathons", element: <Suspense fallback={<FallbackLoader />}><BrowseHackathons /></Suspense> },
      { path: "profile", element: <Suspense fallback={<FallbackLoader />}><StudentProfile /></Suspense> },
      { path: "teams", element: <Suspense fallback={<FallbackLoader />}><TeamFormation /></Suspense> },
      { path: "submissions", element: <Suspense fallback={<FallbackLoader />}><Submissions /></Suspense> },
      { path: "leaderboard", element: <Suspense fallback={<FallbackLoader />}><PublicLeaderboard /></Suspense> },
      { path: "mentorship", element: <Suspense fallback={<FallbackLoader />}><Mentorship /></Suspense> },
      { path: "resources", element: <Suspense fallback={<FallbackLoader />}><Resources /></Suspense> },
    ],
  },
]);
