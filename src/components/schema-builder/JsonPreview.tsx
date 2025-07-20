import React from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SchemaField, JsonOutput } from '@/types/schema';

interface JsonPreviewProps {
  fields: SchemaField[];
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ fields }) => {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();
  const generateJsonOutput = (fields: SchemaField[]): JsonOutput => {
    const result: JsonOutput = {};
    
    fields.forEach((field) => {
      if (field.name.trim()) {
        switch (field.type) {
          case 'String':
            result[field.name] = 'sample string';
            break;
          case 'Number':
            result[field.name] = 42;
            break;
          case 'Nested':
            if (field.children && field.children.length > 0) {
              result[field.name] = generateJsonOutput(field.children);
            } else {
              result[field.name] = {};
            }
            break;
        }
      }
    });
    
    return result;
  };

  const jsonOutput = generateJsonOutput(fields);
  const jsonString = JSON.stringify(jsonOutput, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "JSON schema copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Code size={20} />
          JSON Preview
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          disabled={fields.length === 0}
          className="gap-2"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="bg-muted p-8 rounded-md text-center text-muted-foreground">
            <Code size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No fields defined</p>
            <p className="text-sm">Add some fields to see the JSON preview</p>
          </div>
        ) : (
          <div className="relative">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap font-mono max-h-96 border">
              {jsonString}
            </pre>
            <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
              {Object.keys(jsonOutput).length} fields
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JsonPreview;