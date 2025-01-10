import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketType extends Document {
  name: string;
  details: string;
  templateStructure: string[];
  icon: string;
  color: string;
}

const TicketTypeSchema = new Schema<ITicketType>({
  name: { type: String, required: true },
  details: { type: String, required: true },
  templateStructure: [{ type: String }],
  icon: { type: String, required: true },
  color: { type: String, required: true },
});

const TicketType = mongoose.models.TicketType || mongoose.model<ITicketType>('TicketType', TicketTypeSchema);

export default TicketType;