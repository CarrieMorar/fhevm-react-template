import { NextRequest, NextResponse } from 'next/server';
import { createFhevmInstance, encryptInput } from '@fhevm/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, userAddress, inputs } = body;

    if (!contractAddress || !userAddress || !inputs) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Encrypt the inputs using SDK
    const encrypted = await encryptInput(contractAddress, userAddress, inputs);

    return NextResponse.json({
      success: true,
      data: encrypted,
    });
  } catch (error) {
    console.error('FHE operation error:', error);
    return NextResponse.json(
      { error: 'FHE operation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
