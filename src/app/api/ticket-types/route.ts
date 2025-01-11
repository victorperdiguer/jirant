import { NextRequest, NextResponse } from 'next/server';
import {connectToDatabase} from '../../../../lib/mongodb';
import TicketType from '../../../../models/TicketType';

export async function GET() {
  try {
    await connectToDatabase();
    const ticketTypes = await TicketType.find()
      .select('_id name description details templateStructure icon color')
      .sort({ name: 1 });
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

    // Validate tier if provided
    if (body.tier && (!Number.isInteger(body.tier) || body.tier < 1 || body.tier > 5)) {
      return NextResponse.json(
        { error: 'Tier must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate template structure
    if (!Array.isArray(body.templateStructure)) {
      return NextResponse.json(
        { error: 'Template structure must be an array' },
        { status: 400 }
      );
    }

    for (const section of body.templateStructure) {
      if (!section.sectionTitle || typeof section.content !== 'string') {
        return NextResponse.json(
          { error: 'Each template section must have a sectionTitle and content' },
          { status: 400 }
        );
      }
    }

    const ticketType = await TicketType.create({
      name: body.name,
      description: body.description || '',
      details: body.details,
      templateStructure: body.templateStructure,
      icon: body.icon,
      color: body.color,
      tier: body.tier || 3, // Default to tier 3 if not specified
      createdBy: body.createdBy || null,
    });

    return NextResponse.json(ticketType, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket type:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket type' },
      { status: 500 }
    );
  }
}