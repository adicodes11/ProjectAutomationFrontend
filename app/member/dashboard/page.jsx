"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Import icons
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  BellAlertIcon,
  ClipboardDocumentCheckIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChevronRightIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  FlagIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

// Import components
import ProfileMenu from "@/components/ProfileMenu";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function TeamDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // References for scroll animations
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const headerScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Fetch user data and mock data
  useEffect(() => {
    const storedEmail =
      sessionStorage.getItem("email") || "team.member@example.com";
    const storedRole = sessionStorage.getItem("role") || "member";

    if (storedRole !== "member") {
      router.push("/login");
      return;
    }

    // Simulate loading
    setTimeout(() => {
      setUser({
        email: storedEmail,
        role: "member",
        name: storedEmail,
        avatar: "/profile_icon.png",
      });
      setIsLoading(false);
    }, 800);

    // --- MOCK FETCHING: replace with real API calls ---
    const fetchedTasks = [
      {
        id: 101,
        name: "Implement Payment Gateway",
        projectName: "Project Alpha",
        status: "In Progress",
        progress: 60,
        dueDate: "2025-03-15",
        priority: "High",
        description:
          "Integrate Stripe payment processing with the checkout flow",
      },
      {
        id: 102,
        name: "Fix UI Bugs",
        projectName: "Project Gamma",
        status: "Overdue",
        progress: 30,
        dueDate: "2025-03-05",
        priority: "Medium",
        description: "Resolve responsive layout issues on mobile devices",
      },
      {
        id: 103,
        name: "Write Test Cases",
        projectName: "Project Beta",
        status: "Completed",
        progress: 100,
        dueDate: "2025-03-01",
        priority: "Low",
        description: "Create unit tests for the authentication module",
      },
      {
        id: 104,
        name: "Design User Dashboard",
        projectName: "Project Delta",
        status: "In Progress",
        progress: 45,
        dueDate: "2025-03-20",
        priority: "Medium",
        description:
          "Create wireframes and high-fidelity designs for the user dashboard",
      },
      {
        id: 105,
        name: "API Documentation",
        projectName: "Project Alpha",
        status: "Not Started",
        progress: 0,
        dueDate: "2025-03-25",
        priority: "Low",
        description: "Document all API endpoints and parameters",
      },
    ];
    setTasks(fetchedTasks);

    const fetchedNotifications = [
      {
        id: 1,
        message: "Deadline approaching for 'Implement Payment Gateway'",
        type: "warning",
        time: "2 hours ago",
      },
      {
        id: 2,
        message: "Your manager commented on 'Fix UI Bugs'",
        type: "info",
        time: "3 hours ago",
      },
      {
        id: 3,
        message: "New task assigned: API Documentation",
        type: "success",
        time: "Yesterday",
      },
      {
        id: 4,
        message: "Team meeting scheduled for tomorrow at 10:00 AM",
        type: "info",
        time: "Yesterday",
      },
    ];
    setNotifications(fetchedNotifications);

    const fetchedActivity = [
      {
        id: 1,
        activity: "You completed 'Write Test Cases'",
        time: "2 hours ago",
      },
      {
        id: 2,
        activity: "You updated progress on 'Implement Payment Gateway'",
        time: "1 day ago",
      },
      {
        id: 3,
        activity: "Sara assigned you a new task: 'API Documentation'",
        time: "2 days ago",
      },
      { id: 4, activity: "You commented on 'Fix UI Bugs'", time: "3 days ago" },
      {
        id: 5,
        activity: "Weekly progress report generated",
        time: "1 week ago",
      },
    ];
    setActivityFeed(fetchedActivity);
  }, [router]);

  // Prepare chart data
  useEffect(() => {
    if (tasks.length > 0) {
      // Bar chart
      const labels = tasks.map((task) => task.name);
      const data = tasks.map((task) => task.progress);

      setBarChartData({
        labels,
        datasets: [
          {
            label: "Task Progress (%)",
            data,
            backgroundColor: [
              "rgba(99, 102, 241, 0.7)",
              "rgba(239, 68, 68, 0.7)",
              "rgba(16, 185, 129, 0.7)",
              "rgba(245, 158, 11, 0.7)",
              "rgba(139, 92, 246, 0.7)",
            ],
            borderColor: [
              "rgb(99, 102, 241)",
              "rgb(239, 68, 68)",
              "rgb(16, 185, 129)",
              "rgb(245, 158, 11)",
              "rgb(139, 92, 246)",
            ],
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      });

      // Line chart - mock weekly progress
      setLineChartData({
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "Tasks Completed",
            data: [2, 4, 3, 5],
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Tasks Assigned",
            data: [3, 6, 4, 7],
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      });
    }
  }, [tasks]);

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "inProgress") return task.status === "In Progress";
    if (activeTab === "completed") return task.status === "Completed";
    if (activeTab === "overdue") return task.status === "Overdue";
    return true;
  });

  // Navigation
  const handleTaskClick = (taskId) => {
    router.push(`/member/current-assigned-project`);
  };

  // Add your handleSignOut function right here, after handleTaskClick
  const handleSignOut = () => {
    // Clear all session storage items
    sessionStorage.clear();
    // Redirect to login page
    router.push("/login");
  };

  // Styling utils
  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "Overdue":
        return "text-red-600 bg-red-50 border-red-200";
      case "In Progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Not Started":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <FireIcon className="w-3 h-3 mr-1" />
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <FlagIcon className="w-3 h-3 mr-1" />
            Medium
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <FlagIcon className="w-3 h-3 mr-1" />
            Low
          </span>
        );
      default:
        return null;
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "info":
      default:
        return <BellAlertIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  // Summaries
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  const overdueTasks = tasks.filter((t) => t.status === "Overdue").length;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Loading skeleton component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Hero / Header area with gradient and parallax effect
  const HeroSection = () => (
    <motion.div
      ref={scrollRef}
      style={{
        opacity: headerOpacity,
        scale: headerScale,
      }}
      className="relative bg-gradient-to-br from-indigo-600 via-violet-500 to-purple-700 text-white rounded-2xl shadow-xl overflow-hidden mb-8"
      variants={heroVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute inset-0 bg-center opacity-10"></div>
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white rounded-full opacity-20 blur-xl"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-500 rounded-full opacity-20 blur-xl"></div>

      <div className="relative p-8 md:p-10 space-y-4 z-10">
        <div className="flex items-center space-x-4">
          {user?.avatar && (
            <div className="h-16 w-16 rounded-full border-4 border-white/30 overflow-hidden shadow-lg">
              <img
                src={user.avatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome, {user?.name || user?.email || "Team Member"}!
            </h1>
            <p className="text-indigo-100">Monday, May 12, 2025</p>
          </div>
        </div>

        <p className="max-w-xl text-lg text-indigo-100">
          Here's your personalized overview of tasks and progress. Let's make
          today productive!
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-white text-indigo-700 rounded-lg shadow-lg font-medium flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Task
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-indigo-700 bg-opacity-30 text-white border border-white/20 rounded-lg font-medium flex items-center gap-2 backdrop-blur-sm"
          >
            <CalendarIcon className="h-5 w-5" />
            View Schedule
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // Improved summary cards with hover effects
  const SummaryCards = () => (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        whileHover={{
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)",
        }}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Total Tasks</h3>
        </div>
        <p className="text-4xl font-bold text-gray-800 mt-2">{totalTasks}</p>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
          <span>5% more than last week</span>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.2)",
        }}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
        </div>
        <p className="text-4xl font-bold text-gray-800 mt-2">
          {completedTasks}
        </p>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
          <span>
            {((completedTasks / totalTasks) * 100).toFixed(0)}% completion rate
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)",
        }}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClockIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">In Progress</h3>
        </div>
        <p className="text-4xl font-bold text-gray-800 mt-2">
          {inProgressTasks}
        </p>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <ArrowTrendingUpIcon className="h-4 w-4 text-blue-500 mr-1" />
          <span>Moving steadily forward</span>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.2)",
        }}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Overdue</h3>
        </div>
        <p className="text-4xl font-bold text-gray-800 mt-2">{overdueTasks}</p>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
          <span>Needs immediate attention</span>
        </div>
      </motion.div>
    </motion.div>
  );

  // Enhanced task list with filters
  const TaskList = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
        <div className="flex overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg mr-2 transition-colors ${
              activeTab === "all"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setActiveTab("inProgress")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg mr-2 transition-colors ${
              activeTab === "inProgress"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg mr-2 transition-colors ${
              activeTab === "completed"
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab("overdue")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "overdue"
                ? "bg-red-100 text-red-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredTasks
            .slice(0, isTasksExpanded ? filteredTasks.length : 3)
            .map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 cursor-pointer group"
                onClick={() => handleTaskClick(task.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h4 className="text-md font-medium text-gray-800">
                      {task.name}
                    </h4>
                    <span className="text-sm text-gray-500">
                      ({task.projectName})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(task.priority)}
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  {task.description}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="w-full sm:w-3/4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${getProgressColor(
                            task.progress
                          )} h-2.5 rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                        {task.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Due: {task.dueDate}
                    <ChevronRightIcon className="h-4 w-4 ml-2 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {filteredTasks.length > 3 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsTasksExpanded(!isTasksExpanded)}
            className="w-full py-2 mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 text-center border border-dashed border-indigo-300 rounded-lg hover:border-indigo-400 transition-all"
          >
            {isTasksExpanded
              ? "Show Less"
              : `Show ${filteredTasks.length - 3} More Tasks`}
          </motion.button>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3"
            >
              <ClipboardDocumentCheckIcon className="h-8 w-8 text-gray-400" />
            </motion.div>
            <h3 className="text-gray-600 font-medium">No tasks found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {activeTab !== "all"
                ? "Try selecting a different filter"
                : "You're all caught up!"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Enhanced notifications with animations
  const NotificationsPanel = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <BellAlertIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
        </div>
        {notifications.length > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full">
            {notifications.length} new
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No notifications.</p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence>
            {notifications.map((note) => (
              <motion.li
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ x: 5 }}
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer ${
                  note.type === "warning"
                    ? "bg-yellow-50 border-l-4 border-yellow-400"
                    : note.type === "success"
                    ? "bg-green-50 border-l-4 border-green-400"
                    : "bg-blue-50 border-l-4 border-blue-400"
                }`}
              >
                {getNotificationIcon(note.type)}
                <div>
                  <p className="text-sm text-gray-700">{note.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{note.time}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {notifications.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 text-center border border-dashed border-indigo-300 rounded-lg hover:border-indigo-400 transition-all"
        >
          View All Notifications
        </motion.button>
      )}
    </motion.div>
  );

  // Enhanced activity feed with animations
  const ActivityFeedPanel = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <ClockIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Activity
          </h3>
        </div>
      </div>

      {activityFeed.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent activity.</p>
      ) : (
        <ul className="space-y-4">
          {activityFeed.map((item, index) => (
            <motion.li
              key={item.id}
              className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-b-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-indigo-100 w-2 h-2 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{item.activity}</p>
                <p className="text-xs text-gray-400 mt-1">{item.time}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );

  // Enhanced chart layout with tabs
  const ChartsPanel = () => {
    const [activeChart, setActiveChart] = useState("bar");

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Performance Analytics
            </h3>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveChart("bar")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeChart === "bar"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Task Progress
            </button>
            <button
              onClick={() => setActiveChart("line")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeChart === "line"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Weekly Progress
            </button>
          </div>
        </div>

        <div className="h-80">
          <AnimatePresence mode="wait">
            {activeChart === "bar" && barChartData && (
              <motion.div
                key="bar-chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "rgba(67, 56, 202, 0.8)",
                        titleFont: { size: 13 },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 6,
                        displayColors: false,
                      },
                    },
                    animation: {
                      duration: 1000,
                      easing: "easeOutQuart",
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                          display: true,
                          drawBorder: false,
                          color: "rgba(226, 232, 240, 0.7)",
                        },
                        ticks: {
                          font: { size: 11 },
                          color: "#64748b",
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                          drawBorder: false,
                        },
                        ticks: {
                          font: { size: 11 },
                          color: "#64748b",
                        },
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                />
              </motion.div>
            )}

            {activeChart === "line" && lineChartData && (
              <motion.div
                key="line-chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          boxWidth: 12,
                          usePointStyle: true,
                          pointStyle: "circle",
                          font: { size: 11 },
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(67, 56, 202, 0.8)",
                        titleFont: { size: 13 },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 6,
                      },
                    },
                    animation: {
                      duration: 1000,
                      easing: "easeOutQuart",
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          display: true,
                          drawBorder: false,
                          color: "rgba(226, 232, 240, 0.7)",
                        },
                        ticks: {
                          font: { size: 11 },
                          color: "#64748b",
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                          drawBorder: false,
                        },
                        ticks: {
                          font: { size: 11 },
                          color: "#64748b",
                        },
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  // Enhanced profile menu
  const EnhancedProfileMenu = () => (
    <div className="relative group">
      <div className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200">
          <img
            src={user?.avatar || "https://i.pravatar.cc/150?img=32"}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-700">
            {user?.name || user?.email}
          </p>
          <p className="text-xs text-gray-500">Team Member</p>
        </div>
        <CogIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block z-10">
        <ul>
          <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center space-x-2">
            <UserCircleIcon className="h-4 w-4 text-gray-500" />
            <span>Profile Settings</span>
          </li>
          <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center space-x-2">
            <CogIcon className="h-4 w-4 text-gray-500" />
            <span>Preferences</span>
          </li>
          <li
            onClick={handleSignOut}
            className="border-t border-gray-100 mt-1 pt-1 px-4 py-2 hover:bg-red-50 cursor-pointer text-sm text-red-600 flex items-center space-x-2"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span>Sign Out</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced top header / Profile bar with glass effect */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
              Team Member Dashboard
            </h1>
          </div>
          <EnhancedProfileMenu />
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <HeroSection />

        {/* Summary Cards */}
        <SummaryCards />

        {/* Main Grid: left = tasks & chart, right = notifications & activity */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="lg:col-span-2 space-y-6">
            <TaskList />
            <ChartsPanel />
          </div>

          <div className="space-y-6">
            <NotificationsPanel />
            <ActivityFeedPanel />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
