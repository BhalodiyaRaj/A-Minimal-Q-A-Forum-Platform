import React from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {/* Controls bar: Ask Question, Filters, Search */}
      <div className="flex items-center justify-center gap-4 mt-8 mb-6 w-full max-w-4xl mx-auto">
        <button
          className="border border-blue-500 text-blue-400 font-semibold px-6 py-2 rounded-xl bg-transparent hover:bg-blue-500/10 transition-all text-lg"
          style={{ fontFamily: "inherit" }}
          onClick={() => navigate("/ask")}
        >
          Ask New question
        </button>
        <div className="flex items-center gap-2 border border-gray-600 rounded-xl px-2 py-1 bg-[#18181b]">
          <button className="px-4 py-1 rounded-lg text-gray-200 font-medium hover:bg-blue-500/10 transition">Newest</button>
          <button className="px-4 py-1 rounded-lg text-gray-200 font-medium hover:bg-blue-500/10 transition">Unanswered</button>
          <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-gray-200 font-medium hover:bg-blue-500/10 transition border border-gray-700 ml-2">
            more <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
        <div className="flex items-center border border-gray-600 rounded-xl bg-[#18181b] px-2 py-1 w-72">
          <input className="flex-1 bg-transparent outline-none text-gray-200 px-3 py-1 text-lg" placeholder="Search" />
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
      </div>
      {children}
    </div>
  );
};

export default MainLayout; 