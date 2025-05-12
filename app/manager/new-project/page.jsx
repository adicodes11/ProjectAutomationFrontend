"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// AnalyzingPage Component – Displays a full-screen analyzing animation.
const AnalyzingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex flex-col items-center justify-center">
      <motion.div
        className="w-32 h-32 border-8 border-t-transparent border-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      ></motion.div>
      <motion.h2
        className="mt-8 text-4xl text-white font-extrabold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Analyzing your project...
      </motion.h2>
      <motion.p
        className="mt-4 text-xl text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Please wait while we generate insights.
      </motion.p>
    </div>
  );
};

const steps = [
  "Basic Info",
  "Project Details",
  "Team Members",
  "Technology & Others",
  "Review & Submit",
];

export default function ProjectQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    objectives: "",
    industry: "",
    complexity: "",
    teamSize: "",
    budget: "",
    timeline: "",
    scope: "",
    milestones: "",
    riskFactors: "",
    dependencies: "",
    automationLevel: "",
    projectType: "",
    deliverables: "",
    clientExpectations: "",
    complianceRequirements: "",
    resourceAllocation: "",
    constraints: "",
    postProjectMaintenance: "",
    communicationPlan: "",
    teamMembers: [{ name: "", role: "", expertise: "", availability: "" }],
    keyTechnologies: [],
    preferredTechStack: [],
  });

  const handleChange = (e, index = null) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value),
      }));
    } else if (index !== null) {
      const updatedTeam = [...formData.teamMembers];
      updatedTeam[index][name] = value;
      setFormData({ ...formData, teamMembers: updatedTeam });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [
        ...formData.teamMembers,
        { name: "", role: "", expertise: "", availability: "" },
      ],
    });
  };

  const removeTeamMember = (index) => {
    const updatedTeam = formData.teamMembers.filter((_, idx) => idx !== index);
    setFormData({ ...formData, teamMembers: updatedTeam });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert numeric fields (teamSize & budget) to numbers
    const payload = {
      ...formData,
      teamSize: Number(formData.teamSize),
      budget: Number(formData.budget),
    };

    try {
      // Show the analyzing page immediately.
      setIsAnalyzing(true);

      // 1. Create the project using your internal endpoint.
      const createResponse = await fetch("/api/newProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const createData = await createResponse.json();

      if (!createResponse.ok) {
        console.error("Submission error:", createData.message);
        alert(`Error: ${createData.message}`);
        setIsAnalyzing(false);
        return;
      } else {
        console.log("Project created successfully:", createData.project);
      }

      // 2. Extract the project ID and store it in session storage.
      const projectId = createData.project._id;
      sessionStorage.setItem("projectId", projectId);

      // 3. Add the _id field to the payload so that the Flask API can update the corresponding document.
      const updatedPayload = { ...payload, _id: projectId };

      // 4. Now, send the updated payload to your Flask API for analysis.
      const analysisResponse = await fetch("https://projectautomationflaskapi.onrender.com/analyze_project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });
      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        console.error("Analysis error:", analysisData.message);
        alert("Project created, but analysis failed: " + analysisData.message);
      } else {
        console.log("Project analysis:", analysisData.analysis);
        alert("Project analyzed successfully! Analysis: " + JSON.stringify(analysisData.analysis));
      }

      // 5. Navigate to the analysis-result page
      router.push("/manager/analysis-result");

      // 6. Reset analyzing state after process completes (optional)
      setIsAnalyzing(false);

    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("An error occurred. Please try again.");
      setIsAnalyzing(false);
    }
  };

  // Framer Motion variants for transitions
  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // Calculate progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;

  // If analysis is in progress, render the analyzing page.
  if (isAnalyzing) {
    return <AnalyzingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-indigo-200 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-4">
          <div
            style={{ width: `${progress}%` }}
            className="h-4 bg-green-500 transition-all duration-300"
          ></div>
        </div>

        <div className="p-8">
          <h2 className="text-4xl font-bold text-center mb-6">
            {steps[currentStep]}
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="font-semibold">Project Name</label>
                      <input
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleChange}
                        placeholder="Enter project name"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter project description"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Objectives</label>
                      <textarea
                        name="objectives"
                        value={formData.objectives}
                        onChange={handleChange}
                        placeholder="Enter project objectives"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Industry</label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                      >
                        <option value="">Select Industry</option>
                        <option value="Software">Software</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Project Complexity</label>
                      <select
                        name="complexity"
                        value={formData.complexity}
                        onChange={handleChange}
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                      >
                        <option value="">Select Complexity</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Project Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="font-semibold">Team Size</label>
                      <input
                        type="number"
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleChange}
                        placeholder="Enter expected team size"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Budget (Rupee)</label>
                      <input
                        type="text"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="Enter budget"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Timeline (weeks)</label>
                      <input
                        type="text"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        placeholder="Enter timeline"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Scope</label>
                      <textarea
                        name="scope"
                        value={formData.scope}
                        onChange={handleChange}
                        placeholder="Define the project scope"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Milestones</label>
                      <textarea
                        name="milestones"
                        value={formData.milestones}
                        onChange={handleChange}
                        placeholder="Define project milestones"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Risk Factors</label>
                      <textarea
                        name="riskFactors"
                        value={formData.riskFactors}
                        onChange={handleChange}
                        placeholder="List potential risk factors"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Dependencies</label>
                      <textarea
                        name="dependencies"
                        value={formData.dependencies}
                        onChange={handleChange}
                        placeholder="List any dependencies"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Automation Level</label>
                      <select
                        name="automationLevel"
                        value={formData.automationLevel}
                        onChange={handleChange}
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="">Select Automation Level</option>
                        <option value="None">None</option>
                        <option value="Partial">Partial</option>
                        <option value="Full">Full</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Project Type</label>
                      <input
                        type="text"
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleChange}
                        placeholder="Enter project type"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Deliverables</label>
                      <textarea
                        name="deliverables"
                        value={formData.deliverables}
                        onChange={handleChange}
                        placeholder="Define deliverables"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Client Expectations</label>
                      <textarea
                        name="clientExpectations"
                        value={formData.clientExpectations}
                        onChange={handleChange}
                        placeholder="Define client expectations"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Compliance Requirements</label>
                      <textarea
                        name="complianceRequirements"
                        value={formData.complianceRequirements}
                        onChange={handleChange}
                        placeholder="List compliance requirements"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Resource Allocation</label>
                      <textarea
                        name="resourceAllocation"
                        value={formData.resourceAllocation}
                        onChange={handleChange}
                        placeholder="Describe resource allocation"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Constraints</label>
                      <textarea
                        name="constraints"
                        value={formData.constraints}
                        onChange={handleChange}
                        placeholder="List project constraints"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Post Project Maintenance</label>
                      <textarea
                        name="postProjectMaintenance"
                        value={formData.postProjectMaintenance}
                        onChange={handleChange}
                        placeholder="Describe post project maintenance plans"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Communication Plan</label>
                      <textarea
                        name="communicationPlan"
                        value={formData.communicationPlan}
                        onChange={handleChange}
                        placeholder="Outline the communication plan"
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Team Members</h3>
                    {formData.teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="border rounded p-4 space-y-4 shadow-sm transition-transform transform hover:scale-105"
                      >
                        <div className="flex flex-col">
                          <label className="font-semibold">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={member.name}
                            onChange={(e) => handleChange(e, index)}
                            placeholder="Enter name"
                            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-semibold">Role</label>
                          <input
                            type="text"
                            name="role"
                            value={member.role}
                            onChange={(e) => handleChange(e, index)}
                            placeholder="Enter role"
                            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-semibold">Expertise</label>
                          <input
                            type="text"
                            name="expertise"
                            value={member.expertise}
                            onChange={(e) => handleChange(e, index)}
                            placeholder="Enter expertise"
                            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-semibold">Availability</label>
                          <select
                            name="availability"
                            value={member.availability}
                            onChange={(e) => handleChange(e, index)}
                            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                          >
                            <option value="">Select Availability</option>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </div>
                        {formData.teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTeamMember(index)}
                            className="text-red-500 hover:underline"
                          >
                            Remove Member
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Add Team Member
                    </button>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="font-semibold">Key Technologies</label>
                      <div className="flex flex-wrap gap-3">
                        {["React", "Next.js", "Node.js", "MongoDB", "Python", "AWS"].map((tech) => (
                          <label key={tech} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="keyTechnologies"
                              value={tech}
                              checked={formData.keyTechnologies.includes(tech)}
                              onChange={handleChange}
                              className="h-4 w-4"
                            />
                            {tech}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold">Preferred Tech Stack</label>
                      <div className="flex flex-wrap gap-3">
                        {["React", "Next.js", "Node.js", "MongoDB", "Python", "AWS", "Django"].map((tech) => (
                          <label key={tech} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="preferredTechStack"
                              value={tech}
                              checked={formData.preferredTechStack.includes(tech)}
                              onChange={handleChange}
                              className="h-4 w-4"
                            />
                            {tech}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Review Your Details</h3>
                    <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                      <pre className="text-sm">{JSON.stringify(formData, null, 2)}</pre>
                    </div>
                  </div>
                )}
                <div className="flex justify-between pt-4">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors ml-auto"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors ml-auto"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
