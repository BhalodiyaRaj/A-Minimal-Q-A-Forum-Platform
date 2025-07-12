import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ThumbsUp, Clock, User, Loader2, AlertCircle, Eye } from "lucide-react";
import { getQuestions, getUnansweredQuestions, getFeaturedQuestions } from "../api/apiService";

const QuestionList = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all"); // all, unanswered, featured
  const [sortBy, setSortBy] = useState("activity"); // newest, oldest, votes, views, activity

  const fetchQuestions = async (page = 1, filterType = filter, sortType = sortBy) => {
    try {
      setLoading(true);
      setError("");
      
      let response;
      const params = {
        page,
        limit: 10,
        sort: sortType
      };

      switch (filterType) {
        case "unanswered":
          response = await getUnansweredQuestions(params);
          break;
        case "featured":
          response = await getFeaturedQuestions(params);
          break;
        default:
          response = await getQuestions(params);
          break;
      }

      if (response.status === "success") {
        setQuestions(response.data.questions);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(page);
      } else {
        setError("Failed to fetch questions");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err?.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchQuestions(1, newFilter, sortBy);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    fetchQuestions(1, filter, newSort);
  };

  const handlePageChange = (page) => {
    fetchQuestions(page, filter, sortBy);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Questions</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchQuestions()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Modern Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
          Discover Questions
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find answers to your programming questions from our community of developers
        </p>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <div className="flex items-center bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl px-4 py-3 shadow-xl">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              filter === "all"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => handleFilterChange("unanswered")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              filter === "unanswered"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
            }`}
          >
            Unanswered
          </button>
          <button
            onClick={() => handleFilterChange("featured")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              filter === "featured"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
            }`}
          >
            Featured
          </button>
        </div>

        <div className="flex items-center bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl px-4 py-3 shadow-xl">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-transparent outline-none text-gray-700 font-medium px-4 py-2 cursor-pointer"
          >
            <option value="activity">Most Active</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="votes">Most Voted</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid gap-8">
        {questions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Found</h3>
            <p className="text-gray-600">Be the first to ask a question!</p>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q._id}
              className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:border-blue-200"
              onClick={() => navigate(`/question/${q._id}`)}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 transition-all duration-500 rounded-3xl"></div>
              
              <div className="relative z-10">
                {/* Tags */}
                <div className="flex items-center gap-3 mb-6">
                  {q.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Title */}
                <h2 className="font-bold text-2xl mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2">
                  {q.title}
                </h2>
                
                {/* Description */}
                <div
                  className="text-lg text-gray-600 mb-6 line-clamp-2 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: q.content }}
                />
                
                {/* Stats and User */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={16} />
                      <span className="font-medium">{q.answerCount || 0} answers</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <ThumbsUp size={18} />
                      <span className="font-medium">{q.voteCount || 0} votes</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={18} />
                      <span className="font-medium">{formatTimeAgo(q.createdAt)}</span>
                    </div>
                    {q.views && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Eye size={16} />
                        <span className="font-medium">{q.views} views</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {q.author?.username?.[0] || "U"}
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-700 font-medium">{q.author?.username || "Anonymous"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-16 gap-3">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-12 h-12 rounded-xl transition-all duration-300 border font-semibold shadow-lg hover:shadow-xl hover:scale-105 ${
                page === currentPage
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600"
                  : "bg-white/80 backdrop-blur-xl text-gray-700 border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionList;
