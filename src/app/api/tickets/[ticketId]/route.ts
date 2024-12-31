import { NextResponse } from 'next/server';
import {connectToDatabase} from '../../../../../lib/mongodb';
import Ticket from '../../../../../models/Ticket';
import TicketType from '../../../../../models/TicketType';
import User from '../../../../../models/User';


// Connect to the database
await connectToDatabase();

// GET: Fetch a specific ticket by ID
export async function GET(request: Request, { params }: { params: { ticketId: string } }) {
  try {
    const ticket = await Ticket.findById(params.ticketId).populate('ticketType').populate('relatedTickets');
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
export async function PATCH(request: Request, { params }: { params: { ticketId: string } }) {
  try {
    const body = await request.json();

    // Validate and resolve ticketType if updated
    let ticketType = null;
    if (body.ticketType) {
      ticketType = await TicketType.findOne({ name: body.ticketType });
      if (!ticketType) {
        return NextResponse.json({ error: `Invalid ticketType: ${body.ticketType}` }, { status: 400 });
      }
    }

    // Validate and resolve createdBy if updated
    let user = null;
    if (body.createdBy) {
      user = await User.findOne({ _id: body.createdBy });
      if (!user) {
        return NextResponse.json({ error: `Invalid createdBy: ${body.createdBy}` }, { status: 400 });
      }
    }

    // Update the ticket
    const updatedFields = {
      ...body,
      ...(ticketType && { ticketType: ticketType._id }),
      ...(user && { createdBy: user._id }),
    };

    const ticket = await Ticket.findByIdAndUpdate(params.ticketId, updatedFields, { new: true });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ message: 'Failed to update ticket', error }, { status: 500 });
  }
}

// DELETE: Delete a specific ticket by ID
export async function DELETE(request: Request, { params }: { params: { ticketId: string } }) {
  try {
    const ticket = await Ticket.findByIdAndUpdate(params.ticketId, {status: "deleted", new: true});
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Ticket deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}