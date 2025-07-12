import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockQuestions = [
  {
    id: 1,
    title:
      "How to join 2 columns in a data set to make a separate column in SQL?",
    description: "I do not know the code for it as I am a beginner...",
    tags: ["SQL", "Beginner"],
    user: "User Name",
  },
  {
    id: 2,
    title: "How to use React Context for global state?",
    description: "I want to manage state globally in my app...",
    tags: ["React", "Context"],
    user: "User Name",
  },
];

const QuestionList = () => {
  const [filter, setFilter] = useState("Newest");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4">
      <div className="space-y-6">
        {mockQuestions.map((q) => (
          <div
            key={q.id}
            className="border border-[#23232a] rounded-2xl p-6 bg-[#18181b] shadow-lg hover:shadow-xl transition group cursor-pointer hover:bg-gradient-to-r hover:from-[#23232a] hover:to-[#0ea5e9]/10"
            onClick={() => navigate(`/question/${q.id}`)}
          >
            <div className="flex items-center gap-2 mb-3">
              {q.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-900/60 text-blue-300 px-3 py-1 rounded-full text-xs font-medium mr-2 group-hover:bg-blue-800/80 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h2 className="font-bold text-xl mb-2 text-white group-hover:text-blue-400 transition line-clamp-2">
              {q.title}
            </h2>
            <p className="text-base text-gray-400 mb-4 line-clamp-2">
              {q.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-700 to-indigo-700 flex items-center justify-center text-white font-bold text-xs">
                {q.user[0]}
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {q.user}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex justify-center mt-10 gap-2">
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            className="px-4 py-2 rounded-lg hover:bg-[#23232a] text-gray-300 transition border border-[#23232a] bg-[#18181b] font-semibold shadow-sm"
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionList;
