import { NextResponse } from 'next/server';
import {connectToDatabase} from '../../../../../lib/mongodb';
import Ticket from '../../../../../models/Ticket';

// Connect to the database
await connectToDatabase();

// GET: Fetch a specific ticket by ID
export async function GET(request: Request, { params }: { params: Promise<{ ticketId: string }>}) {
  try {
    // No need to populate ticketType
    const ticketId = (await params).ticketId;
    const ticket = await Ticket.findById(ticketId).populate('relatedTickets');
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

// PATCH: Update a specific ticket by ID
export async function PATCH(request: Request, { params }: { params: Promise<{ ticketId: string }>}) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const ticketId = (await params).ticketId;

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: body.status },
      { new: true }
    );

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific ticket by ID
export async function DELETE(request: Request, { params }: { params: Promise<{ ticketId: string }>}) {
  try {
    const ticketId = (await params).ticketId;
    const ticket = await Ticket.findByIdAndUpdate(ticketId, {status: "deleted", new: true});
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Ticket deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}