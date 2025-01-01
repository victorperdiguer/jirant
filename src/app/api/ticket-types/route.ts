import { NextRequest, NextResponse } from 'next/server';
import {connectToDatabase} from '../../../../lib/mongodb';
import TicketType from '../../../../models/TicketType';

export async function GET() {
  await connectToDatabase();

  try {
    const ticketTypes = await TicketType.find();
    return NextResponse.json(ticketTypes, {status: 200})
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch ticket types', error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectToDatabase();

  try {
    // Parse the request body
    const { name, description, details, templateStructure, createdBy } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    // Create the ticket type with the provided data
    const ticketType = await TicketType.create({
      name,
      description: description || '', // Default to empty string if not provided
      details: details || '',         // Default to empty string if not provided
      templateStructure: templateStructure || [], // Default to an empty array
      createdBy: createdBy || null,   // Default to null if not provided
    });

    return NextResponse.json(ticketType, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket type:', error);
    return NextResponse.json(
      { message: "Couldn't create ticket type", error },
      { status: 500 }
    );
  }
}