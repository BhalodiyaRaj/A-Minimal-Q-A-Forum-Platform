import React, { useState, useRef, useEffect } from "react";
import { Bell, User, Search, Filter, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import { useAuth } from "../App";
import { logoutUser } from "../api/apiService";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();

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

  return (
    <>
      <nav className="w-full flex items-center justify-between px-10 py-4 bg-gradient-to-r from-[#1e293b]/80 via-[#312e81]/80 to-[#0ea5e9]/80 backdrop-blur-md shadow-xl border-b border-[#334155]/60 sticky top-0 z-50">
        {/* Left: Logo */}
        <div className="flex items-center min-w-0">
          <span className="font-extrabold text-2xl tracking-tight text-white select-none drop-shadow-lg">
            StackIt
          </span>
        </div>
        {/* Center: Home, Questions */}
        <div className="flex items-center gap-4">
          <button
            className="text-gray-200 font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/10 hover:text-cyan-300 hover:scale-105 focus:outline-none"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button className="text-gray-200 font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/10 hover:text-cyan-300 hover:scale-105 focus:outline-none">
            Questions
          </button>
        </div>
        {/* Right: Search Icon, Notification, Profile, Filter Icon, Login */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Search Icon and Popover */}
          <div className="relative" ref={searchRef}>
            <button
              className={`p-2 rounded-full bg-white/10 border border-transparent hover:bg-cyan-600/20 hover:border-cyan-400 transition-all duration-200 text-cyan-200 hover:text-white shadow focus:outline-none hover:scale-110`}
              onClick={() => setShowSearch((v) => !v)}
              aria-label="Search"
            >
              <Search size={22} />
            </button>
            {showSearch && (
              <div className="absolute right-0 mt-2 w-56 bg-[#23232a] border border-[#334155] rounded-xl shadow-lg p-2 z-50 animate-fade-in">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 rounded-lg bg-[#18181b] text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-cyan-100/60 shadow-inner transition-all duration-200"
                />
              </div>
            )}
          </div>
          <button className="relative p-2 rounded-full bg-white/10 hover:bg-cyan-600/20 transition-all duration-200 text-cyan-200 hover:text-white shadow focus:outline-none hover:scale-110">
            <Bell size={22} />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 border-2 border-[#1e293b] shadow">
              3
            </span>
          </button>
          <button className="p-2 rounded-full bg-white/10 border border-transparent hover:bg-indigo-600/20 hover:border-indigo-400 transition-all duration-200 text-cyan-200 hover:text-white shadow focus:outline-none hover:scale-110">
            <User size={22} />
          </button>
          <button className="p-2 rounded-full bg-white/10 border border-transparent hover:bg-cyan-600/20 hover:border-cyan-400 transition-all duration-200 text-cyan-200 hover:text-white shadow focus:outline-none hover:scale-110">
            <Filter size={22} />
          </button>
          {isAuthenticated ? (
            <button
              onClick={async () => {
                try {
                  await logoutUser();
                } catch {
                  // Optionally handle error
                }
                localStorage.removeItem("accessToken");
                setIsAuthenticated(false);
              }}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-xl shadow-lg font-semibold transition-all duration-200 hover:from-red-400 hover:to-pink-600 hover:scale-105 focus:outline-none flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-5 py-2 rounded-xl shadow-lg font-semibold transition-all duration-200 hover:from-cyan-400 hover:to-indigo-600 hover:scale-105 focus:outline-none"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-5 py-2 rounded-xl shadow-lg font-semibold transition-all duration-200 hover:from-green-400 hover:to-blue-600 hover:scale-105 focus:outline-none ml-2"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      <Login
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowLogin(false);
        }}
      />
      <Register
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowRegister(false);
        }}
      />
    </>
  );
};

export default Navbar;
