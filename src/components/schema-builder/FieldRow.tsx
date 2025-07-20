import React from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SchemaField, FieldType } from '@/types/schema';
import { validateFieldName } from '@/utils/schemaUtils';

interface FieldRowProps {
  field: SchemaField;
  onUpdateField: (id: string, updates: Partial<SchemaField>) => void;
  onDeleteField: (id: string) => void;
  onAddField: (parentId?: string) => void;
  depth: number;
}

const FieldRow: React.FC<FieldRowProps> = ({
  field,
  onUpdateField,
  onDeleteField,
  onAddField,
  depth
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [nameError, setNameError] = React.useState('');
  
  const handleNameChange = (value: string) => {
    if (value.trim() && !validateFieldName(value)) {
      setNameError('Field name must be valid (alphanumeric, underscore, no spaces)');
    } else {
      setNameError('');
    }
    onUpdateField(field.id, { name: value });
  };

  const handleTypeChange = (value: FieldType) => {
    const updates: Partial<SchemaField> = { type: value };
    if (value === 'Nested' && !field.children) {
      updates.children = [];
    } else if (value !== 'Nested') {
      updates.children = undefined;
    }
    onUpdateField(field.id, updates);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-2">
      <Card className={`p-4 ${nameError ? 'border-destructive' : ''}`} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {field.type === 'Nested' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </Button>
            )}
            
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Field name (e.g., user_name, age)"
                  value={field.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`${nameError ? 'border-destructive' : ''}`}
                />
                {nameError && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle size={12} />
                    {nameError}
                  </div>
                )}
              </div>
              
              <Select value={field.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="String">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Str</Badge>
                      String
                    </div>
                  </SelectItem>
                  <SelectItem value="Number">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Num</Badge>
                      Number
                    </div>
                  </SelectItem>
                  <SelectItem value="Nested">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Obj</Badge>
                      Nested
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {field.type === 'Nested' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddField(field.id)}
                  className="h-8"
                >
                  <Plus size={14} className="mr-1" />
                  Add Field
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteField(field.id)}
                className="h-8 text-destructive hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {field.type === 'Nested' && field.children && field.children.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {field.children.length} child field{field.children.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </Card>

      {field.type === 'Nested' && field.children && isExpanded && (
        <div className="space-y-2">
          {field.children.map((child) => (
            <FieldRow
              key={child.id}
              field={child}
              onUpdateField={onUpdateField}
              onDeleteField={onDeleteField}
              onAddField={onAddField}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldRow;