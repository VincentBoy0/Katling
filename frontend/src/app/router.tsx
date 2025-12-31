import { createBrowserRouter } from "react-router-dom";

/* Layouts */
import DashboardLayout from "@/layouts/DashboardLayout";

/* Public pages */
import Dashboard from "@/pages/learner/Dashboard";
import Home from "@/pages/learner/Home";
import Onboarding from "@/pages/learner/Onboarding";
import SignIn from "@/pages/learner/SignIn";
import SignUp from "@/pages/learner/SignUp";
import Verify from "@/pages/learner/Verify";

/* Dashboard pages */
import Community from "@/pages/learner/dashboard/Community";
import Leaderboard from "@/pages/learner/dashboard/Leaderboard";
import Learn from "@/pages/learner/dashboard/Learn";
import Lesson from "@/pages/learner/dashboard/Lesson";
import Profile from "@/pages/learner/dashboard/Profile";
import Settings from "@/pages/learner/dashboard/Settings";
import Practice from "@/pages/learner/dashboard/practice/Practice";
import Vocabulary from "@/pages/learner/dashboard/vocabulary/Vocabulary";

import Chat from "@/pages/learner/dashboard/practice/Chat";
import Flashcard from "@/pages/learner/dashboard/practice/Flashcard";
import Pronunciation from "@/pages/learner/dashboard/practice/Pronunciation";
import AppLayout from "@/layouts/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/__test",
    element: <div>ROUTER OK</div>,
  },

  {
    element: <AppLayout />,
    children: [
      /* ========== PUBLIC ROUTES ========== */
      { path: "/", element: <Home /> },
      { path: "/signin", element: <SignIn /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/onboarding", element: <Onboarding /> },
      { path: "/verify", element: <Verify /> },

      /* ========== DASHBOARD ROUTES ========== */
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "learn", element: <Learn /> },
          { path: "lesson", element: <Lesson /> },
          { path: "vocabulary", element: <Vocabulary /> },
          {
            path: "practice",
            children: [
              { index: true, element: <Practice /> },
              { path: "chat", element: <Chat /> },
              { path: "flashcard", element: <Flashcard /> },
              { path: "pronunciation", element: <Pronunciation /> },
            ],
          },
          { path: "community", element: <Community /> },
          { path: "leaderboard", element: <Leaderboard /> },
          { path: "profile", element: <Profile /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
