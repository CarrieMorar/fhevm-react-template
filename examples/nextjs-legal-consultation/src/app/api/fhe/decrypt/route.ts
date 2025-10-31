import { NextRequest, NextResponse } from 'next/server';
import { publicDecrypt } from '@fhevm/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, handle } = body;

    if (!contractAddress || !handle) {
      return NextResponse.json(
        { error: 'Missing required parameters: contractAddress, handle' },
        { status: 400 }
      );
    }

    // Public decryption (for server-side operations)
    const decrypted = await publicDecrypt({
      contractAddress,
      handle,
    });

    return NextResponse.json({
      success: true,
      value: decrypted.toString(),
    });
  } catch (error) {
    console.error('Decryption error:', error);
    return NextResponse.json(
      { error: 'Decryption failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
