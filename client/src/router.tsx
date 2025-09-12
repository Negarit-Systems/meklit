import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicNotFound from "./components/navigation/PublicNotFound";
import { PublicLayout } from "./components/public-layout/PublicLayout";
import { Dashboard } from "./pages/main-dashboard-page/Dashboard";
import Comparision from "./pages/comparision-page/Comparision";
import ChildDetail from "./pages/child-detail-page/ChildDetail";
import ReportsDashboard from "./pages/ReportsDashboard";
import { SignIn } from "./pages/auth-pages/Signin";
import { SignUp } from "./pages/auth-pages/Signup";
import { OtpVerification } from "./pages/auth-pages/OtpVerfication";


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
      path: "",
      element: <PublicLayout/>,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/comparision", element: <Comparision /> },
        { path: "/reports", element: <ReportsDashboard /> },
        { path: "/child-detail/:id", element: <ChildDetail /> },
        { path: "*", element: <PublicNotFound /> },
    ],
  },
]);