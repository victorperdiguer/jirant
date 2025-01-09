'use client'
import { cn } from "@/lib/utils";

interface FormattedMessageProps {
  content: string;
  className?: string;
}

export function FormattedMessage({ content, className }: FormattedMessageProps) {
  // Helper function to process inline formatting (bold text)
  const processInlineFormatting = (text: string): JSX.Element => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            // Remove the asterisks and apply bold styling
            return <strong key={index}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </>
    );
  };

  const parseContent = (text: string): JSX.Element => {
    const lines = text.split('\n');
    let inList = false;
    let listType: 'ordered' | 'unordered' | null = null;
    let currentListItems: string[] = [];
    const elements: JSX.Element[] = [];
    let key = 0;

    const processListItems = () => {
      if (currentListItems.length > 0) {
        if (listType === 'ordered') {
          elements.push(
            <ol key={key++} className="list-decimal pl-6 my-2">
              {currentListItems.map((item, i) => (
                <li key={i} className="my-1">
                  {processInlineFormatting(item.replace(/^\d+\.\s*/, ''))}
                </li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={key++} className="list-disc pl-6 my-2">
              {currentListItems.map((item, i) => (
                <li key={i} className="my-1">
                  {processInlineFormatting(item.replace(/^[-•*]\s*/, ''))}
                </li>
              ))}
            </ul>
          );
        }
        currentListItems = [];
      }
      inList = false;
      listType = null;
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        if (inList) processListItems();
        elements.push(<br key={key++} />);
        return;
      }

      // Headers (both # and ** styles)
      if (trimmedLine.startsWith('#') || /^\*\*[^*]+\*\*$/.test(trimmedLine)) {
        if (inList) processListItems();
        
        let level = 1;
        let text = trimmedLine;

        if (trimmedLine.startsWith('#')) {
          level = trimmedLine.match(/^#+/)?.[0].length || 1;
          text = trimmedLine.replace(/^#+\s*/, '');
        } else {
          // For ** style headers, remove the asterisks
          text = trimmedLine.replace(/^\*\*|\*\*$/g, '');
          // Determine header level based on if it looks like a main title
          level = text.length <= 50 ? 1 : 2; // Shorter texts are likely main titles
        }

        const headerClasses = {
          1: 'text-2xl font-bold mt-4 mb-2',
          2: 'text-xl font-bold mt-3 mb-2',
          3: 'text-lg font-semibold mt-2 mb-1',
          4: 'text-base font-semibold mt-2 mb-1',
          5: 'text-sm font-semibold mt-2 mb-1',
          6: 'text-xs font-semibold mt-2 mb-1',
        }[level] || 'text-base font-semibold';

        elements.push(
          <div key={key++} className={headerClasses}>
            {processInlineFormatting(text)}
          </div>
        );
        return;
      }

      // Ordered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        if (!inList || listType !== 'ordered') {
          if (inList) processListItems();
          inList = true;
          listType = 'ordered';
        }
        currentListItems.push(trimmedLine);
        return;
      }

      // Unordered lists
      if (/^[-•*]\s/.test(trimmedLine)) {
        if (!inList || listType !== 'unordered') {
          if (inList) processListItems();
          inList = true;
          listType = 'unordered';
        }
        currentListItems.push(trimmedLine);
        return;
      }

      // Regular paragraph
      if (inList) processListItems();
      elements.push(
        <p key={key++} className="my-2">
          {processInlineFormatting(trimmedLine)}
        </p>
      );
    });

    // Process any remaining list items
    if (inList) processListItems();

    return <div className="space-y-1">{elements}</div>;
  };

  return (
    <div className={cn("text-sm", className)}>
      {parseContent(content)}
    </div>
  );
} 