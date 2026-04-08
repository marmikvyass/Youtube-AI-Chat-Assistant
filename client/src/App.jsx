import { useEffect, useRef, useState } from "react";

export default function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const getVideoId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname === "youtu.be") return u.pathname.slice(1);
      return u.searchParams.get("v");
    } catch {
      return null;
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;

    const videoId = getVideoId(videoUrl);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          question,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.answer },
      ]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col">

      {/* Header */}
      <div className="border-b border-zinc-800 p-4 text-center">
        <h1 className="text-xl sm:text-2xl font-semibold">
          YouTube AI Chat Assistant
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Paste a YouTube link and chat with the video using AI
        </p>
      </div>

      {/* Responsive Layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 flex-1">

        {/* LEFT */}
        <div className="border-b lg:border-b-0 lg:border-r border-zinc-800 p-3 sm:p-4 flex flex-col gap-3">

          <input
            type="text"
            placeholder="Paste YouTube URL..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 p-2 sm:p-3 rounded-lg text-sm"
          />

          {videoUrl && (
            <div>
              <iframe
                className="w-full h-48 sm:h-100 rounded-xl"
                src={`https://www.youtube-nocookie.com/embed/${getVideoId(videoUrl)}`}
                allowFullScreen
              />
              <div className="sm:flex sm:flex-row sm:mt-3 mt-1 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setQuestion("summarize this video")}
                  className="bg-blue-600 px-2 py-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Summarize
                </button>

                <button
                  onClick={() => setQuestion("give key points")}
                  className="bg-zinc-800 px-2 py-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Key Points
                </button>
                <button
                  onClick={() => setQuestion("Explain this video simply")}
                  className="bg-blue-600 px-2 py-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Explain simply
                </button>
                <button
                  onClick={() => setQuestion("Extract insights from this video")}
                  className="bg-zinc-800 px-2 py-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Extract insights
                </button>
                <button
                  onClick={() => setQuestion("Generate notes point wise from this video")}
                  className="bg-blue-600 px-2 py-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Generate notes
                </button>
              </div>
              <div className="text-xs sm:text-sm sm:mt-3 mt-1 text-zinc-400">
                Ask questions about the video. The AI reads transcript and answers.
              </div>
            </div>
          )}
          {!videoUrl && (
            <div>
              <div className="flex flex-col justify-center h-80 text-zinc-400 gap-3 border border-zinc-800 rounded-xl bg-zinc-900/30 px-6">
                <div className="text-white text-xl font-medium">
                  How to use this app
                </div>

                <div className="text-sm space-y-1">
                  <p>1. Paste any YouTube video link above</p>
                  <p>2. The AI reads the video transcript</p>
                  <p>3. Ask questions about the video</p>
                  <p>4. Get summaries, notes, and explanations</p>
                </div>

                <div className="text-xs text-zinc-500 mt-2">
                  Works with any language • Powered by RAG • Uses AI to generate responses from the video
                </div>

              </div>
            </div>
          )}

        </div>

        {/* RIGHT CHAT */}
        <div className="flex flex-col flex-1">
          <h1 className="text-center font-bold text-xl mt-2 sm:mt-0 mb-2">AI Chat Assistant</h1>
          <div
            ref={chatRef}
            className="flex-1 overflow-y-scroll sm:max-h-200 max-h-80 p-3 sm:p-6 space-y-3 sm:space-y-4"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm ${msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-zinc-900 border border-zinc-800"
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl w-fit flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse delay-150"></span>
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse delay-300"></span>
                </div>
                <span className="text-xs text-zinc-400">AI is thinking</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-800 p-2 sm:p-4 flex gap-2">
            <input
              type="text"
              placeholder="Ask about this video..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 sm:p-3 text-sm"
            />

            <button
              onClick={handleSend}
              className="px-3 sm:px-6 bg-blue-600 rounded-lg text-sm"
            >
              Send
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-2 sm:p-3 text-center text-xs sm:text-sm text-zinc-500">
        Built with RAG • LangChain • Groq • Cohere • MERN
      </div>

    </div>
  );
}