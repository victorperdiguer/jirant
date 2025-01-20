import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../lib/mongodb';
import Ticket from '../../../../../../models/Ticket';
import TicketRelationship from '../../../../../../models/TicketRelationship';

export async function GET(
  request: NextRequest,
  context: { params: { ticketId: string } }
) {
  try {
    await connectToDatabase();
    const { ticketId } = await context.params;

    // Find all relationships where this ticket is involved
    const relationships = await TicketRelationship.find({
      $or: [
        { ticket1: ticketId },
        { ticket2: ticketId }
      ]
    });

    // Get all related ticket IDs
    const relatedTicketIds = relationships.map(rel => 
      rel.ticket1.toString() === ticketId ? rel.ticket2 : rel.ticket1
    );

    // Fetch the actual tickets
    const contextTickets = await Ticket.find({
      _id: { $in: relatedTicketIds },
      status: { $ne: 'deleted' }
    });

    return NextResponse.json(contextTickets);
  } catch (error) {
    console.error('Error fetching context tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch context tickets' },
      { status: 500 }
    );
  }
} 