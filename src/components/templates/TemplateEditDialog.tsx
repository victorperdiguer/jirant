'use client'
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogHeader
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, GripVertical, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import { ITicketType, ITemplateSection } from "@/types/ticket-types";
import { availableIcons } from "@/config/ticketTypeIcons";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface TemplateEditDialogProps {
  template: ITicketType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: ITicketType) => Promise<void>;
  onDelete?: (template: ITicketType) => Promise<void>;
  onRestore?: (template: ITicketType) => Promise<void>;
}

export function TemplateEditDialog({ template, isOpen, onClose, onSave, onDelete, onRestore }: TemplateEditDialogProps) {
  const { toast } = useToast();
  const [editedTemplate, setEditedTemplate] = useState<ITicketType>({...template});
  const [previewContent, setPreviewContent] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(template?.icon || 'task');
  const [selectedColor, setSelectedColor] = useState(template?.color || 'text-blue-500');
  const [selectedTier, setSelectedTier] = useState(template?.tier || 3);

  const handleSectionChange = (index: number, field: keyof ITemplateSection, value: string) => {
    const newSections = [...(editedTemplate.templateStructure || [])];
    newSections[index] = { ...newSections[index], [field]: value };
    setEditedTemplate({
      ...editedTemplate,
      templateStructure: newSections
    });
  };

  const addSection = () => {
    setEditedTemplate({
      ...editedTemplate,
      templateStructure: [
        ...(editedTemplate.templateStructure || []),
        { sectionTitle: "New Section", content: "" }
      ]
    });
  };

  const removeSection = (index: number) => {
    const newSections = [...(editedTemplate.templateStructure || [])];
    newSections.splice(index, 1);
    setEditedTemplate({
      ...editedTemplate,
      templateStructure: newSections
    });
  };

  const handleSave = async () => {
    const updatedTemplate = {
      ...editedTemplate,
      icon: selectedIcon,
      color: selectedColor,
      tier: selectedTier
    };
    
    await onSave(updatedTemplate);
    onClose();
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      // First check if the template is in use
      const checkResponse = await fetch(`/api/ticket-types/${template._id}/check-usage`);
      const { isInUse, count } = await checkResponse.json();
      
      if (isInUse) {
        toast({
          variant: "destructive",
          title: "Cannot delete template",
          description: (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>
                This template cannot be deleted because it is being used by {count} active ticket{count !== 1 ? 's' : ''}.
              </span>
            </div>
          ),
        });
        return;
      }

      // If not in use, proceed with deletion
      const templateCopy = { ...template };
      await onDelete(template);
      onClose();
      
      toast({
        title: "Template deleted",
        description: (
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <span>
              Template <span className="font-bold">{template.name}</span> has been deleted
            </span>
          </div>
        ),
        action: (
          <ToastAction 
            altText="Undo" 
            onClick={async () => {
              try {
                await onRestore?.(templateCopy);
                toast({
                  title: "Template restored",
                  description: (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>
                        Template <span className="font-bold">{templateCopy.name}</span> has been restored
                      </span>
                    </div>
                  ),
                });
              } catch (error) {
                console.error('Error restoring template:', error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to restore template. Please try again.",
                });
              }
            }}
          >
            Undo
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete template. Please try again.",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[1000px] h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Edit Template: {editedTemplate.name}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Template Editor */}
            <div className="flex-1 border-r overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6 pr-4 pl-1">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Name</label>
                      <Input
                        value={editedTemplate.name}
                        onChange={(e) => setEditedTemplate({...editedTemplate, name: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Description</label>
                      <Textarea
                        value={editedTemplate.description || ''}
                        onChange={(e) => setEditedTemplate({...editedTemplate, description: e.target.value})}
                        placeholder="Descripción que aparecerá en la card de la plantilla"
                        className="h-20"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Details</label>
                      <Textarea
                        value={editedTemplate.details || ''}
                        onChange={(e) => setEditedTemplate({...editedTemplate, details: e.target.value})}
                        placeholder="Detalla como quieres que sea de específica nuestra plataforma al crear los tickets con esta plantilla"
                        className="h-20"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Structure</h3>
                      <Button size="sm" variant="outline" onClick={addSection}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Section
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {editedTemplate.templateStructure?.map((section, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-3 relative group"
                        >
                          <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="flex justify-between items-start">
                            <Input
                              value={section.sectionTitle}
                              onChange={(e) => handleSectionChange(index, 'sectionTitle', e.target.value)}
                              placeholder="Section Title"
                              className="mb-2"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeSection(index)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={section.content || ''}
                            onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                            placeholder="Default content or instructions"
                            className="h-20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {availableIcons.map((iconConfig) => {
                        const Icon = iconConfig.icon;
                        return (
                          <Button
                            key={iconConfig.id}
                            type="button"
                            variant={selectedIcon === iconConfig.id ? "default" : "outline"}
                            className="flex items-center gap-2"
                            onClick={() => {
                              setSelectedIcon(iconConfig.id);
                              setSelectedColor(iconConfig.color);
                            }}
                          >
                            <Icon className={cn("h-4 w-4", iconConfig.color)} />
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Hierarchy Tier</Label>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-[200px] p-2">
                          <p className="text-sm text-muted-foreground">
                            Tier 1 is highest hierarchy, Tier 5 is lowest. This determines which tickets "belong" to which other tickets after linking them.
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <RadioGroup
                      value={selectedTier.toString()}
                      onValueChange={(value) => setSelectedTier(parseInt(value))}
                      className="grid grid-cols-5 gap-2"
                    >
                      {[1, 2, 3, 4, 5].map((tier) => (
                        <div key={tier} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={tier.toString()}
                            id={`tier-${tier}`}
                            className="peer"
                          />
                          <Label
                            htmlFor={`tier-${tier}`}
                            className="peer-data-[state=checked]:text-primary"
                          >
                            Tier {tier}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-muted/50 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Preview</h2>
                  <div className="bg-background rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">{editedTemplate.name}</h3>
                    {editedTemplate.templateStructure?.map((section, index) => (
                      <div key={index} className="mb-4">
                        <h4 className="font-medium mb-2">{section.sectionTitle}</h4>
                        <p className="text-sm">{section.content || 'Content will appear here...'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex justify-between gap-2 bg-background">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Template
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}