import { RouterProvider } from "react-router-dom";
import root from "./router/roots";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={root} />
  </AuthProvider>
);
}

export default App;
