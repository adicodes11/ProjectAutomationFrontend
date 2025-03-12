"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

import {
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

import Chatbot from "@/components/Chatbot"; // Your chatbot popup component

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Simple tab definitions
const TABS = {
  OVERVIEW: "Overview",
  DETAILS: "Details",
  CHARTS: "Charts",
};

export default function AnalysisResultPage() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

  // Fetch analysis data on mount
  useEffect(() => {
    const projectId = sessionStorage.getItem("projectId");
    if (!projectId) {
      setError("No project ID found in session storage.");
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/api/getAnalysis?projectId=${projectId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch analysis data.");
        }
        const data = await res.json();
        // data.analysis might be null, so we handle that gracefully
        setAnalysisData(data.analysis || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  // Subtle motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  /***************************************************************
   *  Helper Functions to Render More Complex Fields
   ***************************************************************/

  // A card-like component to display a title + icon + content
  const InfoCard = ({ title, icon, children }) => (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center mb-4">
        <div className="p-2 bg-indigo-50 rounded-full mr-3">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="text-gray-700 text-lg">{children}</div>
    </motion.div>
  );

  // Render recommendedTeamStructure (object of role -> description)
  const renderTeamStructure = (structure) => {
    if (!structure || typeof structure !== "object") {
      return <p className="text-gray-500">No team structure provided.</p>;
    }
    const entries = Object.entries(structure);
    return (
      <ul className="list-disc list-inside space-y-1">
        {entries.map(([role, desc]) => (
          <li key={role}>
            <span className="font-medium">{role}:</span> {desc}
          </li>
        ))}
      </ul>
    );
  };

  // Render memberRecommendations (object of member -> recommendation)
  const renderMemberRecommendations = (recs) => {
    if (!recs || typeof recs !== "object" || Object.keys(recs).length === 0) {
      return <p className="text-gray-500">No member recommendations found.</p>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {Object.entries(recs).map(([member, recommendation]) => (
          <li key={member}>
            <span className="font-medium">{member}:</span>{" "}
            {typeof recommendation === "object"
              ? JSON.stringify(recommendation)
              : recommendation}
          </li>
        ))}
      </ul>
    );
  };

  // Render phases (array of { name, tasks, milestone, duration, ... })
  const renderPhases = (phases) => {
    if (!Array.isArray(phases) || phases.length === 0) {
      return <p className="text-gray-500">No phases available.</p>;
    }
    return (
      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div
            key={index}
            className="p-4 border rounded-md bg-gray-50 shadow-sm"
          >
            <h4 className="text-lg font-semibold text-gray-800">
              {phase.name || `Phase ${index + 1}`}
            </h4>
            {phase.tasks && Array.isArray(phase.tasks) && phase.tasks.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Tasks:</p>
                <ul className="list-disc list-inside ml-4">
                  {phase.tasks.map((task, tIndex) => (
                    <li key={tIndex}>{task}</li>
                  ))}
                </ul>
              </div>
            )}
            {phase.milestone && (
              <div className="mt-2">
                <p className="font-medium">Milestone:</p>
                <p className="ml-4">{phase.milestone}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render potentialRisks (array of strings)
  const renderPotentialRisks = (risks) => {
    if (!Array.isArray(risks) || risks.length === 0) {
      return <p className="text-gray-500">No potential risks available.</p>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {risks.map((risk, index) => (
          <li key={index}>{risk}</li>
        ))}
      </ul>
    );
  };

  // Render riskMitigation (array of strings or objects)
  const renderRiskMitigation = (mitigations) => {
    if (!mitigations) {
      return <p className="text-gray-500">No risk mitigation strategies found.</p>;
    }
    // If it's an array of strings
    if (Array.isArray(mitigations)) {
      if (mitigations.length === 0) {
        return <p className="text-gray-500">No risk mitigation strategies found.</p>;
      }
      return (
        <ul className="list-disc list-inside space-y-1">
          {mitigations.map((mit, index) => (
            <li key={index}>{mit}</li>
          ))}
        </ul>
      );
    }
    // If it's an object
    if (typeof mitigations === "object") {
      return (
        <ul className="list-disc list-inside space-y-1">
          {Object.entries(mitigations).map(([key, val]) => (
            <li key={key}>
              <span className="font-medium">{key}:</span>{" "}
              {typeof val === "string" ? val : JSON.stringify(val)}
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-gray-500">No risk mitigation strategies found.</p>;
  };

  // Render advancedIdeas (array of strings or objects)
  const renderAdvancedIdeas = (ideas) => {
    if (!ideas) return <p className="text-gray-500">No advanced ideas found.</p>;
    if (Array.isArray(ideas) && ideas.length > 0) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {ideas.map((idea, index) => (
            <li key={index}>{idea}</li>
          ))}
        </ul>
      );
    } else if (typeof ideas === "object") {
      return (
        <ul className="list-disc list-inside space-y-1">
          {Object.entries(ideas).map(([k, v]) => (
            <li key={k}>
              <span className="font-medium">{k}:</span> {JSON.stringify(v)}
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-gray-500">No advanced ideas found.</p>;
  };

  /***************************************************************
   *  Prepare Chart Data for "Charts" Tab
   ***************************************************************/
  const prepareTimelineChartData = () => {
    if (
      analysisData?.phases &&
      Array.isArray(analysisData.phases) &&
      analysisData.phases.length > 0
    ) {
      // Attempt to parse a "duration" field from each phase
      const labels = analysisData.phases.map((phase, i) => phase.name || `Phase ${i + 1}`);
      const durations = analysisData.phases.map((phase) => phase.duration || 0);
      return {
        labels,
        datasets: [
          {
            label: "Estimated Duration (weeks)",
            data: durations,
            backgroundColor: "rgba(99, 102, 241, 0.6)",
          },
        ],
      };
    }
    return null;
  };
  const timelineChartData = prepareTimelineChartData();

  /***************************************************************
   *  TABS: Overview, Details, Charts
   ***************************************************************/
  const OverviewTab = () => (
    <div className="space-y-6">
      <InfoCard title="Suggested Time" icon={<ClockIcon className="h-8 w-8 text-indigo-500" />}>
        {analysisData?.suggestedTime || "N/A"}
      </InfoCard>
      <InfoCard title="Suggested Budget" icon={<CurrencyDollarIcon className="h-8 w-8 text-emerald-500" />}>
        {analysisData?.suggestedBudget ? `₹${analysisData.suggestedBudget}` : "N/A"}
      </InfoCard>
      <InfoCard title="Risk Assessment" icon={<ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />}>
        {analysisData?.riskAssessment || "N/A"}
      </InfoCard>
      <InfoCard title="SDLC Methodology" icon={<AcademicCapIcon className="h-8 w-8 text-purple-500" />}>
        {analysisData?.sdlcMethodology || "N/A"}
      </InfoCard>
    </div>
  );

  const DetailsTab = () => (
    <div className="space-y-6">
      <InfoCard title="Recommended Team Structure" icon={<UsersIcon className="h-8 w-8 text-blue-500" />}>
        {renderTeamStructure(analysisData?.recommendedTeamStructure)}
      </InfoCard>
      <InfoCard title="Member Recommendations" icon={<DocumentTextIcon className="h-8 w-8 text-green-500" />}>
        {renderMemberRecommendations(analysisData?.memberRecommendations)}
      </InfoCard>
      {analysisData?.phases && (
        <InfoCard title="Phases" icon={<ClipboardDocumentCheckIcon className="h-8 w-8 text-indigo-500" />}>
          {renderPhases(analysisData.phases)}
        </InfoCard>
      )}
      {analysisData?.potentialRisks && (
        <InfoCard title="Potential Risks" icon={<ExclamationTriangleIcon className="h-8 w-8 text-red-500" />}>
          {renderPotentialRisks(analysisData.potentialRisks)}
        </InfoCard>
      )}
      {analysisData?.riskMitigation && (
        <InfoCard title="Risk Mitigation" icon={<ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />}>
          {renderRiskMitigation(analysisData.riskMitigation)}
        </InfoCard>
      )}
      {analysisData?.advancedIdeas && (
        <InfoCard title="Advanced Ideas" icon={<LightBulbIcon className="h-8 w-8 text-purple-500" />}>
          {renderAdvancedIdeas(analysisData.advancedIdeas)}
        </InfoCard>
      )}
    </div>
  );

  const ChartsTab = () => (
    <div className="space-y-6">
      {timelineChartData ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Project Timeline</h2>
          <div className="h-72">
            <Bar
              data={timelineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: "Estimated Phase Duration (weeks)" },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg text-gray-600">
          No timeline chart data available.
        </div>
      )}
    </div>
  );

  // Simple tab switcher
  const Tabs = () => (
    <div className="flex space-x-4 mb-8 border-b border-gray-200">
      {Object.values(TABS).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 font-semibold text-lg border-b-2 transition-colors ${
            activeTab === tab
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  /***************************************************************
   *  Render
   ***************************************************************/
  // 1) If loading, show a spinner
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300">
        <motion.div
          className="w-16 h-16 border-8 border-t-transparent border-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <p className="mt-4 text-xl text-blue-700">Loading analysis data...</p>
      </div>
    );
  }

  // 2) If there's an error from the fetch, show it
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-100 to-red-200">
        <p className="text-red-600 text-xl font-bold">{error}</p>
      </div>
    );
  }

  // 3) If analysisData is null or not an object, show "No analysis found"
  if (!analysisData || typeof analysisData !== "object") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
        <p className="text-gray-600 text-xl">No analysis found for this project.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-50 p-8 relative">
      <AnimatePresence>
        <motion.div
          className="max-w-5xl mx-auto bg-white rounded-lg shadow-2xl p-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">
            Project Analysis Results
          </h1>

          {/* 4) Check if the analysisData itself had an error property from the AI parse */}
          {analysisData?.error ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-8">
              <p className="font-bold">Parsing Error:</p>
              <pre className="whitespace-pre-wrap text-sm mt-2">
                {analysisData.raw || "No raw text available."}
              </pre>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <Tabs />

              {/* Tab Content */}
              {activeTab === TABS.OVERVIEW && <OverviewTab />}
              {activeTab === TABS.DETAILS && <DetailsTab />}
              {activeTab === TABS.CHARTS && <ChartsTab />}
            </>
          )}

          {/* Forward to Team Confirmation & Back to Dashboard buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push("/manager/dashboard")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={() => router.push("/manager/team-confirmation")} // Change this to the correct route
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold px-6 py-3 rounded-md transition-all"
          >
            Proceed
          </button>
        </div>

        </motion.div>
      </AnimatePresence>

      {/* Floating chatbot popup */}
      <Chatbot />
    </div>
  );
}
