// app/api/confirmTeam/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/config/db";
import TeamAssignment from "@/models/TeamAssignment";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    await connectToDatabase();
    const { projectId, confirmedTeam, additionalComments } = await request.json();
    if (!projectId || !confirmedTeam || !Array.isArray(confirmedTeam)) {
      return NextResponse.json(
        { message: "Project ID and confirmed team array are required." },
        { status: 400 }
      );
    }
    
    // Upsert each team member document (keyed by email)
    const results = [];
    for (const member of confirmedTeam) {
      // Validate required fields for each member
      if (!member.email || !member.name || !member.role || !member.expertise || !member.availability) {
        continue; // Skip invalid entries
      }
      const filter = { email: member.email.toLowerCase() };
      const update = {
        email: member.email.toLowerCase(),
        name: member.name,
        role: member.role,
        expertise: member.expertise,
        availability: member.availability,
        confirmed: member.confirmed === false ? false : true, // default to true
        assigned: true,
        projectId: new ObjectId(projectId),
        additionalInstructions: additionalComments || "",
      };
      const options = { upsert: true, returnDocument: "after" };
      const updatedDoc = await TeamAssignment.findOneAndUpdate(filter, update, options);
      results.push(updatedDoc);
    }
    
    return NextResponse.json(
      { message: "Team confirmed successfully", team: results },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error confirming team:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
