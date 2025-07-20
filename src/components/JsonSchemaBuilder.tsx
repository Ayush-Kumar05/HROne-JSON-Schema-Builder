import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Copy, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface SchemaField {
  id: string;
  name: string;
  type: string;
  value: any;
  required?: boolean;
  children?: SchemaField[];
  parentId?: string;
}

const DATA_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'array', label: 'Array' },
  { value: 'object', label: 'Nested' },
  { value: 'objectId', label: 'ObjectId' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'uuid', label: 'UUID' },
];

export const JsonSchemaBuilder: React.FC = () => {
  const [fields, setFields] = useState<SchemaField[]>([
    { id: '1', name: '', type: 'string', value: '' },
    { id: '2', name: '', type: 'string', value: '' },
  ]);
  const { toast } = useToast();

  const addField = (parentId?: string) => {
    const newField: SchemaField = {
      id: Date.now().toString(),
      name: '',
      type: 'string',
      value: '',
      parentId,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id && field.parentId !== id));
  };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const getAllFields = (): SchemaField[] => {
    const buildTree = (parentId?: string): SchemaField[] => {
      return fields
        .filter(field => field.parentId === parentId)
        .map(field => ({
          ...field,
          children: buildTree(field.id)
        }));
    };
    return buildTree();
  };

  const generateJson = () => {
    const buildJsonFromFields = (fieldList: SchemaField[]): any => {
      const json: any = {};
      fieldList.forEach(field => {
        if (field.name) {
          if (field.type === 'object' && field.children && field.children.length > 0) {
            json[field.name] = buildJsonFromFields(field.children);
          } else {
            json[field.name] = field.value || getDefaultValue(field.type);
          }
        }
      });
      return json;
    };
    
    return buildJsonFromFields(getAllFields());
  };

  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'string':
      case 'email':
      case 'url':
      case 'uuid':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      case 'objectId':
        return '507f1f77bcf86cd799439011';
      case 'date':
        return new Date().toISOString();
      default:
        return '';
    }
  };

  const renderValueInput = (field: SchemaField) => {
    switch (field.type) {
      case 'boolean':
        return (
          <Select
            value={field.value?.toString() || 'false'}
            onValueChange={(value) => updateField(field.id, { value: value === 'true' })}
          >
            <SelectTrigger className="bg-field-bg border-field-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">true</SelectItem>
              <SelectItem value="false">false</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            placeholder="Enter number"
            value={field.value || ''}
            onChange={(e) => updateField(field.id, { value: Number(e.target.value) || 0 })}
            className="bg-field-bg border-field-border"
          />
        );
      case 'array':
        return (
          <Input
            placeholder='["item1", "item2"]'
            value={Array.isArray(field.value) ? JSON.stringify(field.value) : field.value || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateField(field.id, { value: Array.isArray(parsed) ? parsed : [] });
              } catch {
                updateField(field.id, { value: e.target.value });
              }
            }}
            className="bg-field-bg border-field-border"
          />
        );
      case 'object':
        return (
          <Input
            placeholder='{"key": "value"}'
            value={typeof field.value === 'object' ? JSON.stringify(field.value) : field.value || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateField(field.id, { value: typeof parsed === 'object' ? parsed : {} });
              } catch {
                updateField(field.id, { value: e.target.value });
              }
            }}
            className="bg-field-bg border-field-border"
          />
        );
      default:
        return (
          <Input
            placeholder={`Enter ${field.type}`}
            value={field.value || ''}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
            className="bg-field-bg border-field-border"
          />
        );
    }
  };

  const renderFields = (fieldList: SchemaField[], depth = 0): React.ReactNode => {
    return fieldList.map((field) => (
      <div key={field.id} className="space-y-3">
        <div 
          className="p-4 bg-field-bg border border-field-border rounded-lg"
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="grid grid-cols-12 gap-3 items-start">
            <div className="col-span-4">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Field name
              </label>
              <Input
                placeholder="e.g., user_name, age"
                value={field.name}
                onChange={(e) => updateField(field.id, { name: e.target.value })}
                className="bg-field-bg border-field-border text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Type
              </label>
              <Select
                value={field.type}
                onValueChange={(value) => updateField(field.id, { type: value, value: getDefaultValue(value) })}
              >
                <SelectTrigger className="bg-field-bg border-field-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-4">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Value
              </label>
              {field.type === 'object' ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField(field.id)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Nested
                  </Button>
                </div>
              ) : (
                renderValueInput(field)
              )}
            </div>
            <div className="col-span-2 pt-6 flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeField(field.id)}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        {field.children && field.children.length > 0 && (
          <div className="space-y-3">
            {renderFields(field.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const copyJson = () => {
    const json = generateJson();
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    toast({
      title: "Copied!",
      description: "JSON copied to clipboard",
    });
  };

  const exportSchema = () => {
    const json = generateJson();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported!",
      description: "Schema exported as JSON file",
    });
  };

  const json = generateJson();
  const fieldCount = fields.filter(f => f.name).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              HROne JSON Schema Builder
            </h1>
            <p className="text-muted-foreground">
              Create dynamic JSON schemas with nested fields and real-time preview
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={copyJson} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy JSON
              </Button>
              <Button onClick={exportSchema} variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Export Schema
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 mt-6 text-sm text-muted-foreground">
            <span>Total Fields: <strong>{fieldCount}</strong></span>
            <span>String: <strong>{fields.filter(f => f.type === 'string' && f.name).length}</strong></span>
            <span>Number: <strong>{fields.filter(f => f.type === 'number' && f.name).length}</strong></span>
            <span>Memory usage: <strong>{Math.round(JSON.stringify(json).length / 1024)} KB</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schema Builder */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>📝</span>
                Schema Builder
              </CardTitle>
              <Button onClick={() => addField()} size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderFields(getAllFields())}
            </CardContent>
          </Card>

          {/* JSON Preview */}
          <Card className="bg-preview-bg border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-preview-text">
                <span>👁️</span>
                JSON Preview
              </CardTitle>
              <Button onClick={copyJson} variant="outline" size="sm" className="text-preview-text border-preview-text hover:bg-preview-text hover:text-preview-bg">
                <Copy className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-preview-bg text-preview-text font-mono text-sm p-4 rounded border border-preview-text/20 overflow-auto max-h-96">
                <pre>{JSON.stringify(json, null, 2)}</pre>
              </div>
              <div className="mt-3 text-xs text-preview-text/70">
                {fieldCount} fields • {Object.keys(json).length} properties
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};