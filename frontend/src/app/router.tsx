import { createBrowserRouter } from "react-router-dom";

/* Layouts */
import AppLayout from "@/layouts/AppLayout";
import LearnerLayout from "@/layouts/LearnerLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ModeratorLayout from "@/layouts/ModeratorLayout";

/* Public */
import Home from "@/pages/learner/Home";
import LogIn from "@/pages/learner/LogIn";
import SignUp from "@/pages/learner/SignUp";
import Verify from "@/pages/learner/Verify";

/* Learner */
import Dashboard from "@/pages/learner/Dashboard";
import Learn from "@/pages/learner/dashboard/Learn";
import LessonOverview from "@/pages/learner/dashboard/LessonOverview";
import Lesson from "@/pages/learner/dashboard/Lesson";
import Practice from "@/pages/learner/dashboard/practice/Practice";
import Chat from "@/pages/learner/dashboard/practice/Chat";
import Flashcard from "@/pages/learner/dashboard/practice/Flashcard";
import Pronunciation from "@/pages/learner/dashboard/practice/Pronunciation";
import Vocabulary from "@/pages/learner/dashboard/vocabulary/Vocab";
import Community from "@/pages/learner/dashboard/Community";
import Leaderboard from "@/pages/learner/dashboard/Leaderboard";
import Profile from "@/pages/learner/dashboard/Profile";
import Settings from "@/pages/learner/dashboard/Settings";
import ActionHandler from "@/pages/learner/forgot-password/ActionHandler";
import ForgotPasswordPage from "@/pages/learner/forgot-password/ForgotPassword";
import ResetPasswordPage from "@/pages/learner/forgot-password/Reset";

/* Admin */
import AdminLogIn from "@/pages/admin/AdminLogIn";
import AdminDashboard from "@/pages/admin/Dashboard";

/* Moderator */
import ModeratorDashboard from "@/pages/moderator/Dashboard";
import ModeratorLogIn from "@/pages/moderator/ModeratorLogIn";
import TopicLessons from "@/pages/moderator/dashboard/topic-lessons";
import LessonSections from "@/pages/moderator/dashboard/lesson-sections";
import SectionQuestions from "@/pages/moderator/dashboard/section-questions";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      /* ========== PUBLIC ========== */
      { path: "/", element: <Home /> },
      { path: "/login", element: <LogIn /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/verify", element: <Verify /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/forgot-password/reset", element: <ResetPasswordPage /> },
      { path: "/auth/action", element: <ActionHandler /> },
      { path: "/admin/login", element: <AdminLogIn /> },
      { path: "/moderator/login", element: <ModeratorLogIn /> },

      /* ========== LEARNER ========== */
      {
        path: "/dashboard",
        element: <LearnerLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "learn", element: <Learn /> },
          { path: "topics/:topicId/lessons/:lessonId", element: <LessonOverview /> },
          { path: "lessons/:lessonId/sections/:sectionId", element: <Lesson /> },
          {
            path: "practice",
            children: [
              { index: true, element: <Practice /> },
              { path: "chat", element: <Chat /> },
              { path: "flashcard", element: <Flashcard /> },
              { path: "pronunciation", element: <Pronunciation /> },
            ],
          },
          { path: "vocabulary", element: <Vocabulary /> },
          { path: "community", element: <Community /> },
          { path: "leaderboard", element: <Leaderboard /> },
          { path: "profile", element: <Profile /> },
          { path: "settings", element: <Settings /> },
        ],
      },

      /* ========== ADMIN ========== */
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [{ index: true, element: <AdminDashboard /> }],
      },

      /* ========== MODERATOR ========== */
      {
        path: "/moderator",
        element: <ModeratorLayout />,
        children: [
          { index: true, element: <ModeratorDashboard /> },
          { path: "topics/:topicId/lessons", element: <TopicLessons /> },
          { path: "lessons/:lessonId/sections", element: <LessonSections /> },
          { path: "sections/:sectionId/questions", element: <SectionQuestions /> },
        ],
      },
    ],
  },
]);
