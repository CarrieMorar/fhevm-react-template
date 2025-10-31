import { NextRequest, NextResponse } from 'next/server';
import { encryptInput } from '@fhevm/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, userAddress, values } = body;

    if (!contractAddress || !userAddress || !values) {
      return NextResponse.json(
        { error: 'Missing required parameters: contractAddress, userAddress, values' },
        { status: 400 }
      );
    }

    // Encrypt multiple values
    const encrypted = await encryptInput(contractAddress, userAddress, values);

    return NextResponse.json({
      success: true,
      encrypted: {
        handles: encrypted.handles,
        inputProof: encrypted.inputProof,
      },
    });
  } catch (error) {
    console.error('Encryption error:', error);
    return NextResponse.json(
      { error: 'Encryption failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
