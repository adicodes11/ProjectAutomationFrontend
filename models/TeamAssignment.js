import mongoose from "mongoose";
const { Schema, model, models, Types } = mongoose;

const taskSchema = new Schema(
  {
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Blocked"],
      default: "Pending",
    },
    progress: { type: Number, default: 0 },
    deadline: { type: Date },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { _id: true }
);

const teamAssignmentSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    expertise: { type: String, required: true },
    availability: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    assigned: { type: Boolean, default: false },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    tasks: [taskSchema],
    additionalInstructions: { type: String, default: "" },
  },
  { timestamps: true, collection: "teamAssignments" } // Added collection name explicitly
);

export default models.TeamAssignment || model("TeamAssignment", teamAssignmentSchema);
