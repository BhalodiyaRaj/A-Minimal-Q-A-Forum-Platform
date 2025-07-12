import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Emoji from "@tiptap/extension-emoji";
import { 
  Send, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { createQuestion, getPopularTags } from "../api/apiService";
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

const AskQuestion = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [popularTags, setPopularTags] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const editor = useEditor({
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

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Load popular tags
    const loadPopularTags = async () => {
      try {
        const response = await getPopularTags({ limit: 10 });
        if (response.status === "success") {
          setPopularTags(response.data.tags || []);
        }
      } catch (err) {
        console.error("Error loading popular tags:", err);
      }
    };

    loadPopularTags();
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Please enter a title for your question");
      return;
    }

    if (!editor?.getHTML() || editor.getHTML() === "<p></p>") {
      setError("Please enter a description for your question");
      return;
    }

    const tagArray = tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5); // Limit to 5 tags

    if (tagArray.length === 0) {
      setError("Please add at least one tag");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const questionData = {
        title: title.trim(),
        content: editor.getHTML(),
        tags: tagArray
      };

      const response = await createQuestion(questionData);

      if (response.status === "success") {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/question/${response.data.question._id}`);
        }, 2000);
      } else {
        setError("Failed to create question. Please try again.");
      }
    } catch (err) {
      console.error("Error creating question:", err);
      setError(err?.response?.data?.message || "Failed to create question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag) => {
    const currentTags = tags.split(",").map(t => t.trim()).filter(t => t);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(", ");
      setTags(newTags);
    }
    setShowTagSuggestions(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-6">
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 text-gray-900">
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

        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Ask a Question
            </h1>
            <p className="text-xl text-gray-600">Share your knowledge and help others learn</p>
          </div>
          
          {/* Success Message */}
          {success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Question Posted Successfully!</h3>
                <p className="text-green-600">Redirecting to your question...</p>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          {/* Title */}
          <div>
            <label className="block mb-4 text-lg font-semibold text-gray-900">Title</label>
            <input
              className="w-full px-6 py-4 rounded-2xl bg-gray-50/80 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg placeholder:text-gray-500 transition-all duration-300"
              placeholder="What's your question? Be specific."
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block mb-4 text-lg font-semibold text-gray-900">Description</label>
            <MenuBar editor={editor} />
            <div className="w-full px-6 py-4 rounded-b-2xl bg-gray-50/80 border-2 border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 text-lg placeholder:text-gray-500 transition-all duration-300 min-h-[300px]">
              <EditorContent editor={editor} className="prose max-w-none prose-lg" />
            </div>
          </div>
          
          {/* Tags */}
          <div className="relative">
            <label className="block mb-4 text-lg font-semibold text-gray-900">Tags</label>
            <div className="relative">
              <input
                className="w-full px-6 py-4 rounded-2xl bg-gray-50/80 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg placeholder:text-gray-500 transition-all duration-300"
                placeholder="Add tags (comma separated, e.g. React, JavaScript, API)"
                value={tags}
                onChange={e => setTags(e.target.value)}
                onFocus={() => setShowTagSuggestions(true)}
                disabled={loading}
              />
              <Tag className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            {/* Popular Tags Suggestions */}
            {showTagSuggestions && popularTags.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 z-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Popular Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => addTag(tag.name)}
                      className="px-3 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl text-sm font-medium hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 border border-blue-200"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-3">Add up to 5 tags to help others find your question</p>
          </div>
          
          {/* Submit */}
          <div className="flex justify-center pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-2xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Posting Question...
                </>
              ) : (
                <>
                  <span>Post Question</span>
                  <Send size={20} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion; 