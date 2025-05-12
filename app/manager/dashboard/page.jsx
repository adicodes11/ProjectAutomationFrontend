"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ProfileMenu from "@/components/ProfileMenu";
import { Calendar, ChevronRight, PlusCircle, MessageSquare, Clock, Bell, Activity } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [donutChartData, setDonutChartData] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamMembers: 8,
    tasksCompleted: 47
  });
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  useEffect(() => {
    // Fetch user details from sessionStorage
    const storedEmail = sessionStorage.getItem("email");
    if (!storedEmail) {
      router.push("/login");
      return;
    }
    setUser({ email: storedEmail, name: storedEmail.split("@")[0] });

    // Fetch project stats from API
    const fetchProjectStats = async () => {
      try {
        const response = await fetch('/api/getProjectStats');
        if (!response.ok) {
          throw new Error('Failed to fetch project stats');
        }
        const data = await response.json();
        
        // Update stats
        setStats({
          totalProjects: data.totalProjects || 12,
          activeProjects: data.activeProjects || 8,
          completedProjects: data.completedProjects || 4,
          teamMembers: 8,
          tasksCompleted: 47
        });
        
        // Update projects data for sidebar
        setProjects(data.projectProgress?.map((project, index) => ({
          id: project._id || index + 1,
          name: project.name || `Project ${index + 1}`,
          status: project.status || (project.progress === 100 ? "Completed" : "In Progress"),
          progress: project.progress || Math.floor(Math.random() * 100),
          deadline: new Date(Date.now() + (Math.random() * 20 * 86400000)).toLocaleDateString(),
          members: Math.floor(Math.random() * 5) + 1
        })) || generateMockProjects());
        
        // Update activity feed
        setActivityFeed(data.recentActivities?.map((activity, index) => ({
          id: activity._id || index + 1,
          activity: `${activity.name} was ${activity.status}`,
          time: new Date(activity.updatedAt).toLocaleString(),
          user: "Team Member " + (index % 4 + 1)
        })) || generateMockActivities());
      } catch (error) {
        console.error("Error fetching project stats:", error);
        // Generate mock data if API fails
        setProjects(generateMockProjects());
        setActivityFeed(generateMockActivities());
      }
    };

    fetchProjectStats();

    // Fetch notifications (Replace with API call)
    setNotifications([
      { id: 1, message: "Project Alpha deadline approaching", type: "warning", time: "2 hours ago" },
      { id: 2, message: "New comment on Project Beta", type: "info", time: "4 hours ago" },
      { id: 3, message: "Team meeting scheduled for tomorrow", type: "info", time: "Yesterday" },
      { id: 4, message: "Task XYZ is overdue", type: "warning", time: "2 days ago" },
    ]);
  }, [router]);

  // Generate mock data for demo purposes
  const generateMockProjects = () => {
    return Array(6).fill().map((_, i) => ({
      id: i + 1,
      name: `Project ${String.fromCharCode(65 + i)}`,
      status: i % 3 === 0 ? "Completed" : i % 3 === 1 ? "In Progress" : "Planning",
      progress: i % 3 === 0 ? 100 : Math.floor(Math.random() * 80) + 10,
      deadline: new Date(Date.now() + (Math.random() * 20 * 86400000)).toLocaleDateString(),
      members: Math.floor(Math.random() * 5) + 1
    }));
  };

  const generateMockActivities = () => {
    const activities = [
      "Updated design for", 
      "Completed task in", 
      "Added new feature to", 
      "Started working on", 
      "Reviewed code for"
    ];
    return Array(5).fill().map((_, i) => ({
      id: i + 1,
      activity: `${activities[i % activities.length]} Project ${String.fromCharCode(65 + (i % 6))}`,
      time: new Date(Date.now() - (i * 3600000)).toLocaleString(),
      user: "Team Member " + (i % 4 + 1)
    }));
  };

  useEffect(() => {
    // Prepare chart data when projects are fetched/updated
    if (projects.length > 0) {
      const projectNames = projects.map(proj => proj.name);
      const progressData = projects.map(proj => proj.progress);
      
      // Bar chart data
      setBarChartData({
        labels: projectNames,
        datasets: [
          {
            label: "Progress (%)",
            data: progressData,
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      });
      
      // Line chart showing project progress over time (simulated)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      setLineChartData({
        labels: months,
        datasets: [
          {
            label: 'Completed Tasks',
            data: [12, 19, 25, 32, 39, 47],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'New Tasks',
            data: [15, 22, 28, 35, 41, 50],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      });
      
      // Donut chart for project status distribution
      const statusCounts = {
        Completed: 0,
        "In Progress": 0,
        Planning: 0
      };
      
      projects.forEach(project => {
        statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
      });
      
      setDonutChartData({
        labels: Object.keys(statusCounts),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
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

  const chatWithDocuments = () => {
    router.push("/manager/chat_with_documents");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Sidebar Component with better styling
  const Sidebar = () => (
    <div className={`${isMenuOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 h-screen sticky top-0`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <h2 className={`font-bold text-xl ${!isMenuOpen && 'hidden'}`}>ProjectHub</h2>
        <button 
          onClick={toggleMenu} 
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className={`h-5 w-5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <div className="p-4">
        <div className={`flex items-center justify-between mb-6 ${!isMenuOpen && 'justify-center'}`}>
          <h3 className={`font-semibold text-gray-400 ${!isMenuOpen && 'hidden'}`}>PROJECTS</h3>
          {isMenuOpen && (
            <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
              {projects.length}
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          {projects.slice(0, 5).map((project) => (
            <div
              key={project.id}
              className="p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors flex items-center"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className={`h-2 w-2 rounded-full mr-3 ${
                project.status === "Completed" ? "bg-green-400" :
                project.status === "In Progress" ? "bg-blue-400" : "bg-yellow-400"
              }`}></div>
              {isMenuOpen ? (
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{project.name}</p>
                  <div className="mt-1 bg-gray-700 h-1.5 rounded-full w-full">
                    <div 
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {project.name.charAt(0)}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-2">
          <button
            className={`w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700`}
            onClick={startNewProject}
          >
            <PlusCircle size={18} />
            {isMenuOpen && <span>New Project</span>}
          </button>
          
          <button
            className={`w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700`}
            onClick={chatWithDocuments}
          >
            <MessageSquare size={18} />
            {isMenuOpen && <span>Chat with Documents</span>}
          </button>
        </div>
      </div>
    </div>
  );

  // Modern Header Component
  const Header = () => (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <div className="ml-6 text-gray-500 hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          </button>
          <ProfileMenu />
        </div>
      </div>
    </div>
  );

  // Modern Stat Cards
  const StatCards = () => {
    const cards = [
      { 
        title: "Total Projects", 
        value: stats.totalProjects, 
        icon: <Activity className="h-12 w-12 text-indigo-500 opacity-80" />,
        color: "from-indigo-500 to-purple-500"
      },
      { 
        title: "Active Projects", 
        value: stats.activeProjects, 
        icon: <Activity className="h-12 w-12 text-blue-500 opacity-80" />,
        color: "from-blue-500 to-cyan-500"
      },
      { 
        title: "Completed", 
        value: stats.completedProjects, 
        icon: <Activity className="h-12 w-12 text-green-500 opacity-80" />,
        color: "from-green-500 to-emerald-500"
      },
      { 
        title: "Tasks Completed", 
        value: stats.tasksCompleted, 
        icon: <Activity className="h-12 w-12 text-amber-500 opacity-80" />,
        color: "from-amber-500 to-orange-500"
      }
    ];
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
                </div>
                {card.icon}
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full mt-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                  style={{ width: Math.min(100, card.value * 10) + '%' }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Project Progress Chart Component
  const ProjectProgressChart = () => {
    if (!barChartData) return null;
    
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Project Progress</h3>
          <select className="text-sm border rounded-lg px-3 py-2 bg-gray-50">
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="h-80">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { 
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  padding: 12,
                  bodyFont: { size: 14 },
                  titleFont: { size: 16 }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: { font: { size: 12 } },
                  grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                  ticks: { font: { size: 12 } },
                  grid: { display: false }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  // Task Completion Trend Chart
  const TaskCompletionChart = () => {
    if (!lineChartData) return null;
    
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Task Completion Trend</h3>
          <select className="text-sm border rounded-lg px-3 py-2 bg-gray-50">
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
        <div className="h-80">
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { 
                  position: 'top',
                  labels: { font: { size: 12 }, usePointStyle: true, boxWidth: 6 }
                },
                tooltip: { 
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  padding: 12,
                  bodyFont: { size: 14 },
                  titleFont: { size: 16 }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { font: { size: 12 } },
                  grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                  ticks: { font: { size: 12 } },
                  grid: { display: false }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  // Project Status Chart
  const ProjectStatusChart = () => {
    if (!donutChartData) return null;
    
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-6">Project Status</h3>
        <div className="h-64 flex items-center justify-center">
          <Doughnut
            data={donutChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                legend: { 
                  position: 'bottom',
                  labels: { font: { size: 12 }, usePointStyle: true, boxWidth: 6 }
                },
                tooltip: { 
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  padding: 12,
                  bodyFont: { size: 14 },
                  titleFont: { size: 16 }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  // Recent Activity Component
  const RecentActivity = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
      </div>
      <div className="space-y-4">
        {activityFeed.map((item) => (
          <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
              {item.user.split(' ')[2].charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-gray-800">{item.activity}</p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Clock size={14} className="mr-1" />
                {item.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Notifications Component
  const Notifications = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">Mark All Read</button>
      </div>
      <div className="space-y-3">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={`p-3 rounded-lg flex items-start ${
              note.type === "warning"
                ? "bg-amber-50 border-l-4 border-amber-400"
                : "bg-blue-50 border-l-4 border-blue-400"
            }`}
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
              note.type === "warning" ? "bg-amber-200 text-amber-700" : "bg-blue-200 text-blue-700"
            }`}>
              <Bell size={16} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${
                note.type === "warning" ? "text-amber-700" : "text-blue-700"
              }`}>{note.message}</p>
              <p className="text-xs mt-1 text-gray-500">{note.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Upcoming Deadlines Component
  const UpcomingDeadlines = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">View Calendar</button>
      </div>
      <div className="space-y-3">
        {projects.slice(0, 3).map((project) => (
          <div key={project.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-medium">
              {project.name.charAt(0)}
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium">{project.name}</p>
              <p className="text-sm text-gray-500">Due: {project.deadline}</p>
            </div>
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
              {project.progress}% Complete
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 flex-1 overflow-auto">
          <StatCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <TaskCompletionChart />
            <ProjectStatusChart />
          </div>
          
          <ProjectProgressChart />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentActivity />
            <Notifications />
            <UpcomingDeadlines />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;