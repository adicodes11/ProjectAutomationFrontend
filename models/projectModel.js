// projectModel.js

const mongoose = require("mongoose");

// Define a schema for team members
const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  expertise: { type: String, required: true },
  availability: { type: String, required: true },
});

// Define the main project schema
const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    description: { type: String, required: true },
    objectives: { type: String, required: true },
    industry: { type: String, required: true },
    complexity: { type: String, required: true },
    teamSize: { type: Number, required: true },
    budget: { type: Number, required: true },
    timeline: { type: String, required: true },
    scope: { type: String },
    milestones: { type: String },
    riskFactors: { type: String },
    dependencies: { type: String },
    automationLevel: { type: String },
    projectType: { type: String },
    deliverables: { type: String },
    clientExpectations: { type: String },
    complianceRequirements: { type: String },
    resourceAllocation: { type: String },
    constraints: { type: String },
    postProjectMaintenance: { type: String },
    communicationPlan: { type: String },
    teamMembers: [teamMemberSchema],
    keyTechnologies: [{ type: String }],
    preferredTechStack: [{ type: String }],
  },
  { timestamps: true }
);

// Export the model (reusing the model if it already exists)
module.exports =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
