// app/api/updateTaskStatus/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/config/db";
import TeamAssignment from "@/models/TeamAssignment";

export async function PUT(request) {
  try {
    await connectToDatabase();
    const { email, taskDescription, updatedTask } = await request.json();

    if (!email || !taskDescription || !updatedTask) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the team assignment document using the email.
    const teamAssignment = await TeamAssignment.findOne({
      email: email.toLowerCase(),
    });
    if (!teamAssignment) {
      return NextResponse.json({ message: "Team assignment not found" }, { status: 404 });
    }

    // Locate the index of the task by matching the description field.
    const taskIndex = teamAssignment.tasks.findIndex(
      (task) => task.description === taskDescription
    );
    if (taskIndex === -1) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Do not convert updatedTask.status to lowercase—use the exact enum value!
    // Merge updated fields into the task.
    Object.entries(updatedTask).forEach(([key, value]) => {
      teamAssignment.tasks[taskIndex][key] = value;
    });

    await teamAssignment.save();

    return NextResponse.json(
      { message: "Task updated successfully", teamAssignment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
