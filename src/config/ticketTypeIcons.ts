import { 
  BookOpen, 
  Lightbulb, 
  CheckSquare, 
  Palette, 
  LineChart, 
  Bug,
  LucideIcon,
  FileText,
  Zap,
  Flag,
  ShieldCheck,
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
  },
  'feature': {
    icon: Zap,
    label: 'Feature',
    color: 'text-purple-500'
  },
  'initiative': {
    icon: Flag,
    label: 'Initiative',
    color: 'text-orange-500'
  },
  'security': {
    icon: ShieldCheck,
    label: 'Security',
    color: 'text-yellow-500'
  },
  'documentation': {
    icon: FileText,
    label: 'Documentation',
    color: 'text-blue-500'
  }
};

export const availableIcons = Object.entries(defaultTicketTypes).map(([key, value]) => ({
  id: key,
  ...value
})); 