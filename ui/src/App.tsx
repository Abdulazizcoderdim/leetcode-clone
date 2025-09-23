import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from "./router/router";

const App = () => {
  return (
    <>
      <Toaster richColors position="top-center" />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
