import { Types } from 'mongoose';

export interface ITemplateSection {
  sectionTitle: string;
  fieldTitle: string;
  content?: string;
}

export interface ITicketType {
  _id: string;
  name: string;
  description?: string;
  details?: string;
  templateStructure?: ITemplateSection[];
  createdBy: Types.ObjectId | null;
}

export interface ParsedTicketSection {
  sectionTitle: string;
  content: string;
}

export interface ParsedAIResponse {
  title: string;
  sections: ParsedTicketSection[];
  rawContent: string;
} 