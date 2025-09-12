import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicNotFound from "./components/navigation/PublicNotFound";
import { PublicLayout } from "./components/public-layout/PublicLayout";
import { Dashboard } from "./pages/main-dashboard-page/Dashboard";
import { Comparision } from "./pages/comparision-page/Comparision";
import { ChildDetail } from "./pages/child-detail-page/ChildDetail";
import { SignIn } from "./pages/auth-pages/Signin";
import { SignUp } from "./pages/auth-pages/Signup";
import { OtpVerification } from "./pages/auth-pages/OtpVerfication";
import { ForgotPassword } from "./pages/auth-pages/ForgetPassword";

export const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/otp-verification",
    element: <OtpVerification />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/comparision", element: <Comparision /> },
      { path: "/child-detail/:id", element: <ChildDetail /> },
      { path: "*", element: <PublicNotFound /> },
    ],
  },
]);