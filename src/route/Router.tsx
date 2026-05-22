import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayOut";
import Home from "@/pages/Home";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
    //   {
    //     path: "*",
    //     element: <NotFound />,
    //   },
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

export default router;
