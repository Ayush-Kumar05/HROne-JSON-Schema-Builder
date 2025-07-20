import { SchemaField, JsonOutput } from '@/types/schema';

export const validateFieldName = (name: string): boolean => {
  return name.trim().length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name.trim());
};

export const getDefaultValue = (type: string): any => {
  switch (type) {
    case 'String':
      return 'sample string';
    case 'Number':
      return 42;
    case 'Nested':
      return {};
    default:
      return null;
  }
};

export const flattenFields = (fields: SchemaField[]): SchemaField[] => {
  const result: SchemaField[] = [];
  
  const traverse = (fieldList: SchemaField[]) => {
    fieldList.forEach(field => {
      result.push(field);
      if (field.children) {
        traverse(field.children);
      }
    });
  };
  
  traverse(fields);
  return result;
};

export const countFields = (fields: SchemaField[]): number => {
  return flattenFields(fields).length;
};

export const exportToJson = (fields: SchemaField[]): string => {
  const generateOutput = (fieldList: SchemaField[]): JsonOutput => {
    const result: JsonOutput = {};
    
    fieldList.forEach((field) => {
      if (field.name.trim()) {
        result[field.name] = getDefaultValue(field.type);
        if (field.type === 'Nested' && field.children && field.children.length > 0) {
          result[field.name] = generateOutput(field.children);
        }
      }
    });
    
    return result;
  };

  return JSON.stringify(generateOutput(fields), null, 2);
};