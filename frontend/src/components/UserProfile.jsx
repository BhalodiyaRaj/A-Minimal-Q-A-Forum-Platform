import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { 
  User, 
  Edit3, 
  Camera, 
  Trash2, 
  Save, 
  X, 
  Mail, 
  Calendar, 
  Award, 
  MessageSquare, 
  HelpCircle,
  Settings,
  Bell,
  Shield,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  updateProfile, 
  uploadAvatar, 
  deleteAvatar, 
  updatePreferences,
  getUserQuestions,
  getUserAnswers,
  getQuestion,
  approveAnswer
} from '../api/apiService';

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState([]);
  const [stats, setStats] = useState({
    questions: 0,
    answers: 0,
    badges: []
  });

  // Form state
  const [formData, setFormData] = useState({
    bio: user?.bio || ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications || true,
    pushNotifications: user?.preferences?.pushNotifications || true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || ''
      });
      setPreferences({
        emailNotifications: user.preferences?.emailNotifications || true,
        pushNotifications: user.preferences?.pushNotifications || true
      });
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsDataLoading(true);
    setError(null);
    
    try {
      const questionsRes = await getUserQuestions(user.id);
      const answersRes = await getUserAnswers(user.id);

      if (questionsRes.status === 'success') {
        const questions = questionsRes.data.questions || [];
        setUserQuestions(questions);
        
        // Fetch answers for each question to check for pending approvals
        const questionsWithAnswersData = await Promise.all(
          questions.map(async (q) => {
            const questionDetails = await getQuestion(q._id);
            return {
              ...q,
              answers: questionDetails.data.answers || []
            };
          })
        );
        setQuestionsWithAnswers(questionsWithAnswersData);

        setStats(prev => ({ ...prev, questions: questions.length }));
      } else {
        setError('Failed to load questions.');
      }
      
      if (answersRes.status === 'success') {
        const answers = answersRes.data.answers || [];
        setUserAnswers(answers);
        setStats(prev => ({ ...prev, answers: answers.length }));
      } else {
        setError('Failed to load answers.');
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data. Please try again.');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateProfile(formData);
      setUser(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsLoading(true);
    setError(null);
    try {
      const response = await uploadAvatar(formData);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteAvatar();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setError('Failed to delete avatar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updatePreferences(preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAnswer = async (questionId, answerId) => {
    try {
      const response = await approveAnswer(answerId);
      if (response.status === 'success') {
        // Refresh the question data
        setQuestionsWithAnswers(prev => prev.map(q => 
          q._id === questionId 
            ? { ...q, answers: q.answers.map(a => a._id === answerId ? { ...a, isApproved: true } : a) }
            : q
        ));
      }
    } catch (err) {
      console.error('Failed to approve answer:', err);
      setError(err?.response?.data?.message || 'Failed to approve answer.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                
                {/* Avatar overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-2">
                    <label className="cursor-pointer p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors">
                      <Camera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {user.avatar && (
                      <button
                        onClick={handleDeleteAvatar}
                        className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user.username || 'User'}</h1>
                  {user.isVerified && (
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <Shield size={14} />
                      Verified
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{user.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>

                {user.bio && (
                  <p className="text-gray-700 max-w-2xl">{user.bio}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:bg-gray-200 flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.questions}</p>
                <p className="text-gray-600 text-sm">Questions</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.answers}</p>
                <p className="text-gray-600 text-sm">Answers</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{user.badges?.length || 0}</p>
                <p className="text-gray-600 text-sm">Badges</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{user.badges?.length || 0}</p>
                <p className="text-gray-600 text-sm">Badges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'questions', label: 'Questions', icon: HelpCircle },
              { id: 'answers', label: 'Answers', icon: MessageSquare },
              { id: 'preferences', label: 'Preferences', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {isDataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading data...</span>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          {userQuestions.slice(0, 3).map((question) => (
                            <div key={question._id} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <HelpCircle size={16} className="text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{question.title || 'Untitled Question'}</p>
                                <p className="text-xs text-gray-500">
                                  {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Unknown date'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {user.badges?.map((badge, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Star size={16} className="text-yellow-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{badge}</span>
                            </div>
                          ))}
                          {(!user.badges || user.badges.length === 0) && (
                            <p className="text-gray-500 text-sm col-span-2">No badges yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Questions</h3>
                    {isDataLoading ? (
                      <p>Loading questions...</p>
                    ) : questionsWithAnswers.length > 0 ? (
                      <ul className="space-y-6">
                        {questionsWithAnswers.map((question) => (
                          <li key={question._id} className="bg-white/60 p-6 rounded-2xl shadow-lg border border-gray-100">
                            <a href={`/question/${question._id}`} className="font-bold text-lg text-blue-700 hover:underline">{question.title}</a>
                            <div className="text-sm text-gray-500 mt-2">
                              <span>{question.voteCount} votes</span> &middot; <span>{question.answers.length} answers</span> &middot; <span>{question.views} views</span>
                            </div>

                            {/* Answers List */}
                            <div className="mt-4">
                              {question.answers && question.answers.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-2 border-b pb-2">Answers</h4>
                                  <ul className="space-y-3 mt-3">
                                    {question.answers.map(answer => (
                                      <li 
                                        key={answer._id} 
                                        className={`p-3 rounded-lg flex items-start justify-between gap-4 ${
                                          answer.isApproved ? 'bg-green-50/50' : 'bg-yellow-50/50'
                                        }`}
                                      >
                                        <div className="flex-1">
                                          <div 
                                            className="text-sm text-gray-800 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: answer.content }}
                                          />
                                          <div className="text-xs text-gray-500 mt-1">
                                            by <span className="font-medium">{answer.author.username}</span>
                                          </div>
                                        </div>

                                        <div>
                                          {!answer.isApproved ? (
                                            <button
                                              onClick={() => handleApproveAnswer(question._id, answer._id)}
                                              className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-green-600 transition-colors whitespace-nowrap"
                                            >
                                              Approve
                                            </button>
                                          ) : (
                                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                                              ✓ Approved
                                            </span>
                                          )}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">You haven't asked any questions yet.</p>
                    )}
                  </div>
                )}

                {/* Answers Tab */}
                {activeTab === 'answers' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Answers</h3>
                    {userAnswers.length > 0 ? (
                      <ul className="space-y-4">
                        {userAnswers.map((answer) => (
                          <li key={answer._id} className="bg-white/60 p-4 rounded-xl shadow-md border border-gray-100">
                            <div className="flex justify-between items-center">
                              <a href={`/question/${answer.question._id}`} className="font-semibold text-blue-700 hover:underline">{answer.question.title}</a>
                              {answer.isApproved ? (
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Approved</span>
                              ) : (
                                <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Pending Approval</span>
                              )}
                            </div>
                            <div
                              className="text-gray-700 mt-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: answer.content }}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No answers yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Push Notifications</h4>
                            <p className="text-sm text-gray-500">Receive push notifications</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.pushNotifications}
                            onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleSavePreferences}
                      disabled={isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save size={16} />
                      {isLoading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 