import React, { useState } from 'react';
import { 
  CheckCircle, 
  Edit, 
  Trash2, 
  Flag, 
  X 
} from 'lucide-react';
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Emoji from "@tiptap/extension-emoji";
import { updateAnswer, deleteAnswer } from '../api/apiService';
import VoteButtons from './VoteButtons';
import MenuBar from './MenuBar';

const Answer = ({ 
  answer, 
  currentUser, 
  questionAuthorId, 
  isAuthenticated,
  onVote,
  onAccept,
  onUnaccept,
  onUpdate,
  onDelete,
  onError
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const editEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Emoji,
    ],
    content: answer.content,
  });

  const formatTimeAgo = (date) => {
    const now = new Date();
    const answerDate = new Date(date);
    const diffInSeconds = Math.floor((now - answerDate) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const handleEdit = () => {
    setIsEditing(true);
    editEditor?.commands.setContent(answer.content || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    editEditor?.commands.setContent(answer.content || "");
  };

  const handleUpdateAnswer = async () => {
    if (!editEditor?.getHTML() || editEditor.getHTML() === "<p></p>") {
      onError("Please enter your answer content");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await updateAnswer(answer._id, {
        content: editEditor.getHTML()
      });
      
      if (response.status === "success") {
        onUpdate(answer._id, response.data.answer.content);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating answer:", err);
      onError(err?.response?.data?.message || "Failed to update answer");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAnswer = async () => {
    if (!window.confirm("Are you sure you want to delete this answer?")) {
      return;
    }

    try {
      const response = await deleteAnswer(answer._id);
      if (response.status === "success") {
        onDelete(answer._id);
      }
    } catch (err) {
      console.error("Error deleting answer:", err);
      onError(err?.response?.data?.message || "Failed to delete answer");
    }
  };

  const canEdit = isAuthenticated && (answer.author?._id === currentUser?._id || currentUser?.role === 'admin');
  const canAccept = isAuthenticated && questionAuthorId === currentUser?._id;

  return (
    <div 
      className={`relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${
        answer.isAccepted ? 'border-green-200 bg-green-50/50' : ''
      }`}
    >
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
          onVote={(voteType) => onVote(answer._id, voteType)}
          userVote={answer.userVote}
          disabled={!isAuthenticated}
        />
        
        {/* Answer Content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="mb-6">
              <MenuBar editor={editEditor} />
              <div className="w-full px-6 py-4 rounded-b-2xl bg-white/80 border-2 border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 text-lg placeholder:text-gray-500 transition-all duration-300 min-h-[200px]">
                <EditorContent editor={editEditor} className="prose max-w-none prose-lg" />
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-300"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAnswer}
                  disabled={isUpdating}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update Answer'}
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
              {canAccept && (
                answer.isAccepted ? (
                  <button
                    onClick={() => onUnaccept(answer._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg"
                  >
                    <X size={16} />
                    Unaccept
                  </button>
                ) : (
                  <button
                    onClick={() => onAccept(answer._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg"
                  >
                    <CheckCircle size={16} />
                    Accept
                  </button>
                )
              )}
              
              {/* Edit/Delete Answer */}
              {canEdit && (
                <>
                  <button 
                    onClick={handleEdit}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    disabled={isEditing}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={handleDeleteAnswer}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    disabled={isEditing}
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
};

export default Answer; 