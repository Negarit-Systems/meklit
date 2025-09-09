import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";
import { ThemeProvider } from "./context/ThemeContext";

const client = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <React.StrictMode>
      <ThemeProvider>
        <React.Suspense fallback="Loading ...">
          <RouterProvider router={router} />
        </React.Suspense>
      </ThemeProvider>
    </React.StrictMode>
  </QueryClientProvider>
);
