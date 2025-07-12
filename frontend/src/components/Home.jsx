import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  TrendingUp, 
  Users, 
  Tag, 
  Search,
  Plus,
  ArrowRight,
  MessageSquare,
  Eye,
  ThumbsUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getQuestions, getPopularTags, getLeaderboard, getUsers, getTags, getAnswersCount } from '../api/apiService';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredQuestions, setFeaturedQuestions] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    questions: 0,
    answers: 0,
    users: 0,
    tags: 0
  });

  useEffect(() => {
    loadHomeData();
    loadStats();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);
    try {
      const [questionsRes, tagsRes, usersRes] = await Promise.all([
        getQuestions({ featured: true, limit: 5 }),
        getPopularTags({ limit: 8 }),
        getLeaderboard({ limit: 5 })
      ]);

      setFeaturedQuestions(questionsRes.data.questions || []);
      setPopularTags(tagsRes.data.tags || []);
      setTopUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total questions
      const questionsRes = await getQuestions({ page: 1, limit: 1 });
      const questionsTotal = questionsRes.pagination?.total || questionsRes.data?.pagination?.total || 0;
      
      // Get total users
      const usersRes = await getUsers({ page: 1, limit: 1 });
      const usersTotal = usersRes.pagination?.total || usersRes.data?.pagination?.total || 0;
      
      // Get total tags
      const tagsRes = await getTags({ page: 1, limit: 1 });
      const tagsTotal = tagsRes.pagination?.total || tagsRes.data?.pagination?.total || 0;
      
      // Get total answers using the dedicated endpoint
      let answersTotal = 0;
      try {
        const answersRes = await getAnswersCount();
        answersTotal = answersRes.data?.count || 0;
      } catch (error) {
        console.error('Error fetching answers count:', error);
        answersTotal = 0;
      }
      
      setStats({
        questions: questionsTotal,
        answers: answersTotal,
        users: usersTotal,
        tags: tagsTotal
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({ questions: 0, answers: 0, users: 0, tags: 0 });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">StackIt</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The modern Q&A platform where developers, designers, and tech enthusiasts come together to share knowledge and solve problems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/questions')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg flex items-center gap-2"
            >
              <HelpCircle size={20} />
              Browse Questions
            </button>
            {user && (
              <button
                onClick={() => navigate('/ask')}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Ask Question
              </button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.questions}</h3>
            <p className="text-gray-600">Questions</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.answers}</h3>
            <p className="text-gray-600">Answers</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.users}</h3>
            <p className="text-gray-600">Users</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.tags}</h3>
            <p className="text-gray-600">Tags</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Questions */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Featured Questions</h2>
                <button
                  onClick={() => navigate('/questions')}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All
                  <ArrowRight size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                {featuredQuestions.map((question) => (
                  <div 
                    key={question._id}
                    className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/question/${question._id}`)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {question.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {question.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare size={14} />
                          {question.answersCount || 0} answers
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {question.views || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={14} />
                          {typeof question.votes === 'object' 
                            ? (question.votes.upvotes?.length || 0) - (question.votes.downvotes?.length || 0)
                            : question.votes || 0
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {question.tags?.slice(0, 2).map((tag) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Popular Tags */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Tags</h2>
              <div className="space-y-3">
                {popularTags.map((tag) => (
                  <button
                    key={tag._id}
                    onClick={() => navigate(`/questions?tags=${tag.name}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Tag size={16} className="text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{tag.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{tag.usageCount} questions</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Top Users</h2>
              <div className="space-y-4">
                {topUsers.map((userItem, index) => (
                  <div 
                    key={userItem._id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/profile/${userItem._id}`)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden">
                      {userItem.avatar ? (
                        <img 
                          src={userItem.avatar} 
                          alt={userItem.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{userItem.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 