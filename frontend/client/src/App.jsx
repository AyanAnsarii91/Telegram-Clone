import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import { isAuthenticated } from "./utils/auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        {/* Register */}
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* Protected Chat */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated() ? "/chat" : "/"}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;