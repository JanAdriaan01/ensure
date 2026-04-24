import { getJobs, createJob } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const jobs = await getJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const job = await createJob(body);
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'LC Number already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}