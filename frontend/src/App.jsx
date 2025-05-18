import Home from "./components/Home";
import GoogleSignIn from "./components/GoogleSignIn";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="m-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<GoogleSignIn />} />
          <Route path="/register" element={<GoogleSignIn />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:username" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;