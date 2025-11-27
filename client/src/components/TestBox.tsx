import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Terminal, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface TestBoxProps {
  botTitle: string;
  botDescription: string;
}

export function TestBox({ botTitle, botDescription }: TestBoxProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const handleRun = () => {
    if (!input.trim()) {
      setOutput(prev => [...prev, '⚠️ Please enter some input to test the bot']);
      return;
    }

    setIsRunning(true);
    setStatus('running');
    setOutput(prev => [...prev, `\n🤖 Running ${botTitle}...`, `📥 Input: ${input}`]);

    // Simulate bot execution
    setTimeout(() => {
      setOutput(prev => [
        ...prev,
        '⚙️ Processing...',
        '✓ Bot initialized successfully',
        '✓ Input validated',
        '✓ Executing automation...',
        `📤 Output: Demo response for "${input}"`,
        '✅ Execution completed successfully!',
        '\n💡 This is a demo sandbox. Purchase the bot to use it fully.'
      ]);
      setStatus('success');
      setIsRunning(false);
    }, 2000);
  };

  const handleStop = () => {
    setIsRunning(false);
    setStatus('error');
    setOutput(prev => [...prev, '\n⛔ Execution stopped by user']);
  };

  const handleReset = () => {
    setInput('');
    setOutput([]);
    setStatus('idle');
    setIsRunning(false);
  };

  return (
    <Card className={`border-2 ${isExpanded ? 'fixed inset-4 z-50 overflow-auto' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>TestBox - Demo Sandbox</CardTitle>
            <Badge variant="secondary" className="ml-2">
              Safe Environment
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Try {botTitle} in a safe sandbox environment before purchasing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a demo environment with limited functionality. Purchase the bot to unlock all features.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="testInput">Test Input</Label>
          <Textarea
            id="testInput"
            placeholder="Enter test data here (e.g., URL, text, command)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning}
            rows={3}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter sample data to see how the bot processes it
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning || !input.trim()}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Test
              </>
            )}
          </Button>
          
          {isRunning && (
            <Button
              onClick={handleStop}
              variant="destructive"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="gap-2"
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {output.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Console Output</Label>
              {status === 'success' && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Success
                </Badge>
              )}
              {status === 'error' && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Stopped
                </Badge>
              )}
              {status === 'running' && (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Running
                </Badge>
              )}
            </div>
            <div className="bg-black/90 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {output.map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))}
              {isRunning && (
                <div className="animate-pulse">▊</div>
              )}
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            About TestBox
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Safe sandbox environment - no real actions performed</li>
            <li>Limited demo functionality to preview bot behavior</li>
            <li>No data is saved or transmitted</li>
            <li>Purchase the bot to unlock full features</li>
          </ul>
        </div>

        <Alert className="bg-primary/10 border-primary/20">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Like what you see?</strong> Purchase this bot to get the full version with unlimited usage, 
            real automation capabilities, and lifetime updates.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
