import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../lib/mongodb';
import Ticket from '../../../../../../models/Ticket';
import TicketType from '../../../../../../models/TicketType';

export async function GET(
  request: NextRequest,
  { params }: { params: { typeId: string } }
) {
  try {
    await connectToDatabase();
    const typeId = await params.typeId;
    
    const ticketType = await TicketType.findById(typeId);
    if (!ticketType) {
      return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 });
    }
    
    const ticketTypeName = ticketType.name;
    // Find any active tickets using this template
    const ticketsUsingTemplate = await Ticket.find({
      ticketType: ticketTypeName,
      status: { $ne: 'deleted' }
    });
    console.log(ticketsUsingTemplate);

    return NextResponse.json({
      isInUse: ticketsUsingTemplate.length > 0,
      count: ticketsUsingTemplate.length
    });
  } catch (error) {
    console.error('Error checking template usage:', error);
    return NextResponse.json(
      { error: 'Failed to check template usage' },
      { status: 500 }
    );
  }
} 