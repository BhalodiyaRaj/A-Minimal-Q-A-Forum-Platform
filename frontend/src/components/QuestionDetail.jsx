import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Clock, 
  User, 
  Eye, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Send,
  Sparkles,
  Edit,
  Trash2,
  Flag,
  X
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Emoji from "@tiptap/extension-emoji";
import { 
  getQuestion, 
  voteQuestion, 
  createAnswer, 
  voteAnswer, 
  acceptAnswer,
  deleteQuestion,
  updateQuestion,
  updateAnswer,
  deleteAnswer,
  unacceptAnswer,
  // Add approveAnswer API
  approveAnswer
} from "../api/apiService";
import { useAuth } from "../App";

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl px-6 py-4 flex gap-3 text-gray-600 text-lg mb-0.5 flex-wrap shadow-lg border border-gray-200">
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 font-bold ${
          editor.isActive('bold') 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        B
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 italic ${
          editor.isActive('italic') 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        I
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleUnderline().run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 underline ${
          editor.isActive('underline') 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        U
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleStrike().run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 line-through ${
          editor.isActive('strike') 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        S
      </button>
      <div className="w-px h-8 bg-gray-300 mx-2"></div>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleBulletList().run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 ${
          editor.isActive('bulletList') 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        •
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 ${
          editor.isActive('orderedList') 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        1.
      </button>
      <div className="w-px h-8 bg-gray-300 mx-2"></div>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 font-bold ${
          editor.isActive('heading', { level: 1 }) 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        H1
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 font-bold ${
          editor.isActive('heading', { level: 2 }) 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        H2
      </button>
      <div className="w-px h-8 bg-gray-300 mx-2"></div>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 font-mono ${
          editor.isActive('codeBlock') 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        Code
      </button>
      <button 
        type="button" 
        onClick={() => editor.chain().focus().toggleBlockquote().run()} 
        className={`px-4 py-2 rounded-xl transition-all duration-300 ${
          editor.isActive('blockquote') 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }`}
      >
        Quote
      </button>
    </div>
  );
};

const VoteButtons = ({ votes, onVote, userVote, disabled = false }) => (
  <div className="flex flex-col items-center gap-2">
    <button
      onClick={() => onVote('upvote')}
      disabled={disabled}
      className={`p-2 rounded-xl transition-all duration-300 ${
        userVote === 'upvote'
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <ThumbsUp size={20} />
    </button>
    <span className="text-lg font-bold text-gray-700">{votes}</span>
    <button
      onClick={() => onVote('downvote')}
      disabled={disabled}
      className={`p-2 rounded-xl transition-all duration-300 ${
        userVote === 'downvote'
          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <ThumbsDown size={20} />
    </button>
  </div>
);

const QuestionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editingAnswerContent, setEditingAnswerContent] = useState("");
  const [approvingAnswer, setApprovingAnswer] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const answerEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Emoji,
    ],
    content: "",
  });

  const editEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Emoji,
    ],
    content: "",
  });

  const editAnswerEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Emoji,
    ],
    content: "",
  });

  // When entering edit mode, prefill form
  useEffect(() => {
    if (editing && question) {
      setEditTitle(question.title);
      setEditTags(question.tags?.join(", ") || "");
      editEditor?.commands.setContent(question.content || "");
    }
    // eslint-disable-next-line
  }, [editing]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await getQuestion(id);
        
        if (response.status === "success") {
          console.log("Question data:", response.data.question);
          console.log("Answers data:", response.data.answers);
          setQuestion(response.data.question);
          setAnswers(response.data.answers || []);
        } else {
          setError("Failed to load question");
        }
      } catch (err) {
        console.error("Error fetching question:", err);
        setError(err?.response?.data?.message || "Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const handleQuestionVote = async (voteType) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const response = await voteQuestion(id, voteType);
      // Update question state with new vote count and user's vote
      setQuestion(prev => ({
        ...prev,
        voteCount: response.data.voteCount,
        userVote: response.data.userVote
      }));
    } catch (err) {
      console.error("Error voting on question:", err);
      setError(err?.response?.data?.message || "Failed to vote on question");
    }
  };

  // Helper to refetch answers for the current question
  const refetchAnswers = async () => {
    try {
      const response = await getQuestion(id);
      if (response.status === "success") {
        setAnswers(response.data.answers || []);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleAnswerVote = async (answerId, voteType) => {
    if (!isAuthenticated) {
      setError("Please login to vote");
      return;
    }

    try {
      const response = await voteAnswer(answerId, voteType);
      setAnswers(prevAnswers =>
        prevAnswers.map(answer =>
          answer._id === answerId
            ? { ...answer, voteCount: response.data.voteCount, userVote: response.data.userVote }
            : answer
        )
      );
    } catch (err) {
      console.error(`Error voting on answer ${answerId}:`, err);
      setError(err?.response?.data?.message || "Failed to vote on answer");
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      const response = await acceptAnswer(id, answerId);
      if (response.status === "success") {
        setQuestion(prev => ({
          ...prev,
          acceptedAnswer: answerId,
          isAnswered: true
        }));
        setAnswers(prev => prev.map(answer => 
          answer._id === answerId 
            ? { ...answer, isAccepted: true }
            : { ...answer, isAccepted: false }
        ));
      }
    } catch (err) {
      console.error("Error accepting answer:", err);
      setError(err?.response?.data?.message || "Failed to accept answer");
    }
  };

  const handleUnacceptAnswer = async (answerId) => {
    try {
      const response = await unacceptAnswer(answerId);
      if (response.status === "success") {
        setQuestion(prev => ({
          ...prev,
          acceptedAnswer: null,
          isAnswered: false
        }));
        setAnswers(prev => prev.map(answer => 
          answer._id === answerId 
            ? { ...answer, isAccepted: false }
            : answer
        ));
      }
    } catch (err) {
      console.error("Error unaccepting answer:", err);
      setError(err?.response?.data?.message || "Failed to unaccept answer");
    }
  };

  const handleEditAnswer = (answer) => {
    setEditingAnswer(answer._id);
    setEditingAnswerContent(answer.content);
    editAnswerEditor?.commands.setContent(answer.content || "");
  };

  const handleUpdateAnswer = async (answerId) => {
    if (!editAnswerEditor?.getHTML() || editAnswerEditor.getHTML() === "<p></p>") {
      setError("Please enter your answer content");
      return;
    }

    try {
      const response = await updateAnswer(answerId, {
        content: editAnswerEditor.getHTML()
      });
      
      if (response.status === "success") {
        setAnswers(prev => prev.map(answer => 
          answer._id === answerId 
            ? { ...answer, content: response.data.answer.content }
            : answer
        ));
        setEditingAnswer(null);
        setEditingAnswerContent("");
      }
    } catch (err) {
      console.error("Error updating answer:", err);
      setError(err?.response?.data?.message || "Failed to update answer");
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm("Are you sure you want to delete this answer?")) {
      return;
    }

    try {
      const response = await deleteAnswer(answerId);
      if (response.status === "success") {
        setAnswers(prev => prev.filter(answer => answer._id !== answerId));
      }
    } catch (err) {
      console.error("Error deleting answer:", err);
      setError(err?.response?.data?.message || "Failed to delete answer");
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError("Please login to submit an answer");
      return;
    }

    if (!answerEditor?.getHTML() || answerEditor.getHTML() === "<p></p>") {
      setError("Please enter your answer");
      return;
    }

    try {
      setSubmittingAnswer(true);
      setError("");

      const answerData = {
        questionId: id,
        content: answerEditor.getHTML()
      };

      const response = await createAnswer(answerData);

      if (response.status === "success") {
        setAnswers(prev => [response.data.answer, ...prev]);
        setAnswerContent("");
        answerEditor.commands.setContent("");
        setShowAnswerForm(false);
      } else {
        setError("Failed to submit answer");
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError(err?.response?.data?.message || "Failed to submit answer");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Edit submit handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!editEditor?.getHTML() || editEditor.getHTML() === "<p></p>") {
      setError("Please enter a description");
      return;
    }
    const tagArray = editTags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5);
    if (tagArray.length === 0) {
      setError("Please add at least one tag");
      return;
    }
    try {
      setError("");
      const response = await updateQuestion(question._id, {
        title: editTitle.trim(),
        content: editEditor.getHTML(),
        tags: tagArray,
      });
      if (response.status === "success") {
        setQuestion(response.data.question);
        setEditing(false);
      } else {
        setError("Failed to update question");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update question");
    }
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

  // Approve answer handler
  const handleApproveAnswer = async (answerId) => {
    try {
      setApprovingAnswer(answerId);
      setError("");
      setSuccessMessage("");
      const response = await approveAnswer(answerId);
      if (response.status === "success") {
        setSuccessMessage("Answer approved successfully!");
        await refetchAnswers();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve answer");
    } finally {
      setApprovingAnswer(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Question</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Question Not Found</h3>
          <p className="text-gray-600 mb-4">The question you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Questions</span>
        </button>

        <div className="relative z-10">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Question */}
          <div className="mb-8">
            <div className="flex gap-6">
              {/* Vote Buttons */}
              <VoteButtons
                votes={question.voteCount || 0}
                onVote={handleQuestionVote}
                userVote={question.userVote}
                disabled={!isAuthenticated}
              />
              
              {/* Question Content */}
              <div className="flex-1">
                {/* Edit Mode */}
                {editing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                      <Edit size={22} /> Edit Question
                    </h2>
                    <div>
                      <label className="block mb-3 text-lg font-semibold text-gray-900">Title</label>
                      <input
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50/80 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg placeholder:text-gray-500 transition-all duration-300"
                        placeholder="Enter question title"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block mb-3 text-lg font-semibold text-gray-900">Description</label>
                      <MenuBar editor={editEditor} />
                      <div className="w-full px-6 py-4 rounded-b-2xl bg-gray-50/80 border-2 border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 text-lg placeholder:text-gray-500 transition-all duration-300 min-h-[200px]">
                        <EditorContent editor={editEditor} className="prose max-w-none prose-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-3 text-lg font-semibold text-gray-900">Tags</label>
                      <input
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50/80 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg placeholder:text-gray-500 transition-all duration-300"
                        placeholder="Add tags (comma separated)"
                        value={editTags}
                        onChange={e => setEditTags(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-4 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="px-6 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-3"
                      >
                        <span>Save Changes</span>
                        <Send size={20} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                      {question.title}
                      {/* Edit Button for Owner */}
                      {isAuthenticated && question.author?._id === user?._id && (
                        <button
                          onClick={() => setEditing(true)}
                          className="ml-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold flex items-center gap-1 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg"
                        >
                          <Edit size={16} /> Edit
                        </button>
                      )}
                    </h1>
                    {/* Tags */}
                    <div className="flex gap-3 mb-6">
                      {question.tags?.map(tag => (
                        <span key={tag} className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {/* Question Content */}
                    <div 
                      className="mb-6 text-gray-700 leading-relaxed prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: question.content }}
                    />
                  </>
                )}
                {/* Question Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>{answers.length} answers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{question.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{formatTimeAgo(question.createdAt)}</span>
                  </div>
                </div>
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {question.author?.username?.[0] || "U"}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{question.author?.username || "Anonymous"}</div>
                    <div className="text-sm text-gray-500">asked {formatTimeAgo(question.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-8" />

          {/* Answers */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{answers.length} Answers</h2>
              {isAuthenticated && (
                <button
                  onClick={() => setShowAnswerForm(!showAnswerForm)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
                >
                  <MessageSquare size={20} />
                  Write Answer
                </button>
              )}
            </div>

            {/* Answer Form */}
            {showAnswerForm && (
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
                <form onSubmit={handleSubmitAnswer}>
                  <MenuBar editor={answerEditor} />
                  <div className="w-full px-6 py-4 rounded-b-2xl bg-white/80 border-2 border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 text-lg placeholder:text-gray-500 transition-all duration-300 min-h-[200px]">
                    <EditorContent editor={answerEditor} className="prose max-w-none prose-lg" />
                  </div>
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAnswerForm(false)}
                      className="px-6 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAnswer}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingAnswer ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Posting Answer...
                        </>
                      ) : (
                        <>
                          <span>Post Answer</span>
                          <Send size={20} className="transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Answers List */}
            <div className="space-y-6">
              {answers.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Answers Yet</h3>
                  <p className="text-gray-600">Be the first to answer this question!</p>
                </div>
              ) : (
                answers.map((answer) => {
                  console.log('--- Answer Debug ---');
                  console.log('Answer ID:', answer._id);
                  console.log('Answer Approved:', answer.isApproved);
                  console.log('Is Authenticated:', isAuthenticated);
                  if (isAuthenticated) {
                    console.log('Logged-in User ID:', user?._id);
                    console.log('Question Author ID:', question?.author?._id);
                    console.log('Is question owner:', question?.author?._id === user?._id);
                  }
                  
                  return (
                    <div 
                      key={answer._id} 
                      className={`relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                        answer.isAccepted ? 'border-green-200 bg-green-50/50' : ''
                      }`}
                    >
                      {/* Pending Approval Badge for answer author */}
                      {(!answer.isApproved && isAuthenticated && answer.author?._id === user?._id) && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          Pending Approval
                        </div>
                      )}
                      {/* Approve Button for question owner */}
                      {(!answer.isApproved && isAuthenticated && question.author?._id === user?._id) && (
                        <button
                          onClick={() => handleApproveAnswer(answer._id)}
                          disabled={approvingAnswer === answer._id}
                          className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approvingAnswer === answer._id ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} />
                              Approve
                            </>
                          )}
                        </button>
                      )}
                      {/* Accepted Badge */}
                      {answer.isAccepted && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          <CheckCircle size={16} />
                          Accepted
                        </div>
                      )}
                      
                      <div className="flex gap-6">
                        {/* Vote Buttons */}
                        <VoteButtons
                          votes={answer.voteCount || 0}
                          onVote={(voteType) => handleAnswerVote(answer._id, voteType)}
                          userVote={answer.userVote}
                          disabled={!isAuthenticated}
                        />
                        
                        {/* Answer Content */}
                        <div className="flex-1">
                          {editingAnswer === answer._id ? (
                            <div className="mb-6">
                              <MenuBar editor={editAnswerEditor} />
                              <div className="w-full px-6 py-4 rounded-b-2xl bg-white/80 border-2 border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 text-lg placeholder:text-gray-500 transition-all duration-300 min-h-[200px]">
                                <EditorContent editor={editAnswerEditor} className="prose max-w-none prose-lg" />
                              </div>
                              <div className="flex justify-end gap-4 mt-4">
                                <button
                                  onClick={() => setEditingAnswer(null)}
                                  className="px-6 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleUpdateAnswer(answer._id)}
                                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                                >
                                  Update Answer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="mb-6 text-gray-700 leading-relaxed prose max-w-none"
                              dangerouslySetInnerHTML={{ __html: answer.content }}
                            />
                          )}
                          
                          {/* Answer Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {answer.author?.username?.[0] || "U"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{answer.author?.username || "Anonymous"}</div>
                                <div className="text-sm text-gray-500">answered {formatTimeAgo(answer.createdAt)}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Accept/Unaccept Answer */}
                              {isAuthenticated && question.author?._id === user?._id && (
                                answer.isAccepted ? (
                                  <button
                                    onClick={() => handleUnacceptAnswer(answer._id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg"
                                  >
                                    <X size={16} />
                                    Unaccept
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAcceptAnswer(answer._id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg"
                                  >
                                    <CheckCircle size={16} />
                                    Accept
                                  </button>
                                )
                              )}
                              
                              {/* Edit/Delete Answer */}
                              {isAuthenticated && (answer.author?._id === user?._id || user?.role === 'admin') && (
                                <>
                                  <button 
                                    onClick={() => handleEditAnswer(answer)}
                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteAnswer(answer._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                              
                              <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                <Flag size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail; 