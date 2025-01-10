import { 
  BookOpen, 
  Lightbulb, 
  CheckSquare, 
  Palette, 
  LineChart, 
  Bug,
  LucideIcon 
} from "lucide-react";

export interface TicketTypeIcon {
  icon: LucideIcon;
  label: string;
  color: string;
}

export const defaultTicketTypes: { [key: string]: TicketTypeIcon } = {
  'user-story': {
    icon: BookOpen,
    label: 'User Story',
    color: 'text-green-500'
  },
  'epic': {
    icon: Lightbulb,
    label: 'Epic',
    color: 'text-purple-500'
  },
  'task': {
    icon: CheckSquare,
    label: 'Task',
    color: 'text-blue-500'
  },
  'uxui-task': {
    icon: Palette,
    label: 'UX/UI Task',
    color: 'text-orange-500'
  },
  'analysis-task': {
    icon: LineChart,
    label: 'Analysis Task',
    color: 'text-pink-500'
  },
  'bug': {
    icon: Bug,
    label: 'Bug',
    color: 'text-red-500'
  }
};

export const availableIcons = Object.entries(defaultTicketTypes).map(([key, value]) => ({
  id: key,
  ...value
})); 