import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import TicketType from '../../../../../models/TicketType';

export async function PUT(
  request: NextRequest
) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(request.url);
    const typeId = searchParams.get('typeId');
    const updateData = await request.json();

    // Remove _id from update data if it exists
    const { _id, ...updateFields } = updateData;
    console.log(_id)
    // Validate required fields
    if (!updateFields.name || !updateFields.icon || !updateFields.color || !updateFields.details) {
      return NextResponse.json(
        { message: 'Name, icon, color, and details are required' },
        { status: 400 }
      );
    }

    // Validate tier
    const tier = parseInt(updateFields.tier);
    if (isNaN(tier) || tier < 1 || tier > 5) {
      return NextResponse.json(
        { message: 'Tier must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // Ensure tier is a number in the update fields
    updateFields.tier = tier;

    // Validate template structure
    if (!Array.isArray(updateFields.templateStructure)) {
      return NextResponse.json(
        { message: 'Template structure must be an array' },
        { status: 400 }
      );
    }

    for (const section of updateFields.templateStructure) {
      if (!section.sectionTitle || typeof section.content !== 'string') {
        return NextResponse.json(
          { message: 'Each template section must have a sectionTitle and content' },
          { status: 400 }
        );
      }
    }

    // Find and update the ticket type
    console.log(updateFields);
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
  request: NextRequest
) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(request.url);
    const typeId = searchParams.get('typeId');
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
  request: NextRequest
) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(request.url);
    const typeId = searchParams.get('typeId');
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