import { NextRequest, NextResponse } from 'next/server';
import {connectToDatabase} from '../../../../lib/mongodb';
import TicketType from '../../../../models/TicketType';

export async function GET() {
  await connectToDatabase();

  try {
    const ticketTypes = await TicketType.find();
    return NextResponse.json(ticketTypes, {status: 200})
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ticket types' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectToDatabase()

  try {
    const {name, createdBy} = await request.json()
    const ticketType = await TicketType.create({ name, createdBy })
    return NextResponse.json(ticketType, {status: 201})
  } catch (error) {
      return NextResponse.json({ message: "Couldn't create ticket type", error }, { status: 500 });
  }
}