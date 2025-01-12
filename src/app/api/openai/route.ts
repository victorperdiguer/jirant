import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      templateStructure, 
      userInput, 
      linkedTickets = [], 
      model = 'gpt-4',
      maxTokens = 500 
    } = await request.json();

    if (!templateStructure || !userInput) {
      return NextResponse.json(
        { error: 'templateStructure and userInput are required' },
        { status: 400 }
      );
    }

    // Build the context with linked tickets
    let linkedTicketsContext = '';
    if (linkedTickets.length > 0) {
      linkedTicketsContext = '\n\nRelated Tickets:\n';
      linkedTickets.forEach((ticket: any, index: number) => {
        linkedTicketsContext += `${index + 1}. ${ticket.title} (${ticket.type})\n`;
        linkedTicketsContext += `   Description: ${ticket.description}\n\n`;
      });
    }

    // Build the prompt
    let prompt = `User Input: ${userInput}\n\n`;
    
    if (linkedTicketsContext) {
      prompt += `Consider the following related tickets for context:${linkedTicketsContext}\n`;
    }
    
    prompt += `Template Structure:\n`;
    for (const section of templateStructure) {
      prompt += `${section.sectionTitle}: ${section.fieldTitle} - ${section.content || '...' }\n`;
    }

    // Call OpenAI API with enhanced system message
    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: [
        { 
          role: 'system', 
          content: "You're a product manager helping write tickets and user stories. Consider any related tickets provided to ensure consistency and proper relationships between tickets. Your responses should maintain context with existing work while being thorough and well-structured. Always follow the provided template structure in your response." 
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
    });

    return NextResponse.json(
      { generatedText: chatCompletion.choices[0].message?.content }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json(
      { message: 'Failed to call OpenAI API', error },
      { status: 500 }
    );
  }
}