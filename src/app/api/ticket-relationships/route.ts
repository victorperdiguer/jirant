import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import TicketRelationship from '../../../../models/TicketRelationship';
import { connectToDatabase } from '../../../../lib/mongodb';

// GET: Fetch ticket relationships by 1 or 2 ticket IDs (as query parameters)
export async function GET(request: NextRequest) {
  await connectToDatabase();

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const ticket1 = searchParams.get('ticket1');
    const ticket2 = searchParams.get('ticket2');

    if (!ticket1) {
      return NextResponse.json(
        { error: 'At least one ticketID as query parameter is required' },
        { status: 400 }
      );
    }

    // Build query dynamically
    const query: any = { $or: [] };

    if (ticket1 && ticket2) {
      // Find relationships specifically between ticket1 and ticket2
      query.$or.push({ ticket1, ticket2 });
      query.$or.push({ ticket1: ticket2, ticket2: ticket1 });
    } else {
      // Find all relationships involving ticket1
      query.$or.push({ ticket1 });
      query.$or.push({ ticket2: ticket1 });
    }

    // Execute query and populate relationships
    const relationships = await TicketRelationship.find(query)
      .populate('ticket1')
      .populate('ticket2');

    return NextResponse.json(relationships, { status: 200 });
  } catch (error) {
    console.error('Error fetching ticket relationships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket relationships' },
      { status: 500 }
    );
  }
}

// POST: Create a new ticket relationship
export async function POST(request: NextRequest) {
  await connectToDatabase();

  try {
    const { ticket1, ticket2, relationshipType } = await request.json();

    // Validate required fields
    if (!ticket1 || !ticket2) {
      return NextResponse.json(
        { error: 'Both ticket1 and ticket2 are required' },
        { status: 400 }
      );
    }

    if (ticket1 === ticket2) {
      return NextResponse.json(
        { error: 'Tickets must be different' },
        { status: 400 }
      );
    }

    // Check if the relationship already exists
    const existingRelationship = await TicketRelationship.findOne({
      $or: [
        { ticket1, ticket2 },
        { ticket1: ticket2, ticket2: ticket1 },
      ],
    });

    if (existingRelationship) {
      return NextResponse.json(
        { error: 'Relationship already exists between these tickets' },
        { status: 400 }
      );
    }

    // Create the new relationship
    const relationship = await TicketRelationship.create({
      ticket1,
      ticket2,
      relationshipType: relationshipType || 'related',
    });

    return NextResponse.json(relationship, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket relationship:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket relationship' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a ticket relationship
export async function DELETE(request: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(request.url);
    const ticket1 = searchParams.get('ticket1');
    const ticket2 = searchParams.get('ticket2');

    if (!ticket1 || !ticket2) {
      return NextResponse.json(
        { error: 'Both ticket1 and ticket2 query parameters are required' },
        { status: 400 }
      );
    }

    // Delete the relationship
    const deletedRelationship = await TicketRelationship.findOneAndDelete({
      $or: [
        { ticket1, ticket2 },
        { ticket1: ticket2, ticket2: ticket1 },
      ],
    });

    if (!deletedRelationship) {
      return NextResponse.json(
        { error: 'No relationship found between these tickets' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Relationship deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting ticket relationship:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket relationship' },
      { status: 500 }
    );
  }
}