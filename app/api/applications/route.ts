// app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo_db';
import { JobApplication } from '@/models/jobApplication';
import { getAuthUser } from '@/lib/auth';
import { scheduleFollowUp } from '../../../service/queue.service';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    console.log(user,"--------")
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const query: any = { userId: user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { hrEmail: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [applications, total] = await Promise.all([
      JobApplication.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      JobApplication.countDocuments(query),
    ]);
    
    return NextResponse.json({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    const application = await JobApplication.create({
      ...data,
      userId: user.id,
    });
    
    // Schedule follow-up if date is provided
    if (data.followUpDate) {
      await scheduleFollowUp(
        application._id,
        new Date(data.followUpDate),
        user.id,
        user.name,
        application
      );
    }
    
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}