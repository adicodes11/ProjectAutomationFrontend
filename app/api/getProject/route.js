import connectToDatabase from '@/lib/config/db';
import Project from '@/models/projectModel';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { message: "No projectId provided" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const project = await Project.findById(new ObjectId(projectId));

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project, { status: 200 });
  } catch (err) {
    console.error("Error fetching project:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
