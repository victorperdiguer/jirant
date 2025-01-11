import mongoose, { Schema, Document } from 'mongoose';

interface ITemplateSection {
  sectionTitle: string;
  fieldTitle: string;
  content?: string;
}

export interface ITicketType extends Document {
  name: string;
  description?: string;
  details: string;
  templateStructure: ITemplateSection[];
  icon: string;
  color: string;
  createdBy: mongoose.Types.ObjectId | null;
}

// Create a schema for the template section
const TemplateSectionSchema = new Schema<ITemplateSection>({
  sectionTitle: { type: String, required: true },
  fieldTitle: { type: String, required: true },
  content: { type: String, default: '' },
});

const TicketTypeSchema = new Schema<ITicketType>({
  name: { type: String, required: true },
  description: { type: String },
  details: { type: String, required: true },
  templateStructure: [TemplateSectionSchema], // Use the section schema here
  icon: { type: String, required: true },
  color: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
});

const TicketType = mongoose.models.TicketType || mongoose.model<ITicketType>('TicketType', TicketTypeSchema);

export default TicketType;