import { NextResponse } from 'next/server';
import {connectToDatabase} from '../../../../lib/mongodb';
import Ticket from '../../../../models/Ticket';
import TicketType from '../../../../models/TicketType';
import User from '../../../../models/User';


// GET: Fetch all tickets
export async function GET() {
  await connectToDatabase();

  try {
    const tickets = await Ticket.find().populate('ticketType').populate('relatedTickets');
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

    // Validate and resolve ticketType
    const ticketType = await TicketType.findOne({ name: body.ticketType });
    if (!ticketType) {
      return NextResponse.json({ message: `Invalid ticketType: ${body.ticketType}` }, { status: 400 });
    }

    // Validate and resolve createdBy
    const user = await User.findOne({ _id: body.createdBy });
    if (!user) {
      return NextResponse.json({ message: `Invalid createdBy: ${body.createdBy}` }, { status: 400 });
    }

    // Create the ticket with resolved ObjectIds
    const ticket = await Ticket.create({
      ...body,
      ticketType: ticketType._id,
      createdBy: user._id,
    });

    console.log('Ticket created:', ticket);
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create ticket', error }, { status: 500 });
  }
}