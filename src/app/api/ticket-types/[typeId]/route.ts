import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import TicketType from '../../../../../models/TicketType';

export async function PUT(
  request: NextRequest,
  { params }: { params: { typeId: string } }
) {
  await connectToDatabase();

  try {
    const awaitParams = await params;
    const typeId = awaitParams.typeId;
    const updateData = await request.json();

    // Remove _id from update data if it exists
    const { _id, ...updateFields } = updateData;

    // Validate required fields
    if (!updateFields.name || !updateFields.icon || !updateFields.color) {
      return NextResponse.json(
        { message: 'Name, icon, and color are required' },
        { status: 400 }
      );
    }

    // Find and update the ticket type
    const updatedTicketType = await TicketType.findByIdAndUpdate(
      typeId,
      { $set: updateFields },
      { 
        new: true,
        runValidators: true
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
    const awaitParams = await params;
    const typeId = awaitParams.typeId;
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
    const awaitParams = await params;
    const typeId = awaitParams.typeId;
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

/* export async function PATCH(
  request: Request,
  { params }: { params: { typeId: string } }
) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const updatedType = await TicketType.findByIdAndUpdate(
      params.typeId,
      {
        name: body.name,
        description: body.description,
        details: body.details,
        templateStructure: body.templateStructure,
        icon: body.icon,
        color: body.color,
      },
      { new: true }
    );

    if (!updatedType) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedType);
  } catch (error) {
    console.error('Error updating ticket type:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}  */