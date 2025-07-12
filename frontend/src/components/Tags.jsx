import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Search, 
  TrendingUp, 
  Calendar, 
  Hash, 
  Plus,
  Edit3,
  Trash2,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { getTags, getPopularTags, searchTags } from '../api/apiService';
import { useAuth } from '../App';

const Tags = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('usage');
  const [filterBy, setFilterBy] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    loadTags();
    loadPopularTags();
  }, [activeTab, sortBy, filterBy, pagination.page]);

  const loadTags = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
        ...(filterBy !== 'all' && { minUsage: filterBy })
      };

      const response = await getTags(params);
      setTags(response.data.tags);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading tags:', error);
      setError('Failed to load tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPopularTags = async () => {
    try {
      const response = await getPopularTags({ limit: 10 });
      setPopularTags(response.data.tags);
    } catch (error) {
      console.error('Error loading popular tags:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTags();
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await searchTags(searchQuery, {
        page: pagination.page,
        limit: pagination.limit
      });
      setTags(response.data.tags);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error searching tags:', error);
      setError('Failed to search tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilter) => {
    setFilterBy(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getSortIcon = (field) => {
    if (sortBy === field) {
      return sortBy.includes('asc') ? <SortAsc size={16} /> : <SortDesc size={16} />;
    }
    return null;
  };

  const getSortLabel = (field) => {
    switch (field) {
      case 'usage': return 'Most Used';
      case 'name': return 'Name A-Z';
      case 'newest': return 'Newest';
      case 'oldest': return 'Oldest';
      default: return 'Most Used';
    }
  };

  const getFilterLabel = (filter) => {
    switch (filter) {
      case 'all': return 'All Tags';
      case '10': return '10+ Uses';
      case '50': return '50+ Uses';
      case '100': return '100+ Uses';
      default: return 'All Tags';
    }
  };

  if (isLoading && tags.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tags...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tags</h1>
              <p className="text-gray-600">Discover and explore tags to find questions that interest you</p>
            </div>
            {user?.role === 'admin' && (
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg flex items-center gap-2">
                <Plus size={16} />
                Create Tag
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="usage">Most Used</option>
                <option value="name">Name A-Z</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Tags</option>
                <option value="10">10+ Uses</option>
                <option value="50">50+ Uses</option>
                <option value="100">100+ Uses</option>
              </select>
            </div>
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
              <Hash size={16} />
              All Tags
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'popular'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={16} />
              Popular
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
                    {searchQuery ? `Search results for "${searchQuery}"` : 'All Tags'}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{pagination.total} tags</span>
                    <span>•</span>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading tags...</span>
                  </div>
                ) : tags.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tags.map((tag) => (
                      <div key={tag._id} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Tag className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                              <p className="text-sm text-gray-500">{tag.usageCount} questions</p>
                            </div>
                          </div>
                          {user?.role === 'admin' && (
                            <div className="flex gap-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                <Edit3 size={16} />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {tag.description && (
                          <p className="text-gray-600 text-sm mb-4">{tag.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Created {new Date(tag.createdAt).toLocaleDateString()}</span>
                          <span>by {tag.createdBy?.username || 'Unknown'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No tags found matching your search.' : 'No tags available.'}
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
                <h2 className="text-xl font-semibold text-gray-900">Popular Tags</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularTags.map((tag) => (
                    <div key={tag._id} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Tag className="w-5 h-5 text-white" />
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

export default Tags; 