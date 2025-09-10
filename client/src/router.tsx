import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicNotFound from "./components/navigation/PublicNotFound";
import { PublicLayout } from "./components/public-layout/PublicLayout";
import Dashboard from "./pages/main-dashboard-page/Dashboard";
import Comparision from "./pages/comparision-page/Comparision";
import ChildDetail from "./pages/child-detail-page/ChildDetail";


export const router = createBrowserRouter([
{
    path: "",
    element: <PublicLayout/>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/comparision", element: <Comparision /> },
      { path: "/child-detail/:id", element: <ChildDetail /> },
      { path: "*", element: <PublicNotFound /> },
   ],
 },
]);

