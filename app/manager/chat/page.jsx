"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  PaperAirplaneIcon,
  UserGroupIcon,
  UserIcon,
  PlusCircleIcon,
  XMarkIcon,
  FaceSmileIcon,
  PaperClipIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import EmojiPicker from "emoji-picker-react";

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newConversationName, setNewConversationName] = useState("");
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  // Check for user session
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    const storedRole = sessionStorage.getItem("role");

    if (!storedEmail) {
      router.push("/login");
      return;
    }

    setUser({ email: storedEmail, role: storedRole || "member" });
    
    // Fetch data once we have the user
    fetchTeamMembers(storedEmail);
    fetchConversations(storedEmail);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [router]);

  // Fetch team members (would be from API in production)
  const fetchTeamMembers = (userEmail) => {
    // Mock data - replace with actual API call
    const mockTeamMembers = [
      { id: 1, email: "john@taskflownet.com", name: "John Smith", role: "Developer" },
      { id: 2, email: "sara@taskflownet.com", name: "Sara Johnson", role: "Designer" },
      { id: 3, email: "mike@taskflownet.com", name: "Mike Brown", role: "PM" },
      { id: 4, email: "alex@taskflownet.com", name: "Alex Wang", role: "QA" },
      { id: 5, email: userEmail, name: "You", role: "Member" },
    ];
    
    // Filter out current user from team members list
    setTeamMembers(mockTeamMembers.filter(member => member.email !== userEmail));
  };

  // Fetch conversations (would be from API in production)
  const fetchConversations = (userEmail) => {
    // Mock data - replace with actual API call
    const mockConversations = [
      {
        id: 1,
        name: "Project Kickoff",
        type: "group",
        lastMessage: "Let's discuss the timeline",
        lastMessageTime: "2023-03-10T09:30:00",
        participants: ["john@taskflownet.com", "sara@taskflownet.com", userEmail],
        unread: 2,
      },
      {
        id: 2,
        name: "Sara Johnson",
        type: "direct",
        lastMessage: "Can you review my design?",
        lastMessageTime: "2023-03-09T16:45:00",
        participants: ["sara@taskflownet.com", userEmail],
        unread: 0,
      },
      {
        id: 3,
        name: "Backend Team",
        type: "group",
        lastMessage: "Database migration completed",
        lastMessageTime: "2023-03-08T11:20:00",
        participants: ["john@taskflownet.com", "mike@taskflownet.com", userEmail],
        unread: 0,
      },
    ];
    
    setConversations(mockConversations);
    // Set the first conversation as active by default
    if (mockConversations.length > 0 && !activeConversation) {
      setActiveConversation(mockConversations[0]);
      fetchMessages(mockConversations[0].id);
    }
  };

  // Fetch messages for a conversation (would be from API in production)
  const fetchMessages = (conversationId) => {
    // Mock data - replace with actual API call
    const mockMessages = [
      {
        id: 1,
        conversationId: 1,
        senderId: "john@taskflownet.com",
        senderName: "John Smith",
        content: "Hi team, we need to discuss the project timeline for the new feature.",
        timestamp: "2023-03-10T09:30:00",
        attachments: [],
      },
      {
        id: 2,
        conversationId: 1,
        senderId: "sara@taskflownet.com",
        senderName: "Sara Johnson",
        content: "I agree. When are we planning to start the development phase?",
        timestamp: "2023-03-10T09:35:00",
        attachments: [],
      },
      {
        id: 3,
        conversationId: 1,
        senderId: user?.email || "",
        senderName: "You",
        content: "I think we can start next week after the design phase is completed.",
        timestamp: "2023-03-10T09:40:00",
        attachments: [{
          name: "project_timeline.pdf",
          url: "#",
          type: "pdf"
        }],
      },
    ];
    
    // Filter messages for the selected conversation
    setMessages(mockMessages.filter(msg => msg.conversationId === conversationId));
  };

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    fetchMessages(conversation.id);
    
    // Mark as read (would update in API in production)
    const updatedConversations = conversations.map(conv => 
      conv.id === conversation.id ? { ...conv, unread: 0 } : conv
    );
    setConversations(updatedConversations);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "" && attachments.length === 0) return;
    
    // Create new message
    const newMsg = {
      id: messages.length + 1,
      conversationId: activeConversation.id,
      senderId: user?.email || "",
      senderName: "You",
      content: newMessage,
      timestamp: new Date().toISOString(),
      attachments: attachments,
    };
    
    // Add to messages
    setMessages([...messages, newMsg]);
    
    // Clear input and attachments
    setNewMessage("");
    setAttachments([]);
    
    // Update conversation last message
    const updatedConversations = conversations.map(conv => 
      conv.id === activeConversation.id 
        ? { 
            ...conv, 
            lastMessage: newMessage.trim() || "Attachment sent", 
            lastMessageTime: new Date().toISOString(),
            unread: 0
          } 
        : conv
    );
    setConversations(updatedConversations);
    
    // Here you would also send the message to your backend API
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Convert files to attachments
    const newAttachments = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.split('/')[0], // 'image', 'application', etc.
      size: file.size
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
  };

  const toggleTeamSelector = () => {
    setShowTeamSelector(!showTeamSelector);
  };

  const handleSelectMember = (member) => {
    const isSelected = selectedMembers.some(m => m.id === member.id);
    
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleSelectAllMembers = () => {
    if (selectedMembers.length === teamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers([...teamMembers]);
    }
  };

  const startNewConversation = () => {
    if (selectedMembers.length === 0) return;
    
    // Determine the type and name
    const isDirectMessage = selectedMembers.length === 1;
    const name = isDirectMessage 
      ? selectedMembers[0].name 
      : newConversationName.trim() || `Group (${selectedMembers.length + 1})`;
    
    // Create new conversation
    const newConversation = {
      id: conversations.length + 1,
      name: name,
      type: isDirectMessage ? "direct" : "group",
      lastMessage: "New conversation started",
      lastMessageTime: new Date().toISOString(),
      participants: [...selectedMembers.map(m => m.email), user?.email],
      unread: 0,
    };
    
    // Add to conversations
    setConversations([newConversation, ...conversations]);
    
    // Set as active
    setActiveConversation(newConversation);
    setMessages([]);
    
    // Reset
    setSelectedMembers([]);
    setShowTeamSelector(false);
    setNewConversationName("");
    setShowNewConversationModal(false);
  };

  const filteredTeamMembers = teamMembers.filter(
    member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (timestamp) => {
    try {
      return format(new Date(timestamp), "h:mm a");
    } catch (e) {
      return "";
    }
  };

  const formatConversationTime = (timestamp) => {
    try {
      const messageDate = new Date(timestamp);
      const today = new Date();
      
      if (messageDate.toDateString() === today.toDateString()) {
        return format(messageDate, "h:mm a");
      } else {
        return format(messageDate, "MMM d");
      }
    } catch (e) {
      return "";
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">TaskFlowNet Chat</h1>
            <div className="flex items-center">
              <p className="mr-4 text-sm text-gray-600">
                Logged in as <span className="font-medium">{user?.email}</span>
              </p>
              <button 
                onClick={() => router.push('/team-dashboard')} 
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[75vh] flex">
          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* New Chat Button */}
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <PlusCircleIcon className="h-5 w-5" />
                <span>New Conversation</span>
              </button>
            </div>
            
            {/* Conversations List */}
            <div className="overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet. Start a new one!
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <li key={conversation.id}>
                      <button
                        onClick={() => handleSelectConversation(conversation)}
                        className={`w-full text-left p-3 hover:bg-gray-100 flex items-start transition-colors ${
                          activeConversation?.id === conversation.id ? "bg-indigo-50" : ""
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {conversation.type === "direct" ? (
                            <UserIcon className="h-10 w-10 rounded-full bg-gray-200 p-2 text-gray-600" />
                          ) : (
                            <UserGroupIcon className="h-10 w-10 rounded-full bg-gray-200 p-2 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-3 flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatConversationTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                        </div>
                        {conversation.unread > 0 && (
                          <span className="ml-2 bg-indigo-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
                  <div className="flex items-center">
                    {activeConversation.type === "direct" ? (
                      <UserIcon className="h-8 w-8 rounded-full bg-gray-200 p-1.5 text-gray-600" />
                    ) : (
                      <UserGroupIcon className="h-8 w-8 rounded-full bg-gray-200 p-1.5 text-gray-600" />
                    )}
                    <div className="ml-3">
                      <h2 className="text-lg font-medium text-gray-900">{activeConversation.name}</h2>
                      <p className="text-xs text-gray-500">
                        {activeConversation.type === "direct" ? "Direct Message" : "Group Chat"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => fetchMessages(activeConversation.id)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Refresh messages"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="mt-2 text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user?.email ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-3/4 rounded-lg px-4 py-2 shadow-sm ${
                              message.senderId === user?.email
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-gray-800"
                            }`}
                          >
                            {message.senderId !== user?.email && (
                              <p className="text-xs font-medium mb-1">
                                {message.senderName}
                              </p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            
                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, index) => (
                                  <div 
                                    key={index}
                                    className={`flex items-center p-2 rounded ${
                                      message.senderId === user?.email 
                                        ? "bg-indigo-700" 
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    <PaperClipIcon className="h-4 w-4 mr-2" />
                                    <a 
                                      href={attachment.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs underline"
                                    >
                                      {attachment.name}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === user?.email
                                  ? "text-indigo-200"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  {/* Attachments preview */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {attachments.map((file, index) => (
                        <div key={index} className="bg-gray-100 rounded-lg px-3 py-1 flex items-center">
                          <span className="text-xs text-gray-800 truncate max-w-xs">
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-end space-x-2">
                    <div className="relative flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                      <div className="absolute bottom-2 right-2 flex space-x-2">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaceSmileIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => fileInputRef.current.click()}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <PaperClipIcon className="h-5 w-5" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          multiple
                        />
                      </div>
                      {showEmojiPicker && (
                        <div className="absolute bottom-10 right-0 z-10">
                          <EmojiPicker
                            onEmojiClick={handleEmojiSelect}
                            width={300}
                            height={400}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={newMessage.trim() === "" && attachments.length === 0}
                      className={`p-2 rounded-full ${
                        newMessage.trim() === "" && attachments.length === 0
                          ? "bg-gray-200 text-gray-400"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center p-6">
                  <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-2 text-gray-500">
                    Choose an existing conversation or start a new one.
                  </p>
                  <button
                    onClick={() => setShowNewConversationModal(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between">
              <h3 className="text-lg font-medium text-gray-900">New Conversation</h3>
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Group name input (only show if multiple members selected) */}
              {selectedMembers.length > 1 && (
                <div className="mb-4">
                  <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    id="group-name"
                    value={newConversationName}
                    onChange={(e) => setNewConversationName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              
              {/* Search and select recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Recipients
                </label>
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleSelectAllMembers}
                    className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    {selectedMembers.length === teamMembers.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                
                {/* Selected members */}
                {selectedMembers.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Selected ({selectedMembers.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedMembers.map(member => (
                        <div key={member.id} className="bg-indigo-100 text-indigo-800 text-xs rounded-full px-2 py-1 flex items-center">
                          {member.name}
                          <button 
                            onClick={() => handleSelectMember(member)}
                            className="ml-1 text-indigo-500 hover:text-indigo-700"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Team members list */}
                <div className="border border-gray-200 rounded-md h-64 overflow-y-auto">
                  {filteredTeamMembers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No team members found
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {filteredTeamMembers.map(member => {
                        const isSelected = selectedMembers.some(m => m.id === member.id);
                        return (
                          <li key={member.id}>
                            <button
                              onClick={() => handleSelectMember(member)}
                              className={`w-full text-left p-3 flex items-center hover:bg-gray-50 ${
                                isSelected ? "bg-indigo-50" : ""
                              }`}
                            >
                              <div className="flex-shrink-0">
                                <UserIcon className="h-8 w-8 rounded-full bg-gray-200 p-1.5 text-gray-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                              {isSelected && (
                                <div className="ml-auto">
                                  <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={startNewConversation}
                disabled={selectedMembers.length === 0}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  selectedMembers.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Start Conversation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}