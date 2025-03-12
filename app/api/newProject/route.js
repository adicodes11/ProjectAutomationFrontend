// app/api/newProject/route.js
import connectToDatabase from '@/lib/config/db';
import Project from '@/models/projectModel';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // Basic validation: check if required fields exist (adjust as needed)
    if (!body.projectName || !body.description || !body.objectives) {
      return NextResponse.json(
        { message: 'Project Name, Description, and Objectives are required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Create a new project document using the model
    const newProject = new Project(body);
    await newProject.save();

    return NextResponse.json(
      { message: 'Project created successfully', project: newProject },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during project creation:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
