import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SchemaField } from '@/types/schema';
import { countFields, flattenFields } from '@/utils/schemaUtils';

interface SchemaStatsProps {
  fields: SchemaField[];
}

const SchemaStats: React.FC<SchemaStatsProps> = ({ fields }) => {
  const totalFields = countFields(fields);
  const allFields = flattenFields(fields);
  
  const typeCount = {
    String: allFields.filter(f => f.type === 'String').length,
    Number: allFields.filter(f => f.type === 'Number').length,
    Nested: allFields.filter(f => f.type === 'Nested').length,
  };

  const maxDepth = (fieldList: SchemaField[], depth = 0): number => {
    if (fieldList.length === 0) return depth;
    
    let max = depth;
    fieldList.forEach(field => {
      if (field.children && field.children.length > 0) {
        max = Math.max(max, maxDepth(field.children, depth + 1));
      }
    });
    return max;
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            Total Fields: {totalFields}
          </Badge>
          <Badge variant="outline">
            String: {typeCount.String}
          </Badge>
          <Badge variant="outline">
            Number: {typeCount.Number}
          </Badge>
          <Badge variant="outline">
            Nested: {typeCount.Nested}
          </Badge>
          <Badge variant="outline">
            Max Depth: {maxDepth(fields)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchemaStats;