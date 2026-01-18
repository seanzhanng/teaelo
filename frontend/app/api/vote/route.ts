import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { winnerId, loserId, isTie } = body;

    // Validate request
    if (!winnerId || !loserId) {
      return NextResponse.json(
        { error: 'Missing winnerId or loserId' },
        { status: 400 }
      );
    }

    // Stub: Log the vote (in production, this would update the database)
    if (isTie) {
      console.log('Tie vote received:', { winnerId, loserId });
    } else {
      console.log('Vote received:', { winnerId, loserId });
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: isTie ? 'Tie recorded successfully' : 'Vote recorded successfully',
        winnerId,
        loserId,
        isTie,
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

