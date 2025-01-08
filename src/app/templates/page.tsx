'use client'
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bug, FileText, Zap, Lightbulb, Check, ArrowLeft } from "lucide-react";
import { ITicketType } from '@/types/ticket-types';
import { TemplateEditDialog } from "@/components/templates/TemplateEditDialog";
import Link from "next/link";
import { Sidebar } from "@/components/workspace/Sidebar";

const iconMap = {
  'task': Check,
  'user-story': FileText,
  'bug': Bug,
  'epic': Lightbulb,
  'spike': Zap,
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ITicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ITicketType | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/ticket-types');
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const getIcon = (templateName: string) => {
    const key = templateName.toLowerCase().replace(/\s+/g, '-') as keyof typeof iconMap;
    const Icon = iconMap[key] || Check;
    return <Icon className="h-6 w-6 text-muted-foreground" />;
  };

  const handleSaveTemplate = async (editedTemplate: ITicketType) => {
    try {
      const response = await fetch(`/api/ticket-types/${editedTemplate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTemplate),
      });

      if (!response.ok) throw new Error('Failed to update template');

      // Update local state
      setTemplates(templates.map(t => 
        t._id === editedTemplate._id ? editedTemplate : t
      ));
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Ticket Templates</h1>
              <Link href="/workspace">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Workspace
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card 
                  key={template._id}
                  className="hover:border-primary cursor-pointer transition-colors"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {getIcon(template.name)}
                      <CardTitle>{template.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {template.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {selectedTemplate && (
          <TemplateEditDialog
            template={selectedTemplate}
            isOpen={!!selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            onSave={handleSaveTemplate}
          />
        )}
      </div>
    </div>
  );
} 