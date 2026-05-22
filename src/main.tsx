import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import router from './route/Router';

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Toaster position="bottom-right" />
          <RouterProvider router={router} />
          <App />
      </QueryClientProvider>
  </StrictMode>
);
