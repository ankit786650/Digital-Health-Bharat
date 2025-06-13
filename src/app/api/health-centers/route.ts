import { NextResponse } from 'next/server';
import { mockFacilities } from '@/lib/mockFacilities';

export async function GET() {
  try {
    // In a real application, this would fetch from a database
    // For now, we'll return the mock data
    return NextResponse.json(mockFacilities);
  } catch (error) {
    console.error('Error fetching health centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health centers' },
      { status: 500 }
    );
  }
} 