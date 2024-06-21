import { RouterProvider } from "react-router-dom";
import root from "./router/roots";
import './App.css';

function App() {
  return (
    <div className="App">
      <RouterProvider router={root} />
    </div>
);
}

export default App;
