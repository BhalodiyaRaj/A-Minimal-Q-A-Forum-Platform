import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Trophy, 
  Calendar, 
  User, 
  Shield,
  TrendingUp,
  Filter,
  SortAsc,
  SortDesc,
  Eye
} from 'lucide-react';
import { getUsers, getLeaderboard, searchUsers } from '../api/apiService';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  // Remove all reputation-related state, functions, and UI
  // Remove sortBy, filterBy, getReputationColor, getReputationBadge, and all reputation display
  // Remove leaderboard by reputation
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    loadUsers();
    loadLeaderboard();
  }, [activeTab, pagination.page]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        // Remove sortBy, filterBy, getReputationColor, getReputationBadge, and all reputation display
        // Remove leaderboard by reputation
        ...(searchQuery && { q: searchQuery })
      };

      const response = await getUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await getLeaderboard({ limit: 10 });
      setLeaderboard(response.data.users);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await searchUsers(searchQuery, {
        page: pagination.page,
        limit: pagination.limit
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove handleSortChange, handleFilterChange, and all reputation-related UI
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
              <p className="text-gray-600">Discover and connect with the StackIt community</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Remove all reputation-related UI */}
            {/* <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="reputation">Highest Reputation</option>
                <option value="username">Name A-Z</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="lastSeen">Recently Active</option>
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Users</option>
                <option value="100">100+ Reputation</option>
                <option value="500">500+ Reputation</option>
                <option value="1000">1000+ Reputation</option>
              </select>
            </div> */}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UsersIcon size={16} />
              All Users
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'leaderboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trophy size={16} />
              Leaderboard
            </button>
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

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {activeTab === 'all' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {searchQuery ? `Search results for "${searchQuery}"` : 'All Users'}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{pagination.total} users</span>
                    <span>•</span>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading users...</span>
                  </div>
                ) : users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((userItem) => (
                      <div 
                        key={userItem._id} 
                        className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => handleUserClick(userItem._id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
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
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{userItem.username}</h3>
                                {userItem.isVerified && (
                                  <Shield size={14} className="text-blue-600" />
                                )}
                              </div>
                              {/* Remove all reputation-related UI */}
                              {/* <p className={`text-sm font-medium ${getReputationColor(userItem.reputation)}`}>
                                {userItem.reputation} reputation
                              </p> */}
                            </div>
                          </div>
                          <Eye size={16} className="text-gray-400" />
                        </div>
                        
                        {userItem.bio && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{userItem.bio}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Joined {new Date(userItem.createdAt).toLocaleDateString()}</span>
                          {/* Remove all reputation-related UI */}
                          {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReputationColor(userItem.reputation)} bg-opacity-10`}>
                            {getReputationBadge(userItem.reputation)}
                          </span> */}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No users found matching your search.' : 'No users available.'}
                    </p>
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
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Top Users by Reputation</h2>
                
                <div className="space-y-4">
                  {leaderboard.map((userItem, index) => (
                    <div 
                      key={userItem._id} 
                      className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => handleUserClick(userItem._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
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
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{userItem.username}</h3>
                                {userItem.isVerified && (
                                  <Shield size={14} className="text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {userItem.badges?.length || 0} badges
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {/* Remove all reputation-related UI */}
                            {/* <p className={`text-xl font-bold ${getReputationColor(userItem.reputation)}`}>
                              {userItem.reputation}
                            </p> */}
                            <p className="text-sm text-gray-500">reputation</p>
                          </div>
                          <Eye size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users; 