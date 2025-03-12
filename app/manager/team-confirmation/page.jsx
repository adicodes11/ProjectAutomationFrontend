"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function TeamConfirmationPage() {
  const router = useRouter();
  const [projectData, setProjectData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [localTeam, setLocalTeam] = useState([]);
  const [additionalComments, setAdditionalComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  // Fetch project and analysis details based on stored project ID
  useEffect(() => {
    const projectId = sessionStorage.getItem("projectId");
    if (!projectId) {
      setError("No project ID found in session storage.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch project details
        const projRes = await fetch(`/api/getProject?projectId=${projectId}`);
        const projData = await projRes.json();
        if (!projRes.ok) throw new Error(projData.message || "Failed to fetch project.");
        setProjectData(projData);

        // Fetch analysis details if needed
        const analysisRes = await fetch(`/api/getAnalysis?projectId=${projectId}`);
        const analysisJson = await analysisRes.json();
        if (!analysisRes.ok) throw new Error(analysisJson.message || "Failed to fetch analysis.");
        setAnalysisData(analysisJson.analysis);

        // Initialize local team from project data's teamMembers (set confirmed to true by default)
        if (projData.teamMembers) {
          const teamWithConfirmed = projData.teamMembers.map((member) => ({
            ...member,
            confirmed: member.confirmed !== false,
          }));
          setLocalTeam(teamWithConfirmed);
        }
        // Set any additional comments if provided
        if (projData.additionalComments) {
          setAdditionalComments(projData.additionalComments);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle confirmation status for a team member
  const toggleMemberConfirmation = (index) => {
    setLocalTeam((prev) =>
      prev.map((member, idx) =>
        idx === index ? { ...member, confirmed: !member.confirmed } : member
      )
    );
  };

  // Handle input changes for a team member
  const handleMemberChange = (index, field, value) => {
    setLocalTeam((prev) =>
      prev.map((member, idx) =>
        idx === index ? { ...member, [field]: value } : member
      )
    );
  };

  // Add a new team member
  const addNewMember = () => {
    setLocalTeam((prev) => [
      ...prev,
      { name: "", role: "", expertise: "", availability: "Full-Time", email: "", confirmed: true },
    ]);
  };

  // Remove a team member
  const removeMember = (index) => {
    setLocalTeam((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle final confirmation submission and then assign tasks
  const handleConfirm = async () => {
    setConfirming(true);
    const projectId = sessionStorage.getItem("projectId");

    try {
      // First, call the confirmTeam API to update the team confirmation
      const confirmResponse = await fetch("/api/confirmTeam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          confirmedTeam: localTeam,
          additionalComments,
        }),
      });
      const confirmData = await confirmResponse.json();
      if (!confirmResponse.ok) {
        setError(confirmData.message || "Team confirmation failed.");
        setConfirming(false);
        return;
      }

      // Next, call the assignTasks API (Flask endpoint running on port 8083)
      const assignResponse = await fetch("http://localhost:8083/api/assignTasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          confirmedTeam: localTeam,
        }),
      });
      const assignData = await assignResponse.json();
      if (!assignResponse.ok) {
        setError(assignData.message || "Task assignment failed.");
        setConfirming(false);
        return;
      }

      // If both API calls are successful, redirect to the next step (e.g., automation dashboard)
      router.push("/automation");
    } catch (err) {
      setError("An error occurred during confirmation.");
      setConfirming(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          className="w-16 h-16 border-8 border-t-transparent border-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <p className="mt-4 text-xl text-blue-700">Loading project details...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-blue-50 p-8">
      <AnimatePresence>
        <motion.div
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">
            Confirm Your Team & Details
          </h1>

          {/* TEAM MEMBERS */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Team Members</h2>
              <button
                onClick={addNewMember}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Add Member
              </button>
            </div>
            {localTeam && localTeam.length > 0 ? (
              <ul className="space-y-4">
                {localTeam.map((member, index) => (
                  <li
                    key={index}
                    className="border p-4 rounded-lg space-y-3 transition hover:bg-gray-50"
                  >
                    {/* Name & Role */}
                    <div className="flex flex-col md:flex-row md:space-x-4">
                      <div className="flex-1 mb-2 md:mb-0">
                        <label className="font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Name"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="font-medium text-gray-700">Role</label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Role"
                        />
                      </div>
                    </div>

                    {/* Expertise & Availability */}
                    <div className="flex flex-col md:flex-row md:space-x-4 mt-2">
                      <div className="flex-1 mb-2 md:mb-0">
                        <label className="font-medium text-gray-700">Expertise</label>
                        <input
                          type="text"
                          value={member.expertise}
                          onChange={(e) => handleMemberChange(index, "expertise", e.target.value)}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Expertise"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="font-medium text-gray-700">Availability</label>
                        <select
                          value={member.availability}
                          onChange={(e) => handleMemberChange(index, "availability", e.target.value)}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Freelance">Freelance</option>
                        </select>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col mt-2">
                      <label className="font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={member.email || ""}
                        onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="teamMember@example.com"
                      />
                    </div>

                    {/* Confirmed Toggle & Remove */}
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => toggleMemberConfirmation(index)}
                        type="button"
                        className={`flex items-center px-3 py-1 rounded ${
                          member.confirmed
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {member.confirmed ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5 mr-1" />
                            Confirmed
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-5 w-5 mr-1" />
                            Not Confirmed
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => removeMember(index)}
                        type="button"
                        className="flex items-center text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5 mr-1" />
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No team members available.</p>
            )}
          </div>

          {/* Additional Comments */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Additional Comments</h2>
            <textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Enter any additional instructions or changes to the team..."
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            ></textarea>
          </div>

          {/* Action Button: Confirm, then assign tasks */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirm}
              disabled={confirming}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">Proceed</span>
              <ArrowRightIcon className="h-6 w-6" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
