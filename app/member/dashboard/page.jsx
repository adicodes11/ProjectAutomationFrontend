"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Import any icons you want to use from Heroicons or elsewhere
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  BellAlertIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

// If you have a custom ProfileMenu or Chatbot, import them
import ProfileMenu from "@/components/ProfileMenu";
// import Chatbot from "@/components/Chatbot"; // If you want a floating chatbot

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TeamDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Fetch user role/email from session on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    const storedRole = sessionStorage.getItem("role");

    if (!storedEmail || storedRole !== "member") {
      router.push("/login");
      return;
    }

    setUser({ email: storedEmail, role: "member" });

    // --- MOCK FETCHING: replace with real API calls ---
    const fetchedTasks = [
      {
        id: 101,
        name: "Implement Payment Gateway",
        projectName: "Project Alpha",
        status: "In Progress",
        progress: 60, // percent
        dueDate: "2025-03-15",
      },
      {
        id: 102,
        name: "Fix UI Bugs",
        projectName: "Project Gamma",
        status: "Overdue",
        progress: 30,
        dueDate: "2025-03-05",
      },
      {
        id: 103,
        name: "Write Test Cases",
        projectName: "Project Beta",
        status: "Completed",
        progress: 100,
        dueDate: "2025-03-01",
      },
    ];
    setTasks(fetchedTasks);

    const fetchedNotifications = [
      { id: 1, message: "Deadline approaching for ‘Implement Payment Gateway’", type: "warning" },
      { id: 2, message: "Your manager commented on ‘Fix UI Bugs’", type: "info" },
    ];
    setNotifications(fetchedNotifications);

    const fetchedActivity = [
      { id: 1, activity: "You completed ‘Write Test Cases’", time: "2 hours ago" },
      { id: 2, activity: "You updated progress on ‘Implement Payment Gateway’", time: "1 day ago" },
    ];
    setActivityFeed(fetchedActivity);
  }, [router]);

  // Prepare chart data
  useEffect(() => {
    if (tasks.length > 0) {
      const labels = tasks.map((task) => task.name);
      const data = tasks.map((task) => task.progress);
      setChartData({
        labels,
        datasets: [
          {
            label: "Task Progress (%)",
            data,
            backgroundColor: "rgba(99, 102, 241, 0.6)", // Indigo-ish
          },
        ],
      });
    }
  }, [tasks]);

  // Navigation
  const handleTaskClick = (taskId) => {
    // Possibly go to /tasks/[taskId]
    router.push(`current-assigned-project`);
  };

  // Decide color for progress bar or status
  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    return "bg-yellow-500";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "Overdue":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  // Summaries
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const overdueTasks = tasks.filter((t) => t.status === "Overdue").length;

  // Hero / Header area with gradient
  const HeroSection = () => (
    <motion.div
      className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl shadow-xl overflow-hidden mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="p-8 space-y-4">
        <h1 className="text-3xl font-extrabold">
          Welcome, {user?.email || "Team Member"}!
        </h1>
        <p className="max-w-xl text-lg">
          Here’s your personalized overview of tasks and progress. Let’s stay productive and keep
          track of everything in one place.
        </p>
      </div>
    </motion.div>
  );

  // Summary Cards with animation
  const SummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md flex flex-col items-start"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Total Tasks</h3>
        </div>
        <p className="text-4xl font-bold text-gray-700">{totalTasks}</p>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-lg shadow-md flex flex-col items-start"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <CheckCircleIcon className="h-6 w-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-800">Completed Tasks</h3>
        </div>
        <p className="text-4xl font-bold text-gray-700">{completedTasks}</p>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-lg shadow-md flex flex-col items-start"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-800">Overdue Tasks</h3>
        </div>
        <p className="text-4xl font-bold text-gray-700">{overdueTasks}</p>
      </motion.div>
    </div>
  );

  // Task List
  const TaskList = () => (
    <motion.div
      className="bg-white rounded-lg shadow p-6 mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">My Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            whileHover={{ scale: 1.01 }}
            onClick={() => handleTaskClick(task.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-md font-medium text-gray-800">
                {task.name} <span className="text-sm text-gray-500">({task.projectName})</span>
              </p>
              <p className={`text-sm ${getStatusColor(task.status)}`}>{task.status}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${getProgressColor(task.progress)} h-2 rounded-full transition-all`}
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Due: {task.dueDate} — Progress: {task.progress}%
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // Notifications
  const NotificationsPanel = () => (
    <motion.div
      className="bg-white rounded-lg shadow p-6 mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-2 mb-4">
        <BellAlertIcon className="h-6 w-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
      </div>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((note) => (
            <li
              key={note.id}
              className={`p-2 rounded ${
                note.type === "warning"
                  ? "bg-yellow-50 border-l-4 border-yellow-400"
                  : "bg-blue-50 border-l-4 border-blue-400"
              }`}
            >
              <p className="text-sm text-gray-700">{note.message}</p>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );

  // Activity Feed
  const ActivityFeedPanel = () => (
    <motion.div
      className="bg-white rounded-lg shadow p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-2 mb-4">
        <ClockIcon className="h-6 w-6 text-indigo-500" />
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
      </div>
      {activityFeed.length === 0 ? (
        <p className="text-gray-500">No recent activity.</p>
      ) : (
        <ul className="space-y-3">
          {activityFeed.map((item) => (
            <li key={item.id} className="border-b pb-2 last:border-b-0">
              <p className="text-sm text-gray-700">{item.activity}</p>
              <p className="text-xs text-gray-400">{item.time}</p>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );

  // Chart
  const TaskProgressChart = () => {
    if (!chartData) return null;
    return (
      <motion.div
        className="bg-white p-6 rounded-lg shadow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <ChartBarIcon className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">My Task Progress</h3>
        </div>
        <div className="h-72">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: "Task Progress (%)" },
              },
              maintainAspectRatio: false,
            }}
          />
        </div>
      </motion.div>
    );
  };

  // If user is not set or we’re verifying
  if (!user) {
    return null; // or a loading screen
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top header / Profile bar */}
      <div className="flex items-center justify-between bg-white shadow p-4">
        <div>
          <h1 className="text-xl font-bold">Team Member Dashboard</h1>
          <p className="text-gray-600">Hello, {user.email}</p>
        </div>
        <ProfileMenu />
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <HeroSection />

        {/* Summary Cards */}
        <SummaryCards />

        {/* Main Grid: left = tasks & chart, right = notifications & activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TaskList />
            <TaskProgressChart />
          </div>

          <div className="space-y-6">
            <NotificationsPanel />
            <ActivityFeedPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
