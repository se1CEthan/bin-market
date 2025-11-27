import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Terminal, 
  Loader2,
  Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface TestBoxProps {
  botTitle: string;
  botDescription: string;
}

export function TestBox({ botTitle, botDescription }: TestBoxProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleRun = () => {
    if (!input.trim()) {
      setOutput(['⚠️ Please enter some input to test the bot']);
      return;
    }

    setIsRunning(true);
    setOutput([`🤖 Running ${botTitle}...`, `📥 Input: ${input}`]);

    // Simulate realistic bot execution
    setTimeout(() => {
      setOutput(prev => [...prev, '⚙️ Initializing bot...']);
    }, 300);

    setTimeout(() => {
      setOutput(prev => [...prev, '✓ Bot loaded successfully']);
    }, 600);

    setTimeout(() => {
      setOutput(prev => [...prev, '✓ Processing input...']);
    }, 1000);

    setTimeout(() => {
      setOutput(prev => [...prev, '✓ Executing automation...']);
    }, 1500);

    setTimeout(() => {
      // Generate realistic output based on input
      const demoOutput = generateDemoOutput(input, botTitle);
      setOutput(prev => [
        ...prev,
        `📤 Result: ${demoOutput}`,
        '✅ Execution completed!',
        '',
        '💡 This is a demo. Purchase for full functionality.'
      ]);
      setIsRunning(false);
    }, 2500);
  };

  const generateDemoOutput = (userInput: string, title: string): string => {
    const lowerTitle = title.toLowerCase();
    const lowerInput = userInput.toLowerCase();

    // Generate contextual demo output based on bot type
    if (lowerTitle.includes('whatsapp') || lowerTitle.includes('message')) {
      return `Message sent successfully to ${userInput}`;
    } else if (lowerTitle.includes('instagram') || lowerTitle.includes('social')) {
      return `Posted to Instagram: "${userInput}"`;
    } else if (lowerTitle.includes('scraper') || lowerTitle.includes('scrape')) {
      return `Scraped 127 items from ${userInput}`;
    } else if (lowerTitle.includes('email')) {
      return `Email sent to ${userInput}`;
    } else if (lowerTitle.includes('ai') || lowerTitle.includes('gpt')) {
      return `AI Response: Processed "${userInput}" successfully`;
    } else if (lowerTitle.includes('data') || lowerTitle.includes('export')) {
      return `Exported data: ${userInput}.csv (245 rows)`;
    } else {
      return `Processed: ${userInput} - Operation completed`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2" size="lg">
          <Sparkles className="h-4 w-4" />
          Try Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            TestBox - Try {botTitle}
            <Badge variant="secondary" className="ml-2">Demo</Badge>
          </DialogTitle>
          <DialogDescription>
            Test this bot in a safe sandbox environment before purchasing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Input</label>
            <Input
              placeholder="Enter test data (e.g., URL, text, command)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isRunning}
              className="font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isRunning && input.trim()) {
                  handleRun();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Press Enter or click Run to test
            </p>
          </div>

          <Button
            onClick={handleRun}
            disabled={isRunning || !input.trim()}
            className="w-full gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Demo...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Demo
              </>
            )}
          </Button>

          {output.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Output</label>
              <div className="bg-black/95 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[200px] max-h-[300px] overflow-y-auto">
                {output.map((line, index) => (
                  <div key={index} className="mb-1">
                    {line}
                  </div>
                ))}
                {isRunning && (
                  <div className="animate-pulse inline-block">▊</div>
                )}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2">
            <p className="font-medium flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              About This Demo
            </p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Safe sandbox - no real actions performed</li>
              <li>• Limited demo to preview bot behavior</li>
              <li>• Purchase for full functionality</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
