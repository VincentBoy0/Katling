import { createBrowserRouter } from "react-router-dom";

/* Layouts */
import DashboardLayout from "@/layouts/DashboardLayout";

/* Public pages */
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Verify from "@/pages/Verify";

/* Dashboard pages */
import Community from "@/pages/dashboard/Community";
import Leaderboard from "@/pages/dashboard/Leaderboard";
import Learn from "@/pages/dashboard/Learn";
import Lesson from "@/pages/dashboard/Lesson";
import Profile from "@/pages/dashboard/Profile";
import Settings from "@/pages/dashboard/Settings";
import Practice from "@/pages/dashboard/practice/Practice";
import Vocabulary from "@/pages/dashboard/vocabulary/Vocabulary";

import Chat from "@/pages/dashboard/practice/Chat";
import Flashcard from "@/pages/dashboard/practice/Flashcard";
import Pronunciation from "@/pages/dashboard/practice/Pronunciation";
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
          { path: "practice", element: <Practice />,
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
  }
]);
