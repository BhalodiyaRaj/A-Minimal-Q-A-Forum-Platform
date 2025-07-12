import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Emoji from "@tiptap/extension-emoji";

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="bg-gradient-to-r from-[#23232a] via-[#312e81] to-[#0ea5e9] rounded-t-xl px-2 py-2 flex gap-2 text-cyan-200 text-lg mb-0.5 flex-wrap shadow">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded transition-all ${editor.isActive('bold') ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded transition-all ${editor.isActive('italic') ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-2 py-1 rounded transition-all ${editor.isActive('underline') ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>U</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-2 py-1 rounded transition-all ${editor.isActive('strike') ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>S</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 rounded transition-all ${editor.isActive('bulletList') ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>•</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 rounded transition-all ${editor.isActive('orderedList') ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>1.</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`px-2 py-1 rounded transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>&#8676;</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`px-2 py-1 rounded transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>&#8596;</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`px-2 py-1 rounded transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>&#8677;</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`px-2 py-1 rounded transition-all ${editor.isActive({ textAlign: 'justify' }) ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>&#8801;</button>
      <button type="button" onClick={() => editor.chain().focus().setLink({ href: prompt('Enter URL') || '' }).run()} className={`px-2 py-1 rounded transition-all ${editor.isActive('link') ? 'bg-cyan-700 text-white' : 'hover:bg-cyan-900/40'}`}>🔗</button>
      <button type="button" onClick={() => editor.chain().focus().setImage({ src: prompt('Enter image URL') || '' }).run()} className="px-2 py-1 rounded hover:bg-cyan-900/40 transition-all">🖼️</button>
      <button type="button" onClick={() => editor.chain().focus().insertContent('😀')} className="px-2 py-1 rounded hover:bg-cyan-900/40 transition-all">😀</button>
    </div>
  );
};

const AskQuestion = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
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

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#0ea5e9]/10 rounded-2xl shadow-2xl border border-[#23232a] p-8 text-gray-200">
      <form className="space-y-7">
        {/* Title */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-cyan-200">Title</label>
          <input
            className="w-full px-4 py-3 rounded-xl bg-[#18181b] border-2 border-cyan-800 focus:outline-none focus:border-cyan-400 text-lg placeholder:text-cyan-100/60 transition-all"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        {/* Description */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-cyan-200">Description</label>
          <MenuBar editor={editor} />
            <div className="w-full px-4 py-3 rounded-xl bg-[#18181b] border-2 border-cyan-800 focus:outline-none focus:border-cyan-400 text-lg placeholder:text-cyan-100/60 transition-all">
                <EditorContent editor={editor} />
          </div>
        </div>
        {/* Tags */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-cyan-200">Tags</label>
          <input
            className="w-full px-4 py-3 rounded-xl bg-[#18181b] border-2 border-cyan-800 focus:outline-none focus:border-cyan-400 text-lg placeholder:text-cyan-100/60 transition-all"
            placeholder="Tags (comma separated, e.g. React, SQL)"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>
        {/* Submit */}
        <div className="flex justify-center mt-6">
          <button type="submit" className="border-2 border-cyan-500 text-white bg-gradient-to-r from-cyan-600 to-indigo-600 px-10 py-2 rounded-xl text-lg font-semibold hover:from-cyan-400 hover:to-indigo-700 hover:border-cyan-400 transition-all shadow-lg">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestion; 