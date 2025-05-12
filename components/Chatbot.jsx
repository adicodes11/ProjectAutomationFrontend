"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const conversationEndRef = useRef(null);

  // Retrieve projectId and userEmail from session storage (set these elsewhere).
  const projectId =
    typeof window !== "undefined" ? sessionStorage.getItem("projectId") : null;
  const userEmail =
    typeof window !== "undefined" ? sessionStorage.getItem("email") : "anonymous@example.com";

  // Auto-scroll to the latest message whenever conversation updates.
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Append user message to conversation history.
    const userMessage = {
      role: "user",
      message: input,
      timestamp: new Date().toISOString(),
    };
    setConversation((prev) => [...prev, userMessage]);

    const currentQuery = input;
    setInput("");
    setLoading(true);

    try {
      // Call the chatbot API
      const res = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          userEmail,
          query: currentQuery,
          conversationId: null, // or pass an existing conversationId if continuing
        }),
      });
      if (!res.ok) throw new Error("Failed to process query.");

      const data = await res.json();
      const botMessage = {
        role: "assistant",
        message: data.answer,
        timestamp: new Date().toISOString(),
      };
      setConversation((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        message: "Sorry, there was an error processing your query.",
        timestamp: new Date().toISOString(),
      };
      setConversation((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  // Toggle chat window open/close
  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    setIsExpanded(false); // reset expanded state if closing
  };

  // Toggle expanded (full-screen) mode
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="chatWindow"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden 
              ${isExpanded ? "w-[90vw] h-[90vh]" : "w-[400px] h-[500px]"}`}
          >
            {/* Header */}
            <div className="bg-indigo-600 text-white flex items-center justify-between p-4 relative">
              <h3 className="text-lg font-semibold">Project Assistant</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleToggleExpand}
                  className="hover:bg-indigo-500 p-1 rounded-md"
                >
                  {isExpanded ? (
                    <ArrowsPointingInIcon className="h-5 w-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleToggleChat}
                  className="hover:bg-indigo-500 p-1 rounded-md"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Conversation History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
              {conversation.length === 0 && !loading && (
                <p className="text-gray-500 text-sm">
                  Ask anything about your project...
                </p>
              )}

              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[75%] break-words whitespace-pre-wrap ${
                      msg.role === "assistant"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg p-3 max-w-[75%] bg-gray-200 text-gray-800">
                    <p className="text-sm animate-pulse">Typing...</p>
                  </div>
                </div>
              )}

              <div ref={conversationEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-r-md"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Floating Chat Button
          <motion.button
            key="chatButton"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center"
            onClick={handleToggleChat}
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
            <span className="ml-2 font-medium text-sm hidden sm:block">
              Chat
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
