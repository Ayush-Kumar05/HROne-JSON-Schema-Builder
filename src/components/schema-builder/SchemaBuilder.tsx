import React, { useState, useCallback } from 'react';
import { Plus, Download, FileText, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import FieldRow from './FieldRow';
import JsonPreview from './JsonPreview';
import SchemaStats from './SchemaStats';
import { SchemaField } from '@/types/schema';
import { exportToJson } from '@/utils/schemaUtils';

const SchemaBuilder: React.FC = () => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const { toast } = useToast();

  const generateId = () => {
    return 'field_' + Math.random().toString(36).substr(2, 9);
  };

  const addField = useCallback((parentId?: string) => {
    const newField: SchemaField = {
      id: generateId(),
      name: '',
      type: 'String',
    };

    setFields(prevFields => {
      if (!parentId) {
        return [...prevFields, newField];
      }

      const updateFieldsRecursively = (fields: SchemaField[]): SchemaField[] => {
        return fields.map(field => {
          if (field.id === parentId) {
            return {
              ...field,
              children: [...(field.children || []), newField]
            };
          }
          if (field.children) {
            return {
              ...field,
              children: updateFieldsRecursively(field.children)
            };
          }
          return field;
        });
      };

      return updateFieldsRecursively(prevFields);
    });
  }, []);

  const updateField = useCallback((id: string, updates: Partial<SchemaField>) => {
    setFields(prevFields => {
      const updateFieldsRecursively = (fields: SchemaField[]): SchemaField[] => {
        return fields.map(field => {
          if (field.id === id) {
            return { ...field, ...updates };
          }
          if (field.children) {
            return {
              ...field,
              children: updateFieldsRecursively(field.children)
            };
          }
          return field;
        });
      };

      return updateFieldsRecursively(prevFields);
    });
  }, []);

  const deleteField = useCallback((id: string) => {
    setFields(prevFields => {
      const deleteFieldRecursively = (fields: SchemaField[]): SchemaField[] => {
        return fields
          .filter(field => field.id !== id)
          .map(field => {
            if (field.children) {
              return {
                ...field,
                children: deleteFieldRecursively(field.children)
              };
            }
            return field;
          });
      };

      return deleteFieldRecursively(prevFields);
    });
  }, []);

  const exportSchema = useCallback(() => {
    const jsonString = exportToJson(fields);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Schema exported",
      description: "JSON schema has been downloaded successfully.",
    });
  }, [fields, toast]);

  const copyToClipboard = useCallback(() => {
    const jsonString = exportToJson(fields);
    navigator.clipboard.writeText(jsonString).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "JSON schema has been copied to clipboard.",
      });
    });
  }, [fields, toast]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            HROne JSON Schema Builder
          </h1>
          <p className="text-muted-foreground mb-4">
            Create dynamic JSON schemas with nested fields and real-time preview
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              disabled={fields.length === 0}
              className="gap-2"
            >
              <Code size={16} />
              Copy JSON
            </Button>
            <Button
              variant="outline"
              onClick={exportSchema}
              disabled={fields.length === 0}
              className="gap-2"
            >
              <Download size={16} />
              Export Schema
            </Button>
          </div>
        </div>

        <SchemaStats fields={fields} />

        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="builder" className="gap-2">
              <FileText size={16} />
              Schema Builder
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Code size={16} />
              JSON Preview
            </TabsTrigger>
          </TabsList>

         

          <TabsContent value="preview">
            <JsonPreview fields={fields} />
          </TabsContent>
        </Tabs>

        {/* Desktop: Side by side view */}
        <div className="hidden lg:block mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Schema Builder</CardTitle>
                <Button onClick={() => addField()} size="sm" className="gap-2">
                  <Plus size={14} />
                  Add Field
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No fields added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <FieldRow
                        key={field.id}
                        field={field}
                        onUpdateField={updateField}
                        onDeleteField={deleteField}
                        onAddField={addField}
                        depth={0}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <JsonPreview fields={fields} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaBuilder;