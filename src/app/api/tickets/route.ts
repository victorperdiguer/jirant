import { NextResponse } from 'next/server';
import {connectToDatabase} from '../../../../lib/mongodb';
import Ticket from '../../../../models/Ticket';
import User from '../../../../models/User';
import { generateTicketTitle } from '@/lib/openai';

// GET: Fetch all tickets
export async function GET() {
  await connectToDatabase();

  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// POST: Create a new ticket
export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const body = await request.json();
    console.log('Request body:', body);

    // Generate title from description
    const generatedTitle = await generateTicketTitle(body.description);

    // Validate and resolve createdBy
    const user = await User.findOne({ _id: body.createdBy });
    if (!user) {
      return NextResponse.json({ message: `Invalid createdBy: ${body.createdBy}` }, { status: 400 });
    }

    // Create the ticket with generated title
    const ticket = await Ticket.create({
      ...body,
      title: generatedTitle, // Use the AI-generated title
      createdBy: user._id,
    });

    console.log('Ticket created:', ticket);
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ message: 'Failed to create ticket', error }, { status: 500 });
  }
}