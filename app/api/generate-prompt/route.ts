import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    console.log(GEMINI_API_KEY);
    
    if (!GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate prompt' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ text: generatedText });
  } catch (error) {
    console.error('Error in generate-prompt API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
