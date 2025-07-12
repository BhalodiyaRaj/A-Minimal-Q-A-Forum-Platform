import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  Filter, 
  HelpCircle, 
  Tag, 
  User, 
  TrendingUp,
  Calendar,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { searchQuestions, searchTags, searchUsers } from '../api/apiService';
import { useAuth } from '../App';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Search = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('questions');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    questions: [],
    tags: [],
    users: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query, activeTab, pagination.page]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      let response;
      switch (activeTab) {
        case 'questions':
          response = await searchQuestions(query, params);
          setResults(prev => ({ ...prev, questions: response.data.questions }));
          setPagination(response.data.pagination);
          break;
        case 'tags':
          response = await searchTags(query, params);
          setResults(prev => ({ ...prev, tags: response.data.tags }));
          setPagination(response.data.pagination);
          break;
        case 'users':
          response = await searchUsers(query, params);
          setResults(prev => ({ ...prev, users: response.data.users }));
          setPagination(response.data.pagination);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleQuestionClick = (questionId) => {
    navigate(`/question/${questionId}`);
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleTagClick = (tagName) => {
    navigate(`/questions?tags=${tagName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
            <p className="text-gray-600">Find questions, tags, and users across the platform</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search questions, tags, or users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={!query.trim()}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'questions', label: 'Questions', icon: HelpCircle },
              { id: 'tags', label: 'Tags', icon: Tag },
              { id: 'users', label: 'Users', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {query.trim() && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Searching...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Search results for "{query}"
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{pagination.total} results</span>
                      <span>•</span>
                      <span>Page {pagination.page} of {pagination.totalPages}</span>
                    </div>
                  </div>

                  {/* Questions Results */}
                  {activeTab === 'questions' && (
                    <div className="space-y-4">
                      {results.questions.length > 0 ? (
                        results.questions.map((question) => (
                          <div 
                            key={question._id} 
                            className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => handleQuestionClick(question._id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {question.title}
                                </h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">
                                  {question.content}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                  <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {question.author?.username || 'Unknown'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(question.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare size={14} />
                                    {question.answersCount || 0} answers
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {question.views || 0} views
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {question.tags?.map((tag) => (
                                    <span 
                                      key={tag}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp size={14} />
                                  {typeof question.votes === 'object' 
                                    ? (question.votes.upvotes?.length || 0) - (question.votes.downvotes?.length || 0)
                                    : question.votes || 0
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No questions found matching your search.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags Results */}
                  {activeTab === 'tags' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.tags.length > 0 ? (
                        results.tags.map((tag) => (
                          <div 
                            key={tag._id} 
                            className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => handleTagClick(tag.name)}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Tag className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                                <p className="text-sm text-gray-500">{tag.usageCount} questions</p>
                              </div>
                            </div>
                            
                            {tag.description && (
                              <p className="text-gray-600 text-sm">{tag.description}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 col-span-full">
                          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No tags found matching your search.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Users Results */}
                  {activeTab === 'users' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.users.length > 0 ? (
                        results.users.map((userItem) => (
                          <div 
                            key={userItem._id} 
                            className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => handleUserClick(userItem._id)}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                                {userItem.avatar ? (
                                  <img 
                                    src={userItem.avatar} 
                                    alt={userItem.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={20} />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{userItem.username}</h3>
                              </div>
                            </div>
                            
                            {userItem.bio && (
                              <p className="text-gray-600 text-sm line-clamp-2">{userItem.bio}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 col-span-full">
                          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No users found matching your search.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={!pagination.hasPrev}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      
                      <span className="px-4 py-2 text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={!pagination.hasNext}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Search Query */}
        {!query.trim() && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
              <p className="text-gray-500">Enter a query above to search for questions, tags, or users.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 