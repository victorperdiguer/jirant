import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../lib/mongodb';
import Ticket from '../../../../../../models/Ticket';
import TicketType from '../../../../../../models/TicketType';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ typeId: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const typeId = (await params).typeId;
    console.log("tickettype ID", typeId);
    
    const ticketType = await TicketType.findById(typeId);
    if (!ticketType) {
      return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 });
    }
    
    const ticketTypeName = ticketType.name;
    // Find any active tickets using this template that belong to the current user
    const ticketsUsingTemplate = await Ticket.find({
      ticketType: ticketTypeName,
      status: { $ne: 'deleted' },
      createdBy: session.user.id
    });
    
    console.log('Tickets using template:', ticketsUsingTemplate);

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