import mongoose, { Schema, Document, Types } from 'mongoose';

interface ITemplateSection {
  sectionTitle: string; // Title of the section
  fieldTitle: string;   // Label for the field in this section
  content?: string;     // Placeholder or predefined content
}

interface ITicketType extends Document {
  name: string;
  description?: string;            // Description of the template
  details?: string;                // Instructions or detailed notes
  templateStructure?: ITemplateSection[]; // List of sections in the template
  createdBy: Types.ObjectId | null;
}

const TemplateSectionSchema = new Schema<ITemplateSection>({
  sectionTitle: { type: String, required: true },
  fieldTitle: { type: String, required: true },
  content: { type: String, default: '' },
});

const TicketTypeSchema = new Schema<ITicketType>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  details: { type: String, default: '' },
  templateStructure: { type: [TemplateSectionSchema], default: [] },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
});

export default mongoose.models.TicketType ||
  mongoose.model<ITicketType>('TicketType', TicketTypeSchema);