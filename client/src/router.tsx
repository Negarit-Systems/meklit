import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "./components/public-layout/PublicLayout";
import PublicNotFound from "./components/navigation/PublicNotFound";


export const router = createBrowserRouter([
{
    path: "",
    element: <PublicLayout />,
    children: [
    { path: "*", element: <PublicNotFound /> },
   ],
 },
]);

