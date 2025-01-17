import { NextRequest, NextResponse } from 'next/server';
import {connectToDatabase} from '../../../../lib/mongodb';
import TicketType from '../../../../models/TicketType';
import User from '../../../../models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const ticketTypes = await TicketType.find({ createdBy: session.user.id })
      .select('_id name description details templateStructure icon color tier')
      .sort({ name: 1 });
    console.log(ticketTypes);
    return NextResponse.json(ticketTypes);
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.icon || !body.color || !body.details) {
      return NextResponse.json(
        { error: 'Name, icon, color, and details are required' },
        { status: 400 }
      );
    }

    // Create the ticket type with the session user's ID
    const ticketType = await TicketType.create({
      name: body.name,
      description: body.description || '',
      details: body.details,
      templateStructure: body.templateStructure,
      icon: body.icon,
      color: body.color,
      tier: body.tier || 3,
      createdBy: session.user.id
    });

    return NextResponse.json(ticketType, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket type:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket type', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}