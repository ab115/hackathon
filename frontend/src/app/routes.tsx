import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { lazy, Suspense } from "react";
import { useAuth } from "../context/AuthContext";

// ──────────────────────────────────────────────
// Lazy page imports
// ──────────────────────────────────────────────

const AdminLayout      = lazy(() => import("./components/layouts/AdminLayout").then(m => ({ default: m.AdminLayout })));
const StudentLayout    = lazy(() => import("./components/layouts/StudentLayout").then(m => ({ default: m.StudentLayout })));
const LandingPage      = lazy(() => import("./components/pages/LandingPage").then(m => ({ default: m.LandingPage })));
const AdminDashboard   = lazy(() => import("./components/pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const CreateHackathon  = lazy(() => import("./components/pages/admin/CreateHackathon").then(m => ({ default: m.CreateHackathon })));
const EditHackathon    = lazy(() => import("./components/pages/admin/EditHackathon").then(m => ({ default: m.EditHackathon })));
const ManageHackathons = lazy(() => import("./components/pages/admin/ManageHackathons").then(m => ({ default: m.ManageHackathons })));
const ManageResources  = lazy(() => import("./components/pages/admin/ManageResources").then(m => ({ default: m.ManageResources })));
const ManageMentors    = lazy(() => import("./components/pages/admin/ManageMentors").then(m => ({ default: m.ManageMentors })));
const AdminLeaderboard = lazy(() => import("./components/pages/admin/AdminLeaderboard").then(m => ({ default: m.AdminLeaderboard })));
const JudgingPortal    = lazy(() => import("./components/pages/admin/JudgingPortal").then(m => ({ default: m.JudgingPortal })));
const ManageUsers      = lazy(() => import("./components/pages/admin/ManageUsers").then(m => ({ default: m.ManageUsers })));
const StudentDashboard = lazy(() => import("./components/pages/student/StudentDashboard").then(m => ({ default: m.StudentDashboard })));
const BrowseHackathons = lazy(() => import("./components/pages/student/BrowseHackathons").then(m => ({ default: m.BrowseHackathons })));
const StudentProfile   = lazy(() => import("./components/pages/student/StudentProfile").then(m => ({ default: m.StudentProfile })));
const TeamFormation    = lazy(() => import("./components/pages/student/TeamFormation").then(m => ({ default: m.TeamFormation })));
const Submissions      = lazy(() => import("./components/pages/student/Submissions").then(m => ({ default: m.Submissions })));
const PublicLeaderboard = lazy(() => import("./components/pages/student/PublicLeaderboard").then(m => ({ default: m.PublicLeaderboard })));
const Mentorship       = lazy(() => import("./components/pages/student/Mentorship").then(m => ({ default: m.Mentorship })));
const Resources        = lazy(() => import("./components/pages/student/Resources").then(m => ({ default: m.Resources })));
const LoginPage        = lazy(() => import("./components/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage     = lazy(() => import("./components/pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const PayUSimulator    = lazy(() => import("./components/pages/PayUSimulator").then(m => ({ default: m.PayUSimulator })));
const PaymentSuccess   = lazy(() => import("./components/pages/PaymentSuccess").then(m => ({ default: m.PaymentSuccess })));
const PaymentFailure   = lazy(() => import("./components/pages/PaymentFailure").then(m => ({ default: m.PaymentFailure })));

// ──────────────────────────────────────────────
// Loading Spinner
// ──────────────────────────────────────────────

const FallbackLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-500 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
    </div>
  </div>
);

const wrap = (C: React.ComponentType) => (
  <Suspense fallback={<FallbackLoader />}><C /></Suspense>
);

// ──────────────────────────────────────────────
// Protected Route Guards
// ──────────────────────────────────────────────

function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles?: ('STUDENT' | 'ADMIN' | 'JUDGE' | 'MENTOR')[];
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <FallbackLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const userRole = user.role.toUpperCase();
    const isAllowed = allowedRoles.some(role => role.toUpperCase() === userRole);
    
    if (!isAllowed) {
      // Wrong role — send to correct portal
      return <Navigate to={userRole === 'STUDENT' ? '/student' : '/admin'} replace />;
    }
  }

  return <Outlet />;
}

// ──────────────────────────────────────────────
// Router definition
// ──────────────────────────────────────────────

export const router = createBrowserRouter([
  // Public routes
  { path: "/",        element: wrap(LandingPage) },
  { path: "/login",    element: wrap(LoginPage) },
  { path: "/register", element: wrap(RegisterPage) },

  // Payment simulator (must be authenticated)
  { path: "/payu-simulator",  element: wrap(PayUSimulator) },
  { path: "/payment/success", element: wrap(PaymentSuccess) },
  { path: "/payment/failure", element: wrap(PaymentFailure) },

  // Admin portal — ADMIN and JUDGE only
  {
    path: "/admin",
    element: (
      <Suspense fallback={<FallbackLoader />}>
        <ProtectedRoute allowedRoles={['ADMIN', 'JUDGE']} />
      </Suspense>
    ),
    children: [
      {
        element: <Suspense fallback={<FallbackLoader />}><AdminLayout /></Suspense>,
        children: [
          { index: true,           element: wrap(AdminDashboard) },
          { path: "create",        element: wrap(CreateHackathon) },
          { path: "edit/:id",      element: wrap(EditHackathon) },
          { path: "manage",        element: wrap(ManageHackathons) },
          { path: "resources",     element: wrap(ManageResources) },
          { path: "mentors",       element: wrap(ManageMentors) },
          { path: "leaderboard",   element: wrap(AdminLeaderboard) },
          { path: "judging",       element: wrap(JudgingPortal) },
          { path: "users",         element: wrap(ManageUsers) },
        ],
      },
    ],
  },

  // Student portal — STUDENT only
  {
    path: "/student",
    element: (
      <Suspense fallback={<FallbackLoader />}>
        <ProtectedRoute allowedRoles={['STUDENT']} />
      </Suspense>
    ),
    children: [
      {
        element: <Suspense fallback={<FallbackLoader />}><StudentLayout /></Suspense>,
        children: [
          { index: true,             element: wrap(StudentDashboard) },
          { path: "hackathons",      element: wrap(BrowseHackathons) },
          { path: "profile",         element: wrap(StudentProfile) },
          { path: "teams",           element: wrap(TeamFormation) },
          { path: "submissions",     element: wrap(Submissions) },
          { path: "leaderboard",     element: wrap(PublicLeaderboard) },
          { path: "mentorship",      element: wrap(Mentorship) },
          { path: "resources",       element: wrap(Resources) },
        ],
      },
    ],
  },

  // 404 fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);
