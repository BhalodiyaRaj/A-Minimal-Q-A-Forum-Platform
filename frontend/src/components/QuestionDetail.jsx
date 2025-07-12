import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockQuestion = {
  title: "How to join 2 columns in a data set to make a separate column in SQL",
  tags: ["SQL", "Beginner"],
  description: `I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name , and column 2 consists of last name I want a column to combine`,
  answers: [
    {
      id: 1,
      votes: 1,
      content: [
        "The || Operator.",
        "The + Operator.",
        "The CONCAT Function."
      ]
    },
    {
      id: 2,
      votes: 0,
      content: ["Details"]
    }
  ]
};

const QuestionDetail = () => {
  const [answer, setAnswer] = useState("");
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-[#18181b] rounded-2xl shadow-xl border border-[#23232a] p-6 text-gray-200">
      {/* Breadcrumb */}
      <div className="mb-2 text-sm text-blue-300 font-mono">
        <span
          className="text-blue-400 cursor-pointer hover:underline hover:text-blue-200"
          onClick={() => navigate(-1)}
        >
          Question
        </span>
        <span className="mx-1">&gt;</span>
        <span className="truncate">{mockQuestion.title.slice(0, 20)}...</span>
      </div>
      {/* Question Title */}
      <h1 className="text-2xl font-bold mb-2 text-white">{mockQuestion.title}</h1>
      {/* Tags */}
      <div className="flex gap-2 mb-2">
        {mockQuestion.tags.map(tag => (
          <span key={tag} className="px-3 py-1 bg-[#23232a] border border-blue-700 text-blue-300 rounded-lg text-xs font-semibold">{tag}</span>
        ))}
      </div>
      {/* Description */}
      <div className="mb-6 text-gray-300 font-mono whitespace-pre-line">{mockQuestion.description}</div>
      <hr className="border-[#23232a] mb-4" />
      {/* Answers */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-3 text-white">Answers</h2>
        <div className="space-y-6">
          {mockQuestion.answers.map((ans, idx) => (
            <div key={ans.id} className="flex items-start gap-4">
              {/* Votes */}
              <div className="flex flex-col items-center mr-2">
                <button className="text-gray-400 hover:text-blue-400 text-xl">&#9650;</button>
                <span className="font-bold text-lg text-blue-400">{ans.votes}</span>
                <button className="text-gray-400 hover:text-blue-400 text-xl">&#9660;</button>
              </div>
              {/* Answer Content */}
              <div>
                <div className="font-bold text-lg mb-1 text-white">Answer {idx + 1}</div>
                <ul className="list-disc ml-5 text-gray-300 font-mono">
                  {ans.content.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Submit Your Answer */}
      <div className="mt-8">
        <div className="text-lg font-semibold mb-2 text-gray-200">Submit Your Answer</div>
        {/* Simple rich text toolbar mockup */}
        <div className="bg-[#23232a] rounded-t-lg px-2 py-1 flex gap-2 text-gray-400 text-lg mb-0.5">
          <span className="hover:text-blue-400 cursor-pointer font-bold">B</span>
          <span className="hover:text-blue-400 cursor-pointer italic">I</span>
          <span className="hover:text-blue-400 cursor-pointer line-through">S</span>
          <span className="hover:text-blue-400 cursor-pointer">&#128515;</span>
          <span className="hover:text-blue-400 cursor-pointer">🔗</span>
          <span className="hover:text-blue-400 cursor-pointer">🖼️</span>
        </div>
        <textarea
          className="w-full min-h-[100px] bg-[#18181b] border-2 border-[#23232a] rounded-b-lg p-3 text-gray-200 focus:outline-none focus:border-blue-500 resize-y mb-4"
          placeholder="Write your answer..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
        />
        <div className="flex justify-end">
          <button className="bg-blue-800 text-white px-8 py-2 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition-all">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail; 