import mongoose, { Schema, Document } from 'mongoose';

interface ITemplateSection {
  sectionTitle: string;
  content: string;
}

export interface ITicketType extends Document {
  name: string;
  description?: string;
  details: string;
  templateStructure: ITemplateSection[];
  icon: string;
  color: string;
  tier: number;
  createdBy: mongoose.Types.ObjectId | null;
}

const TemplateSectionSchema = new Schema<ITemplateSection>({
  sectionTitle: { type: String, required: true },
  content: { type: String, default: '' },
});

const TicketTypeSchema = new Schema<ITicketType>({
  name: { type: String, required: true },
  description: { type: String },
  details: { type: String, required: true },
  templateStructure: [TemplateSectionSchema],
  icon: { type: String, required: true },
  color: { type: String, required: true },
  tier: { type: Number, required: true, default: 3, min: 1, max: 5 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
});

const TicketType = mongoose.models.TicketType || mongoose.model<ITicketType>('TicketType', TicketTypeSchema);

export default TicketType;