import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { winnerId, loserId } = body;

    // Validate request
    if (!winnerId || !loserId) {
      return NextResponse.json(
        { error: 'Missing winnerId or loserId' },
        { status: 400 }
      );
    }

    // Stub: Log the vote (in production, this would update the database)
    console.log('Vote received:', { winnerId, loserId });

    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Vote recorded successfully',
        winnerId,
        loserId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

