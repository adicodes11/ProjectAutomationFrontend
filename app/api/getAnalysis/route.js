// app/api/getAnalysis/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/config/db";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ message: "No projectId provided" }, { status: 400 });
    }

    // Use your Mongoose connection and obtain the native MongoDB database.
    const conn = await connectToDatabase();
    const db = conn.connection.db; // conn is the Mongoose connection
    const analysisCollection = db.collection("analysis");

    // Query using projectId stored as an ObjectId.
    const analysisDoc = await analysisCollection.findOne({
      projectId: new ObjectId(projectId),
    });

    if (!analysisDoc) {
      return NextResponse.json({ message: "No analysis found" }, { status: 404 });
    }

    return NextResponse.json({ analysis: analysisDoc.analysis }, { status: 200 });
  } catch (err) {
    console.error("Error fetching analysis:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
