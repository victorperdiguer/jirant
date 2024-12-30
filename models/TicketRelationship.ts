import mongoose, { Schema, Document, Types } from 'mongoose';

interface ITicketRelationship extends Document {
  ticket1: Types.ObjectId;
  ticket2: Types.ObjectId;
  relationshipType?: string; // Optional: type of relationship (e.g., "duplicate", "related", etc.)
}

const TicketRelationshipSchema = new Schema<ITicketRelationship>({
  ticket1: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  ticket2: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  relationshipType: { type: String, default: 'related' }, // Default relationship type
});

export default mongoose.models.TicketRelationship ||
  mongoose.model<ITicketRelationship>('TicketRelationship', TicketRelationshipSchema);