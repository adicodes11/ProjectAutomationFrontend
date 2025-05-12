"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowRightCircleIcon,
  UserCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from "chart.js";
import ProfileMenu from "@/components/ProfileMenu";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Mock data for weekly progress
const mockWeeklyData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Tasks Completed",
      data: [1, 2, 0, 3, 2, 1, 0],
      fill: true,
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      borderColor: "rgba(59, 130, 246, 0.8)",
      tension: 0.4,
    },
  ],
};

export default function TeamMemberDashboard() {
  const router = useRouter();
  const [teamAssignment, setTeamAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTaskDescription, setUpdatingTaskDescription] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [darkMode, setDarkMode] = useState(false);

  // Retrieve logged-in user's email from sessionStorage
  const email = typeof window !== "undefined" ? sessionStorage.getItem("email") : null;

  useEffect(() => {
    if (!email) {
      router.push("/login");
      return;
    }
    
    const fetchAssignment = async () => {
      try {
        const res = await fetch(`/api/getTeamAssignment?email=${email}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to fetch assignments");
        } else {
          setTeamAssignment(data.teamAssignment);
        }
      } catch (err) {
        setError("Failed to fetch assignments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignment();
    
    // Hide welcome animation after 2 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [email, router]);

  // Update task status by matching on task.description
  const updateTaskStatus = async (taskDescription, newStatus) => {
    if (!teamAssignment) return;
    setUpdatingTaskDescription(taskDescription);
    try {
      const updatedTask = {
        status: newStatus,
        progress: newStatus === "Completed" ? 100 : 0,
      };
      const res = await fetch("/api/updateTaskStatus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          taskDescription,
          updatedTask,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update task");
      } else {
        // Update local state by matching task description
        const updatedTasks = teamAssignment.tasks.map((task) =>
          task.description === taskDescription ? { ...task, ...updatedTask } : task
        );
        setTeamAssignment({ ...teamAssignment, tasks: updatedTasks });
      }
    } catch (err) {
      setError("Failed to update task");
    } finally {
      setUpdatingTaskDescription(null);
    }
  };

  // Prepare chart data for Completed vs Pending tasks
  const getChartData = () => {
    if (!teamAssignment || !teamAssignment.tasks) return null;
    const tasks = teamAssignment.tasks;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const pending = tasks.length - completed;
    return {
      labels: ["Completed", "Pending"],
      datasets: [
        {
          label: "Task Status",
          data: [completed, pending],
          backgroundColor: [
            "rgba(16, 185, 129, 0.8)", // Green
            "rgba(99, 102, 241, 0.8)", // Indigo
          ],
          borderColor: [
            "rgba(16, 185, 129, 1)",
            "rgba(99, 102, 241, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Priority distribution data
  const getPriorityData = () => {
    if (!teamAssignment || !teamAssignment.tasks) return null;
    const tasks = teamAssignment.tasks;
    const high = tasks.filter(t => t.priority === "High").length || 1;
    const medium = tasks.filter(t => t.priority === "Medium").length || 2;
    const low = tasks.filter(t => t.priority === "Low").length || 3;
    
    return {
      labels: ["High", "Medium", "Low"],
      datasets: [
        {
          data: [high, medium, low],
          backgroundColor: [
            "rgba(239, 68, 68, 0.8)", // Red
            "rgba(245, 158, 11, 0.8)", // Amber
            "rgba(16, 185, 129, 0.8)", // Green
          ],
          borderColor: [
            "rgba(239, 68, 68, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(16, 185, 129, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getCompletionPercentage = () => {
    if (!teamAssignment || !teamAssignment.tasks || !teamAssignment.tasks.length) return 0;
    const completed = teamAssignment.tasks.filter(t => t.status === "Completed").length;
    return Math.round((completed / teamAssignment.tasks.length) * 100);
  };

  // Loading screen animation
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div
            className={`w-24 h-24 rounded-full border-4 border-t-transparent ${darkMode ? "border-blue-400" : "border-blue-600"}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-8 text-2xl font-bold ${darkMode ? "text-blue-300" : "text-blue-700"}`}
          >
            Loading your dashboard...
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "300px" }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`mt-4 h-1 ${darkMode ? "bg-blue-400" : "bg-blue-600"} rounded-full`}
          />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-red-50"}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl p-10 max-w-md mx-auto text-center"
        >
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 text-xl font-bold mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!teamAssignment) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-8"
        >
          <div className="w-24 h-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xl font-semibold">No assignments found for your account.</p>
          <p className="mt-2 text-gray-500">Please contact your team administrator for assistance.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"}`}>
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-white"
            >
              <motion.h1
                className="text-5xl font-bold mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Welcome to Your Dashboard
              </motion.h1>
              <motion.p
                className="text-xl opacity-90"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {getWelcomeMessage()}, {email?.split('@')[0]}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-6">
        {/* Header with profile menu */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className={`flex items-center justify-between ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 mb-8`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${darkMode ? "bg-blue-900" : "bg-blue-100"}`}>
              <BriefcaseIcon className={`h-8 w-8 ${darkMode ? "text-blue-300" : "text-blue-600"}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Team Member Dashboard
              </h1>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {getWelcomeMessage()}, {email?.split('@')[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-100 text-gray-600"} transition-colors`}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <ProfileMenu />
          </div>
        </motion.div>

        {/* Dashboard Stats Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Stat Card 1 - Tasks Completion */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 border-l-4 border-blue-500`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Tasks Completion
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {getCompletionPercentage()}%
                </h3>
              </div>
              <div className={`p-3 rounded-full ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                <CheckCircleIcon className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
            </div>
            <div className="mt-4">
              <div className={`w-full h-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCompletionPercentage()}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Stat Card 2 - Total Tasks */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 border-l-4 border-indigo-500`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Total Tasks
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {teamAssignment.tasks?.length || 0}
                </h3>
              </div>
              <div className={`p-3 rounded-full ${darkMode ? "bg-indigo-900/30" : "bg-indigo-100"}`}>
                <BriefcaseIcon className={`h-6 w-6 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
              </div>
            </div>
            <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {teamAssignment.tasks?.filter(t => t.status === "Completed").length || 0} completed tasks
            </p>
          </motion.div>

          {/* Stat Card 3 - Next Deadline */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 border-l-4 border-purple-500`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Next Deadline
                </p>
                <h3 className="text-xl font-bold mt-1">
                  {teamAssignment.tasks?.filter(t => t.status !== "Completed" && t.deadline)
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]?.deadline 
                    ? formatDate(teamAssignment.tasks.filter(t => t.status !== "Completed" && t.deadline)
                        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0].deadline)
                    : "No deadlines"}
                </h3>
              </div>
              <div className={`p-3 rounded-full ${darkMode ? "bg-purple-900/30" : "bg-purple-100"}`}>
                <CalendarIcon className={`h-6 w-6 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
              </div>
            </div>
            <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {new Date() > new Date(teamAssignment.tasks?.filter(t => t.status !== "Completed" && t.deadline)
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]?.deadline) 
                ? "Overdue!" : "Coming up"}
            </p>
          </motion.div>

          {/* Stat Card 4 - Team Performance */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 border-l-4 border-green-500`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  My Performance
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {getCompletionPercentage() > 70 ? "Great" : getCompletionPercentage() > 40 ? "Good" : "Needs Focus"}
                </h3>
              </div>
              <div className={`p-3 rounded-full ${darkMode ? "bg-green-900/30" : "bg-green-100"}`}>
                <ArrowTrendingUpIcon className={`h-6 w-6 ${darkMode ? "text-green-400" : "text-green-600"}`} />
              </div>
            </div>
            <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Based on task completion rate
            </p>
          </motion.div>
        </motion.div>

        {/* Main Dashboard Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column (Tasks) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:w-2/3"
          >
            {/* Tab Navigation */}
            <div className={`flex mb-6 ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} rounded-lg p-1 shadow-md`}>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex items-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                  activeTab === "tasks"
                    ? darkMode
                      ? "bg-blue-900/30 text-blue-300"
                      : "bg-blue-100/80 text-blue-700"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BriefcaseIcon className="h-5 w-5" />
                <span>Tasks</span>
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                  activeTab === "analytics"
                    ? darkMode
                      ? "bg-blue-900/30 text-blue-300"
                      : "bg-blue-100/80 text-blue-700"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Analytics</span>
              </button>
            </div>

            {/* Tasks Panel */}
            {activeTab === "tasks" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-xl p-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    Your Tasks
                  </h2>
                  <div className={`px-4 py-2 rounded-full text-sm ${
                    getCompletionPercentage() > 70
                      ? darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
                      : darkMode ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {getCompletionPercentage()}% completed
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {teamAssignment.tasks && teamAssignment.tasks.length > 0 ? (
                      teamAssignment.tasks.map((task, index) => (
                        <motion.div
                          key={task.description}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          className={`${
                            darkMode 
                              ? task.status === "Completed" ? "bg-gray-700/50" : "bg-gray-700"
                              : task.status === "Completed" ? "bg-gray-50" : "bg-white"
                          } p-5 rounded-xl border ${
                            darkMode ? "border-gray-700" : "border-gray-200"
                          } shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200`}
                        >
                          <div className="flex items-center space-x-4">
                            {task.status === "Completed" ? (
                              <div className={`rounded-full p-2 ${darkMode ? "bg-green-900/30" : "bg-green-100"}`}>
                                <CheckCircleIcon className={`h-6 w-6 ${darkMode ? "text-green-400" : "text-green-600"}`} />
                              </div>
                            ) : (
                              <div className={`rounded-full p-2 ${darkMode ? "bg-blue-900/30" : "bg-blue-100"}`}>
                                <ClockIcon className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                              </div>
                            )}
                            <div>
                              <p className={`text-lg font-medium ${task.status === "Completed" ? "line-through opacity-70" : ""} ${darkMode ? "text-white" : "text-gray-800"}`}>
                                {task.description}
                              </p>
                              {task.deadline && (
                                <div className="flex items-center mt-1">
                                  <CalendarIcon className={`h-4 w-4 mr-1 ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  }`} />
                                  <p className={`text-sm ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  }`}>
                                    Due: {formatDate(task.deadline)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm px-3 py-1 rounded-full ${
                              task.priority === "High" 
                                ? darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-600"
                                : task.priority === "Medium"
                                ? darkMode ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-100 text-yellow-600"
                                : darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"
                            }`}>
                              {task.priority || "Normal"}
                            </span>
                            
                            {task.status !== "Completed" && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateTaskStatus(task.description, "Completed")}
                                disabled={updatingTaskDescription === task.description}
                                className={`flex items-center px-3 py-1.5 rounded ${
                                  darkMode 
                                    ? "bg-blue-600 hover:bg-blue-700" 
                                    : "bg-blue-500 hover:bg-blue-600"
                                } text-white transition-colors shadow-sm`}
                              >
                                {updatingTaskDescription === task.description ? (
                                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                )}
                                {updatingTaskDescription === task.description ? "Updating..." : "Complete"}
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-10 text-center rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                      >
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <BriefcaseIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <p className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>No tasks assigned.</p>
                        <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          When tasks are assigned, they will appear here.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Analytics Panel */}
            {activeTab === "analytics" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-xl p-6`}
              >
                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Task Analytics
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weekly Progress Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                      Weekly Progress
                    </h3>
                    <div className="h-64">
                      <Line 
                        data={mockWeeklyData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: { color: darkMode ? '#9ca3af' : '#4b5563' }
                            },
                            x: {
                              ticks: { color: darkMode ? '#9ca3af' : '#4b5563' }
                            }
                          },
                          plugins: {
                            legend: { 
                              labels: { color: darkMode ? '#e5e7eb' : '#1f2937' } 
                            }
                          },
                          elements: {
                            point: {
                              radius: 5,
                              hoverRadius: 7
                            }
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                  
                  {/* Status Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                      Task Status
                    </h3>
                    {getChartData() && (
                      <div className="h-64">
                        <Doughnut
                          data={getChartData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { 
                                position: 'bottom',
                                labels: { color: darkMode ? '#e5e7eb' : '#1f2937' }
                              }
                            },
                            cutout: '65%'
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Task Priority Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                      Task Priority Distribution
                    </h3>
                    {getPriorityData() && (
                      <div className="h-64">
                        <Bar
                          data={getPriorityData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y',
                            scales: {
                              y: {
                                ticks: { color: darkMode ? '#9ca3af' : '#4b5563' }
                              },
                              x: {
                                beginAtZero: true,
                                ticks: { color: darkMode ? '#9ca3af' : '#4b5563' }
                              }
                            },
                            plugins: {
                              legend: { 
                                display: false
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Performance Metrics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      {/* Completion Rate */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Completion Rate
                          </span>
                          <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {getCompletionPercentage()}%
                          </span>
                        </div>
                        <div className={`w-full h-2 ${darkMode ? "bg-gray-600" : "bg-gray-200"} rounded-full`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${getCompletionPercentage()}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full rounded-full ${
                              getCompletionPercentage() > 70
                                ? "bg-green-500"
                                : getCompletionPercentage() > 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                        </div>
                      </div>
                      
                      {/* On-Time Completion */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            On-Time Completion
                          </span>
                          <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            85%
                          </span>
                        </div>
                        <div className={`w-full h-2 ${darkMode ? "bg-gray-600" : "bg-gray-200"} rounded-full`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{ duration: 1 }}
                            className="h-full rounded-full bg-blue-500"
                          />
                        </div>
                      </div>
                      
                      {/* Task Quality */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Task Quality
                          </span>
                          <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            92%
                          </span>
                        </div>
                        <div className={`w-full h-2 ${darkMode ? "bg-gray-600" : "bg-gray-200"} rounded-full`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "92%" }}
                            transition={{ duration: 1 }}
                            className="h-full rounded-full bg-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column (Activities & Resources) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:w-1/3 space-y-8"
          >
            {/* Team Activity */}
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-xl p-6`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"} flex items-center`}>
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Team Activity
              </h2>
              
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      darkMode ? "bg-gray-700 hover:bg-gray-650" : "bg-gray-50 hover:bg-gray-100"
                    } transition-colors`}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      ["from-blue-400 to-blue-600", "from-green-400 to-green-600", "from-purple-400 to-purple-600", "from-red-400 to-red-600"][index]
                    } flex items-center justify-center text-white font-bold text-lg`}>
                      {["JD", "AR", "TK", "MP"][index]}
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {["John Doe completed Task A", "Alex Rodriguez updated Project B", "Tina Kim added a comment", "Mark Philips uploaded a file"][index]}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {["2 hours ago", "Yesterday", "2 days ago", "3 days ago"][index]}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <button className={`mt-4 w-full py-2 text-center text-sm rounded-lg transition-colors ${
                darkMode ? "bg-gray-700 text-blue-400 hover:bg-gray-650" : "bg-gray-100 text-blue-600 hover:bg-gray-200"
              }`}>
                View all team activity
              </button>
            </div>
            
            {/* Upcoming Deadlines */}
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-xl p-6`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"} flex items-center`}>
                <CalendarIcon className="h-5 w-5 mr-2" />
                Upcoming Deadlines
              </h2>
              
              <div className="space-y-3">
                {teamAssignment.tasks
                  .filter(t => t.status !== "Completed" && t.deadline)
                  .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                  .slice(0, 3)
                  .map((task, index) => (
                    <motion.div
                      key={task.description}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          new Date() > new Date(task.deadline)
                            ? darkMode ? "bg-red-900/30" : "bg-red-100"
                            : darkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                        }`}>
                          <ClockIcon className={`h-5 w-5 ${
                            new Date() > new Date(task.deadline)
                              ? darkMode ? "text-red-400" : "text-red-600"
                              : darkMode ? "text-yellow-400" : "text-yellow-600"
                          }`} />
                        </div>
                        <span className={`font-medium ${darkMode ? "text-white" : "text-gray-800"} truncate max-w-xs`}>
                          {task.description}
                        </span>
                      </div>
                      <span className={`text-sm ${
                        new Date() > new Date(task.deadline)
                          ? darkMode ? "text-red-400" : "text-red-600"
                          : darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {formatDate(task.deadline)}
                      </span>
                    </motion.div>
                  ))}
                  
                {(!teamAssignment.tasks || 
                  !teamAssignment.tasks.filter(t => t.status !== "Completed" && t.deadline).length) && (
                  <div className={`p-4 text-center rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      No upcoming deadlines.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Access */}
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-xl p-6`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"} flex items-center`}>
                <ArrowRightCircleIcon className="h-5 w-5 mr-2" />
                Quick Access
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Project Files", color: "blue" },
                  { name: "Team Chat", color: "green" },
                  { name: "Calendar", color: "purple" },
                  { name: "Reports", color: "amber" }
                ].map((item, index) => (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`p-4 rounded-lg ${
                      darkMode
                        ? `bg-${item.color}-900/20 hover:bg-${item.color}-900/30 text-${item.color}-300`
                        : `bg-${item.color}-50 hover:bg-${item.color}-100 text-${item.color}-700`
                    } font-medium text-center transition-colors`}
                  >
                    {item.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`mt-8 p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"} text-sm`}
        >
          &copy; {new Date().getFullYear()} Team Task Management Dashboard. All rights reserved.
        </motion.div>
      </div>
    </div>
  );
}