import React, { createContext, useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import MainLayout from "./components/MainLayout";
import QuestionList from "./components/QuestionList";
import QuestionDetail from "./components/QuestionDetail";
import AskQuestion from "./components/AskQuestion";

// Auth Context
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <QuestionList />
              </MainLayout>
            }
          />
          <Route
            path="/question/:id"
            element={
              <MainLayout>
                <QuestionDetail />
              </MainLayout>
            }
          />
          <Route
            path="/ask"
            element={
              <MainLayout>
                <AskQuestion />
              </MainLayout>
            }
          />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center text-2xl text-green-400 mt-20">
                    This is a protected route!
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
