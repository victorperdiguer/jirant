import mongoose, { Schema, Document, Types } from 'mongoose';

interface ITicketType extends Document {
  name: string; // Name of the ticket type
  createdBy: Types.ObjectId | null; // Null for predefined types, user ID for custom types
}

const TicketTypeSchema = new Schema<ITicketType>({
  name: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // Null for default types
});

export default mongoose.models.TicketType || mongoose.model<ITicketType>('TicketType', TicketTypeSchema);