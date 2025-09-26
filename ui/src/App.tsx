import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/auth-context";
import { router } from "./router/router";

const App = () => {
  return (
    <AuthProvider>
      <Toaster richColors position="top-center" />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
