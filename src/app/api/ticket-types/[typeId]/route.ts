import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import TicketType from '../../../../../models/TicketType';

export async function PUT(
  request: NextRequest,
  { params }: { params: { typeId: string } }
) {
  await connectToDatabase();

  try {
    const { typeId } = params;
    const updateData = await request.json();

    // Remove _id from update data if it exists
    const { _id, ...updateFields } = updateData;

    // Validate required fields
    if (!updateFields.name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    // Find and update the ticket type
    const updatedTicketType = await TicketType.findByIdAndUpdate(
      typeId,
      { $set: updateFields },
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    );

    if (!updatedTicketType) {
      return NextResponse.json(
        { message: 'Ticket type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTicketType, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket type:', error);
    return NextResponse.json(
      { message: "Couldn't update ticket type", error },
      { status: 500 }
    );
  }
}

// Optionally add GET and DELETE methods for individual ticket types
export async function GET(
  _request: NextRequest,
  { params }: { params: { typeId: string } }
) {
  await connectToDatabase();

  try {
    const { typeId } = params;
    const ticketType = await TicketType.findById(typeId);

    if (!ticketType) {
      return NextResponse.json(
        { message: 'Ticket type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticketType, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Couldn't fetch ticket type", error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { typeId: string } }
) {
  await connectToDatabase();

  try {
    const { typeId } = params;
    const deletedTicketType = await TicketType.findByIdAndDelete(typeId);

    if (!deletedTicketType) {
      return NextResponse.json(
        { message: 'Ticket type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Ticket type deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Couldn't delete ticket type", error },
      { status: 500 }
    );
  }
} 