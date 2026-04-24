import { NextResponse } from 'next/server';
import { getJobWithAttendance, updateJob, deleteJob } from '../../../../lib/db.js';

export async function GET(request, { params }) {
  try {
    console.log('GET /api/jobs/[id] - ID:', params.id);
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }
    
    const data = await getJobWithAttendance(id);
    
    if (!data.job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/jobs/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const updates = await request.json();
    const job = await updateJob(id, updates);
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error in PUT /api/jobs/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    await deleteJob(id);
    return NextResponse.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/jobs/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}