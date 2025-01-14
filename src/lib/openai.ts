import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTicketTitle(description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the cheaper model
      messages: [
        {
          role: "system",
          content: "You are a ticket title generator. Create a clear, concise title (maximum 50 tokens) that summarizes the given ticket description. The title should be specific enough to distinguish the ticket from others."
        },
        {
          role: "user",
          content: `Generate a title for this ticket description:\n${description}`
        }
      ],
      max_tokens: 50,
      temperature: 0.3, // Lower temperature for more focused outputs
    });

    return response.choices[0].message.content?.trim() || 'Untitled Ticket';
  } catch (error) {
    console.error('Error generating ticket title:', error);
    throw error;
  }
} 