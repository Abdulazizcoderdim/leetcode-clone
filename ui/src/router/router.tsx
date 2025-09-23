import LoginPage from "@/components/login";
import SignUpPage from "@/components/sign-up";
import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "../layout/default-layout";
import LandingLayout from "../layout/landing-layout";
import Landing from "../pages/landing/landing";

export const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      {
        path: "/",
        element: <Landing />,
      },
    ],
  },
  {
    element: <DefaultLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignUpPage />,
      },
    ],
  },
]);
