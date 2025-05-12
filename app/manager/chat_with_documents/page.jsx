"use client";

import { useState, useRef, useEffect } from "react";
import { IoSendSharp } from "react-icons/io5";
import { FiUpload } from "react-icons/fi";
import { BsFileEarmarkPdf, BsFileEarmarkText, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { ImSpinner8 } from "react-icons/im";
import { FaRobot, FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ProfileMenu from "@/components/ProfileMenu";

export default function ChatWithDocuments() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const chatRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  // Upload file => separate request (multipart/form-data).
  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("https://projectautomationflaskapi.onrender.com/chat_with_documents", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      // Simulated progress bar
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      const data = await res.json();
      console.log("Upload response:", data);

      // Once uploaded, we can enable chat
      setTimeout(() => {
        setIsProcessing(true);
        addSystemMessage("Document uploaded successfully! You can now ask questions about it.");
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      addSystemMessage("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const addSystemMessage = (content) => {
    setChatMessages((prev) => [...prev, { type: "system", content }]);
  };

  // Send chat message => separate request (JSON).
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Show user message in UI
    const userMessage = { type: "user", content: userInput };
    setChatMessages((prev) => [...prev, userMessage]);

    const query = userInput;
    setUserInput("");

    // Show typing indicator
    setIsTyping(true);

    try {
      const res = await fetch("https://projectautomationflaskapi.onrender.com/chat_with_documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: sessionStorage.getItem("email") || "anonymous@example.com",
          query,
          conversationId: null, // or some existing conversation ID
        }),
      });
      if (!res.ok) throw new Error("Chat API error");

      const data = await res.json();
      
      // Add slight delay to simulate natural typing
      setTimeout(() => {
        setIsTyping(false);
        // Show bot message
        setChatMessages((prev) => [
          ...prev,
          { type: "bot", content: data.answer },
        ]);
      }, 1000);
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setChatMessages((prev) => [
        ...prev,
        { type: "bot", content: "Sorry, I couldn't process your request." },
      ]);
    }
  };

  // Helper to pick icon based on file type
  const FileIcon = ({ filename }) =>
    filename?.toLowerCase().endsWith(".pdf") ? (
      <BsFileEarmarkPdf className="h-6 w-6" />
    ) : (
      <BsFileEarmarkText className="h-6 w-6" />
    );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute top-6 left-4 z-20 md:hidden bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-100 transition-all"
      >
        {isSidebarOpen ? <BsChevronLeft /> : <BsChevronRight />}
      </button>

      {/* Sidebar for doc upload */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-80 md:w-96 bg-white border-r border-gray-200 shadow-lg absolute md:relative z-10 h-full"
          >
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Document Chat
                  </span>
                </h2>
                <p className="text-gray-600 text-sm">
                  Upload your document to start an intelligent conversation
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Upload area */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gradient-to-br from-white to-gray-50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center w-full"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="mb-4 p-4 bg-blue-50 rounded-full">
                      <FiUpload className="h-8 w-8 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-2">
                      PDF or TXT files supported
                    </span>
                  </motion.button>
                </motion.div>

                {/* Selected file details */}
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileIcon filename={selectedFile.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>

                      {/* Upload progress bar */}
                      {uploadProgress > 0 && (
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          />
                        </div>
                      )}

                      {/* Upload button */}
                      <motion.button
                        onClick={handleUpload}
                        disabled={isUploading}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg
                          hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                      >
                        {isUploading ? (
                          <div className="flex items-center justify-center">
                            <ImSpinner8 className="animate-spin mr-2" />
                            <span>Processing...</span>
                          </div>
                        ) : uploadProgress === 100 ? (
                          "Processed"
                        ) : (
                          "Upload & Process"
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Help section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Tips</h3>
                  <ul className="text-xs text-blue-700 space-y-1.5">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Ask specific questions about your document</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Supported formats: PDF and TXT files</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>For best results, ensure text is extractable</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center z-10">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <button 
                onClick={toggleSidebar} 
                className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
              >
                <BsChevronRight />
              </button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chat with Documents
                </span>
                {isProcessing && (
                  <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                )}
              </h1>
              <p className="text-sm text-gray-600">
                {isProcessing
                  ? "Ask questions about your uploaded document"
                  : "Upload a document to start chatting"}
              </p>
            </div>
          </div>
          <ProfileMenu />
        </div>

        {/* Message list */}
        <div
          className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-gray-50 bg-opacity-70"
          ref={chatRef}
        >
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="p-4 rounded-full bg-blue-50 mb-4">
                <FaRobot className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-lg font-medium mb-2 text-gray-700">Start a Conversation</p>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Upload a document and ask questions about its content. The AI will analyze and respond based on what's in your file.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-2">
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={messageVariants}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.type === "system" ? (
                    <div className="max-w-md mx-auto py-2 px-4 bg-blue-50 text-blue-700 rounded-lg text-sm text-center">
                      {msg.content}
                    </div>
                  ) : (
                    <div className={`flex max-w-[80%] items-start gap-2`}>
                      {msg.type === "bot" && (
                        <div className="mt-1 flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                          <FaRobot className="h-4 w-4" />
                        </div>
                      )}
                      
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.type === "user"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none shadow-sm"
                            : "bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      
                      {msg.type === "user" && (
                        <div className="mt-1 flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white">
                          <FaUser className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                        <FaRobot className="h-4 w-4" />
                      </div>
                      <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-inner z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex space-x-2"
          >
            <input
              type="text"
              placeholder={
                isProcessing
                  ? "Ask a question about your document..."
                  : "Upload a document to start chatting"
              }
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500 disabled:bg-gray-50
                         disabled:cursor-not-allowed transition-all duration-200
                         placeholder-gray-400 text-gray-700 shadow-sm"
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!isProcessing || !userInput.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full 
                         hover:from-blue-700 hover:to-blue-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:ring-offset-2 disabled:opacity-50
                         disabled:hover:bg-blue-600 shadow-sm transition-all duration-200"
            >
              <IoSendSharp className="h-5 w-5" />
            </motion.button>
          </motion.div>
          
          {/* Bottom status indicator */}
          {isProcessing && (
            <div className="pt-2 px-2 flex items-center">
              <span className="flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-gray-500">Document loaded & ready for questions</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}