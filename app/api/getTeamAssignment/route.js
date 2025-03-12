import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/config/db";
import TeamAssignment from "@/models/TeamAssignment";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    const teamAssignment = await TeamAssignment.findOne({ email: email.toLowerCase() });
    if (!teamAssignment) {
      return NextResponse.json({ message: "No assignment found" }, { status: 404 });
    }
    return NextResponse.json({ teamAssignment }, { status: 200 });
  } catch (error) {
    console.error("Error fetching team assignment:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
