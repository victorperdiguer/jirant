import mongoose, { Schema, Document, Types } from 'mongoose';

interface ITicket extends Document {
  title: string;
  description: string;
  status: 'active' | 'deleted';
  createdBy: Types.ObjectId;
  relatedTickets: Types.ObjectId[];
  ticketType: string;
  createdAt: Date;
}

const TicketSchema = new Schema<ITicket>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'active', enum: ['active', 'deleted'] },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  relatedTickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
  ticketType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITicket>('Ticket', TicketSchema);