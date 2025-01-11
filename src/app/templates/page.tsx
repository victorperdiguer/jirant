'use client'
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, CheckCircle2 } from "lucide-react";
import { ITicketType } from '@/types/ticket-types';
import { TemplateEditDialog } from "@/components/templates/TemplateEditDialog";
import Link from "next/link";
import { Sidebar } from "@/components/workspace/Sidebar";
import { defaultTicketTypes } from "@/config/ticketTypeIcons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ITicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ITicketType | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/ticket-types');
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        console.log(data);
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const getIcon = (template: ITicketType) => {
    const iconConfig = defaultTicketTypes[template.icon];
    if (!iconConfig) return null;
    
    const Icon = iconConfig.icon;
    return <Icon className={cn("h-6 w-6", template.color)} />;
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

      // Show success toast
      toast({
        title: "Template updated",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>
              Template <span className="font-bold">{editedTemplate.name}</span> has been updated successfully.
            </span>
          </div>
        ),
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update template. Please try again.",
      });
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate: ITicketType = {
      _id: '',
      name: 'New Template',
      description: 'New template description',
      details: 'Describe how specific you want the tickets to be',
      templateStructure: [
        {
          sectionTitle: 'Description',
          content: 'Describe what needs to be done'
        }
      ],
      icon: 'task',
      color: 'text-blue-500',
      tier: 3,
      createdBy: null
    };
    
    setSelectedTemplate(newTemplate);
  };

  const handleDeleteTemplate = async (template: ITicketType) => {
    try {
      const response = await fetch(`/api/ticket-types/${template._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete template');

      // Update local state
      setTemplates(templates.filter(t => t._id !== template._id));
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete template. Please try again.",
      });
    }
  };

  const handleRestoreTemplate = async (template: ITicketType) => {
    try {
      const { _id, ...templateWithoutId } = template;
      const response = await fetch('/api/ticket-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateWithoutId),
      });

      if (!response.ok) throw new Error('Failed to restore template');
      const restoredTemplate = await response.json();
      
      // Update local state
      setTemplates([...templates, restoredTemplate]);
    } catch (error) {
      throw error; // Let the TemplateEditDialog handle the error
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
              <Card 
                className="hover:border-primary cursor-pointer transition-colors border-dashed"
                onClick={handleCreateTemplate}
              >
                <CardHeader className="min-h-[105px] flex flex-col justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Plus className="h-8 w-8" />
                    <span className="text-sm font-medium">Create New Template</span>
                  </div>
                </CardHeader>
              </Card>

              {templates.map((template) => (
                <Card 
                  key={template._id}
                  className="hover:border-primary cursor-pointer transition-colors"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="min-h-[105px] flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon(template)}
                      <CardTitle>{template.name}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
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
            onDelete={handleDeleteTemplate}
            onRestore={handleRestoreTemplate}
          />
        )}
      </div>
    </div>
  );
} 