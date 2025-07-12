import React, { useState, useRef, useEffect } from "react";
import { Bell, User, Search, Filter, LogOut, Sparkles, HelpCircle, Tag, Users, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import { useAuth } from "../App";
import { logoutUser, getNotifications } from "../api/apiService";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setIsAuthenticated, setUser, user } = useAuth();

  // Close search input if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }
    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated) {
        try {
          const response = await getNotifications();
          if (response.status === 'success') {
            const unreadCount = response.data.notifications.filter(n => !n.isRead).length;
            setNotificationCount(unreadCount);
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      }
    };

    fetchNotifications();
    
    // Optional: Poll for new notifications periodically
    const interval = setInterval(fetchNotifications, 60000); // every 60 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getNavButtonClass = (isActive) => {
    return `font-medium px-6 py-3 rounded-xl transition-all duration-300 focus:outline-none ${
      isActive
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md'
        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md'
    }`;
  };

  return (
    <>
      <nav className="w-full flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50">
        {/* Left: Logo */}
        <div className="flex items-center min-w-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              StackIt
            </span>
          </div>
        </div>
        
        {/* Center: Navigation */}
        <div className="flex items-center gap-4">
          <button
            className={getNavButtonClass(isActiveRoute("/"))}
            onClick={() => navigate("/")}
          >
            <Home size={16} className="inline mr-2" />
            Home
          </button>
          <button 
            className={getNavButtonClass(isActiveRoute("/questions"))}
            onClick={() => navigate("/questions")}
          >
            <HelpCircle size={16} className="inline mr-2" />
            Questions
          </button>
          <button 
            className={getNavButtonClass(isActiveRoute("/tags"))}
            onClick={() => navigate("/tags")}
          >
            <Tag size={16} className="inline mr-2" />
            Tags
          </button>
          <button 
            className={getNavButtonClass(isActiveRoute("/users"))}
            onClick={() => navigate("/users")}
          >
            <Users size={16} className="inline mr-2" />
            Users
          </button>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Search Icon and Popover */}
          <div className="relative" ref={searchRef}>
            <button
              className={`p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 transition-all duration-300 text-gray-600 hover:text-blue-700 shadow-sm hover:shadow-md`}
              onClick={() => setShowSearch((v) => !v)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            {showSearch && (
              <div className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                <form onSubmit={handleSearch}>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search questions, tags, or users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 transition-all duration-200"
                  />
                </form>
              </div>
            )}
          </div>
          
          {isAuthenticated && (
            <button 
              onClick={() => navigate("/notifications")}
              className="relative p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-gray-600 hover:text-blue-700 shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-200"
            >
              <Bell size={20} />
              {/* Notification badge */}
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 border-2 border-white shadow-lg">
                  {notificationCount}
                </span>
              )}
            </button>
          )}
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.username?.[0] || "U"
                  )}
                </div>
                <span className="text-gray-700 text-sm font-medium">
                  {user?.username || "User"}
                </span>
              </button>
              <button
                onClick={async () => {
                  try {
                    await logoutUser();
                  } catch {
                    // Optionally handle error
                  }
                  localStorage.removeItem("accessToken");
                  setIsAuthenticated(false);
                  setUser(null);
                }}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium transition-all duration-300 hover:from-red-600 hover:to-pink-600 hover:shadow-xl focus:outline-none flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg font-medium transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl focus:outline-none"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>

      <Login
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
        }}
      />
      <Register
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={() => {
          setShowRegister(false);
        }}
      />
    </>
  );
};

export default Navbar;
