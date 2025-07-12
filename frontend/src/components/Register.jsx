import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { registerUser, checkUsername, checkEmail } from "../api/apiService";

const Register = ({ isOpen, onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "heet@gmail.com",
    password: "123456",
    username: "heet",
    confirmPassword: "123456",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { username, email, password } = formData;
      const usernameRes = await checkUsername(username);
      console.log(usernameRes);
      if (!usernameRes.data.available) {
        setError("Username is already taken.");
        return;
      }
      const emailRes = await checkEmail(email);
      if (!emailRes.data.available) {
        setError("Email is already registered.");
        return;
      }
      await registerUser({ username, email, password });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl shadow-2xl border border-[#334155]/50 w-full max-w-sm p-6 relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-gray-300 hover:text-white"
        >
          <span className="sr-only">Close</span>
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white mb-1">Join StackIt</h2>
          <p className="text-gray-400 text-xs">Create your account</p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-8 pr-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-8 pr-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-8 pr-10 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-8 pr-10 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-400 text-xs text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white py-2 rounded-lg font-semibold transition-all duration-200 hover:from-cyan-400 hover:to-indigo-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#1e293b] flex items-center justify-center gap-2 text-sm"
          >
            Create Account
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
