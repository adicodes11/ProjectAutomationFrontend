"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
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

export default function TeamMemberDashboard() {
  const router = useRouter();
  const [teamAssignment, setTeamAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Retrieve the logged-in team member's email and project ID from sessionStorage
  const email = typeof window !== "undefined" ? sessionStorage.getItem("email") : null;
  const projectId = typeof window !== "undefined" ? sessionStorage.getItem("projectId") : null;

  // Fetch assignment on mount
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
  }, [email, router]);

  // Handler to update a single task's status
  const updateTaskStatus = async (taskId, newStatus) => {
    if (!teamAssignment || !projectId) return;
    setUpdatingTaskId(taskId);
    try {
      const updatedTask = {
        status: newStatus,
        progress: newStatus === "Completed" ? 100 : 0
      };
      const res = await fetch("/api/updateTaskStatus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          projectId,
          taskId,        // The subdocument’s _id
          updatedTask,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update task");
      } else {
        // Update local state for that specific task
        const updatedTasks = teamAssignment.tasks.map((task) =>
          task._id === taskId ? { ...task, ...updatedTask } : task
        );
        setTeamAssignment({ ...teamAssignment, tasks: updatedTasks });
      }
    } catch (err) {
      setError("Failed to update task");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Prepare chart data: Completed vs Pending tasks
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
          backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          className="w-16 h-16 border-8 border-t-transparent border-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 text-xl text-blue-700">Loading your assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-red-600 text-xl font-bold">{error}</p>
      </div>
    );
  }

  if (!teamAssignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-xl">No assignments found for your account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
      {/* Header with profile menu */}
      <div className="flex items-center justify-between bg-white shadow p-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Member Dashboard</h1>
          <p className="text-gray-600">Hello, {email}</p>
        </div>
        <ProfileMenu />
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-10">
        <h2 className="text-3xl font-bold mb-6">Your Task Assignments</h2>

        {/* Tasks List */}
        <div className="space-y-4">
          {teamAssignment.tasks && teamAssignment.tasks.length > 0 ? (
            teamAssignment.tasks.map((task) => (
              <motion.div
                key={task._id}  // subdocument's _id
                className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div>
                  {/* If you have a 'taskName', you can show that; otherwise, 'description' */}
                  <p className="text-lg font-medium">{task.description}</p>
                  {task.deadline && (
                    <p className="text-sm text-gray-500">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-700">{task.status}</p>
                  {task.status !== "Completed" && (
                    <button
                      onClick={() => updateTaskStatus(task._id, "Completed")}
                      disabled={updatingTaskId === task._id}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      {updatingTaskId === task._id ? "Updating..." : "Mark Complete"}
                    </button>
                  )}
                  {task.status === "Completed" && (
                    <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500">No tasks assigned.</p>
          )}
        </div>

        {/* Chart Summary */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Task Completion Summary</h3>
          {getChartData() && (
            <div className="h-64">
              <Bar
                data={getChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    title: { display: true, text: "Completed vs Pending Tasks" },
                  },
                  maintainAspectRatio: false,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
