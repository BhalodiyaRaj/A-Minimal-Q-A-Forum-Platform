import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Sparkles } from "lucide-react";
import { searchQuestions } from "../api/apiService";
import Navbar from "./Navbar";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const response = await searchQuestions(searchQuery, { limit: 5 });
      if (response.status === "success") {
        setSearchResults(response.data.questions || []);
        setShowSearchResults(true);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchResultClick = (questionId) => {
    setShowSearchResults(false);
    setSearchQuery("");
    navigate(`/question/${questionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900">
      <Navbar />
      {/* Modern Controls Bar */}
      <div className="flex items-center justify-center gap-6 mt-12 mb-8 w-full max-w-6xl mx-auto px-6">
        <button
          className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg transform hover:scale-105"
          style={{ fontFamily: "inherit" }}
          onClick={() => navigate("/ask")}
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Ask New Question
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl px-4 py-3 shadow-xl">
          <button 
            className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 hover:shadow-md"
            onClick={() => navigate("/?filter=all")}
          >
            All
          </button>
          <button 
            className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 hover:shadow-md"
            onClick={() => navigate("/?filter=unanswered")}
          >
            Unanswered
          </button>
          <button 
            className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 hover:shadow-md"
            onClick={() => navigate("/?filter=featured")}
          >
            Featured
          </button>
        </div>
        
        <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl px-4 py-3 shadow-xl w-80">
          <form onSubmit={handleSearch} className="flex items-center w-full">
            <input
              className="flex-1 bg-transparent outline-none text-gray-900 px-4 py-3 text-lg placeholder-gray-500"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchResults(false)}
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
              disabled={searchLoading}
            >
              {searchLoading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-5 h-5 text-blue-600" />
              )}
            </button>
          </form>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 z-50">
              <div className="space-y-2">
                {searchResults.map((question) => (
                  <button
                    key={question._id}
                    onClick={() => handleSearchResultClick(question._id)}
                    className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                  >
                    <div className="font-medium text-gray-900 line-clamp-1">{question.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{question.content}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default MainLayout;
