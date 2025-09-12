import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";
import { ThemeProvider } from "./context/ThemeContext";
// import { BootstrapAuth } from "./components/auth/BootstrapAuth";
// 
const client = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <React.StrictMode>
      <ThemeProvider>
        {/* <BootstrapAuth> */}
          <React.Suspense fallback="Loading ...">
            <RouterProvider router={router} />
          </React.Suspense>
        {/* </BootstrapAuth> */}
      </ThemeProvider>
    </React.StrictMode>
  </QueryClientProvider>
);
