"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ProfileMenu from "@/components/ProfileMenu";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch user details from sessionStorage
    const storedEmail = sessionStorage.getItem("email");
    if (!storedEmail) {
      router.push("/login");
      return;
    }
    setUser({ email: storedEmail });

    // Fetch user's projects (Replace this with your API call)
    const fetchedProjects = [
      { id: 1, name: "Project Alpha", status: "In Progress", progress: 70 },
      { id: 2, name: "Project Beta", status: "Completed", progress: 100 },
      { id: 3, name: "Project Gamma", status: "In Progress", progress: 45 },
    ];
    setProjects(fetchedProjects);

    // Fetch notifications (Replace with API call)
    setNotifications([
      { id: 1, message: "Task XYZ is overdue", type: "warning" },
      { id: 2, message: "New comment on Project Alpha", type: "info" },
    ]);

    // Fetch activity feed (Replace with API call)
    setActivityFeed([
      { id: 1, activity: "John completed task A", time: "2 hours ago" },
      { id: 2, activity: "Project Beta was marked as completed", time: "1 day ago" },
      { id: 3, activity: "New project Project Gamma was created", time: "3 days ago" },
    ]);
  }, [router]);

  useEffect(() => {
    // Prepare chart data when projects are fetched/updated
    if (projects.length > 0) {
      const labels = projects.map((proj) => proj.name);
      const data = projects.map((proj) => proj.progress);
      setChartData({
        labels,
        datasets: [
          {
            label: "Project Progress (%)",
            data,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      });
    }
  }, [projects]);

  const handleProjectClick = (projectId) => {
    router.push(`/projects/${projectId}`);
  };

  const startNewProject = () => {
    router.push("/manager/new-project");
  };

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-64 bg-white shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Projects</h2>
      {projects.map((project) => (
        <div
          key={project.id}
          className="p-4 bg-gray-100 rounded-lg mb-4 cursor-pointer hover:bg-gray-200"
          onClick={() => handleProjectClick(project.id)}
        >
          <p className="font-medium">{project.name}</p>
          <p className="text-sm text-gray-600">Status: {project.status}</p>
        </div>
      ))}
      <button
        className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        onClick={startNewProject}
      >
        New Project
      </button>
      {/* Button for Chat with Documents */}
      <button
        className="w-full mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        onClick={() => router.push("/manager/chat_with_documents")}
      >
        Chat with Documents
      </button>
    </div>
  );

  // Header Component using ProfileMenu instead of a button.
  const Header = () => (
    <div className="flex items-center justify-between bg-white shadow p-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.email || "User"}</p>
      </div>
      <ProfileMenu />
    </div>
  );

  // Summary Cards Component
  const SummaryCards = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "In Progress").length;
    const completedProjects = projects.filter((p) => p.status === "Completed").length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold">Total Projects</h3>
          <p className="text-3xl font-bold">{totalProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold">Active Projects</h3>
          <p className="text-3xl font-bold">{activeProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold">Completed Projects</h3>
          <p className="text-3xl font-bold">{completedProjects}</p>
        </div>
      </div>
    );
  };

  // Project Progress Chart Component
  const ProjectProgressChart = () => {
    if (!chartData) return null;
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">Project Progress Overview</h3>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Project Progress (%)" },
            },
          }}
        />
      </div>
    );
  };

  // Recent Activity Component
  const RecentActivity = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
      <ul>
        {activityFeed.map((item) => (
          <li key={item.id} className="mb-3 border-b pb-2">
            <p>{item.activity}</p>
            <p className="text-sm text-gray-500">{item.time}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  // Notifications Component
  const Notifications = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-xl font-semibold mb-4">Notifications</h3>
      <ul>
        {notifications.map((note) => (
          <li
            key={note.id}
            className={`mb-3 p-2 rounded ${
              note.type === "warning"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {note.message}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <SummaryCards />
          <ProjectProgressChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Notifications />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
