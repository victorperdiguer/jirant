import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { templateStructure, userInput, model = 'gpt-4o', maxTokens = 500 } = await request.json();

    if (!templateStructure || !userInput) {
      return NextResponse.json(
        { error: 'templateStructure and userInput are required' },
        { status: 400 }
      );
    }

    // Build the prompt dynamically based on the template structure
    let prompt = `User Input: ${userInput}\n\nTemplate Structure:\n`;
    for (const section of templateStructure) {
      prompt += `${section.sectionTitle}: ${section.fieldTitle} - ${section.content || '...' }\n`;
    }

    // Call OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: "You're a product manager. Help me write tickets and user stories. I will give you general descriptions of what I want and you will reorganize and structure the idea properly. You are very thoughtful and thorough in your descriptions. You will ALWAYS strictly follow the formatting for the sections in your response." },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
    });

    // Return the generated text
    return NextResponse.json({ generatedText: chatCompletion.choices[0].message?.content }, { status: 200 });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json(
      { message: 'Failed to call OpenAI API', error  },
      { status: 500 }
    );
  }
}