import React, { createContext, useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import QuestionList from "./components/QuestionList";
import QuestionDetail from "./components/QuestionDetail";
import AskQuestion from "./components/AskQuestion";
import UserProfile from "./components/UserProfile";
import Tags from "./components/Tags";
import Users from "./components/Users";
import Notifications from "./components/Notifications";
import Search from "./components/Search";
import { getCurrentUser } from "./api/apiService";

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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app startup
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          console.log("Found token, verifying authentication...");
          // Verify token is valid by calling the /me endpoint
          const response = await getCurrentUser();
          console.log("Authentication successful:", response.data.user.username);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          console.log("No token found, user not authenticated");
        }
      } catch (error) {
        console.log("Authentication failed:", error.message);
        // Token is invalid or expired, remove it
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Show modern loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to StackIt</h2>
            <p className="text-gray-600 text-sm">Loading your experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
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
            path="/questions"
            element={
              <MainLayout>
                <QuestionList />
              </MainLayout>
            }
          />
          <Route
            path="/tags"
            element={
              <MainLayout>
                <Tags />
              </MainLayout>
            }
          />
          <Route
            path="/users"
            element={
              <MainLayout>
                <Users />
              </MainLayout>
            }
          />
          <Route
            path="/search"
            element={
              <MainLayout>
                <Search />
              </MainLayout>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <MainLayout>
                <UserProfile />
              </MainLayout>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/ask"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AskQuestion />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Notifications />
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
