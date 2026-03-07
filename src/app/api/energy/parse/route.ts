import { NextResponse } from 'next/server';
import { parseEnergyEmail } from '@/lib/energy-parser';

interface ParseRequest {
  text: string;
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json() as ParseRequest;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    const energyData = parseEnergyEmail(text);

    if (!energyData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No energy data found in the text. Make sure you paste the complete email content with the energy values.' 
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      data: energyData
    }, { status: 200 });

  } catch (error) {
    console.error('Error parsing energy data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse energy data', details: String(error) },
      { status: 500 }
    );
  }
}
