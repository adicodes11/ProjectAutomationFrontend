import connectToDatabase from '@/lib/config/db';
import Project from '@/models/projectModel';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Aggregate statistics about projects
    const stats = await Project.aggregate([
      {
        $facet: {
          // Count total projects
          totalProjects: [
            { $count: "count" }
          ],
          // Count active projects
          activeProjects: [
            { $match: { status: "In Progress" } },
            { $count: "count" }
          ],
          // Count completed projects
          completedProjects: [
            { $match: { status: "Completed" } },
            { $count: "count" }
          ],
          // Get projects with their progress for the chart
          projectProgress: [
            { $project: { 
                name: 1, 
                progress: 1
              }
            }
          ],
          // Get recent activities (assuming you have a timestamp field)
          recentActivities: [
            { $sort: { updatedAt: -1 } },
            { $limit: 5 },
            { $project: {
                name: 1,
                status: 1,
                updatedAt: 1
              }
            }
          ]
        }
      }
    ]);
    
    // Format the response
    const formattedStats = {
      totalProjects: stats[0].totalProjects[0]?.count || 0,
      activeProjects: stats[0].activeProjects[0]?.count || 0,
      completedProjects: stats[0].completedProjects[0]?.count || 0,
      projectProgress: stats[0].projectProgress || [],
      recentActivities: stats[0].recentActivities || []
    };
    
    return NextResponse.json(formattedStats, { status: 200 });
  } catch (err) {
    console.error("Error fetching project stats:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}