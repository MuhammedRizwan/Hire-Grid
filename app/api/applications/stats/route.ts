// app/api/applications/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo_db';
import { JobApplication } from '@/models/jobApplication';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    console.log(user,"--------")
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await JobApplication.aggregate([
      { $match: { userId: user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      applied: 0,
      followUp: 0,
      interview: 0,
      rejected: 0,
      offer: 0,
    };

    // Populate counts from aggregation
    stats.forEach((stat: any) => {
      const statusKey = stat._id as keyof typeof result;
      if (statusKey in result) {
        result[statusKey] = stat.count;
      }
      result.total += stat.count;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Fetch stats error:', error);
    
    // Return more helpful error in development
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}