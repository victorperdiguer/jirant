import { NextResponse, NextRequest } from 'next/server';
import {connectToDatabase} from '../../../../lib/mongodb';
import Ticket from '../../../../models/Ticket';
import User from '../../../../models/User';
import { generateTicketTitle } from '@/lib/openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET: Fetch all tickets
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const tickets = await Ticket.find()
      .select('_id title description ticketType status createdAt userInput')
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// POST: Create a new ticket
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    // Create a new ticket document with the correct types
    const ticketData = {
      title: generatedTitle,
      description: body.description,
      ticketType: body.ticketType,
      status: body.status || 'active',
      createdBy: user._id,
      relatedTickets: body.relatedTickets || [],
      userInput: body.userInput, // Add the userInput field
    };

    // Create the ticket
    const ticket = await Ticket.create(ticketData);

    console.log('Ticket created:', ticket);
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ 
      message: 'Failed to create ticket', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}