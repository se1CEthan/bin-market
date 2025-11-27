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

  const handleRun = async () => {
    if (!input.trim()) {
      setOutput(['⚠️ Please enter some input to test the bot']);
      return;
    }

    setIsRunning(true);
    setOutput([`🤖 Running ${botTitle}...`, `📥 Input: ${input}`, '']);

    // Simulate realistic bot execution with actual processing
    await simulateStep('⚙️ Initializing bot environment...', 300);
    await simulateStep('✓ Bot loaded successfully', 400);
    await simulateStep('✓ Validating input parameters...', 300);
    await simulateStep('✓ Connecting to services...', 500);
    await simulateStep('⚡ Executing automation...', 600);
    
    // Execute the actual demo based on bot type
    await executeBotDemo(input, botTitle, botDescription);
    
    setOutput(prev => [
      ...prev,
      '',
      '✅ Demo execution completed!',
      '',
      '💡 This is a limited demo. Purchase for full functionality, unlimited usage, and real API access.'
    ]);
    setIsRunning(false);
  };

  const simulateStep = (message: string, delay: number): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        setOutput(prev => [...prev, message]);
        resolve();
      }, delay);
    });
  };

  const executeBotDemo = async (userInput: string, title: string, description: string): Promise<void> => {
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();

    // WhatsApp Bot Demo
    if (lowerTitle.includes('whatsapp') || lowerDesc.includes('whatsapp')) {
      await simulateStep('📱 Connecting to WhatsApp Web...', 400);
      await simulateStep(`✓ Validating phone number: ${userInput}`, 300);
      await simulateStep('✓ Session authenticated', 400);
      await simulateStep(`📤 Sending message to ${userInput}...`, 500);
      await simulateStep('✓ Message delivered successfully', 300);
      await simulateStep(`📊 Status: Delivered at ${new Date().toLocaleTimeString()}`, 200);
    }
    
    // Instagram Bot Demo
    else if (lowerTitle.includes('instagram') || lowerDesc.includes('instagram')) {
      await simulateStep('📸 Connecting to Instagram API...', 400);
      await simulateStep('✓ Authentication successful', 300);
      await simulateStep(`✓ Processing content: "${userInput}"`, 400);
      await simulateStep('✓ Uploading media...', 600);
      await simulateStep('✓ Post published successfully', 300);
      await simulateStep(`📊 Post ID: IG_${Math.random().toString(36).substr(2, 9)}`, 200);
      await simulateStep(`👥 Estimated reach: ${Math.floor(Math.random() * 500 + 100)} users`, 200);
    }
    
    // Web Scraper Demo
    else if (lowerTitle.includes('scraper') || lowerTitle.includes('scrape') || lowerDesc.includes('scraping')) {
      await simulateStep(`🌐 Connecting to ${userInput}...`, 400);
      await simulateStep('✓ Page loaded successfully', 300);
      await simulateStep('✓ Parsing HTML structure...', 400);
      await simulateStep('✓ Extracting data elements...', 500);
      const itemCount = Math.floor(Math.random() * 200 + 50);
      await simulateStep(`📊 Found ${itemCount} items`, 300);
      await simulateStep('✓ Processing data...', 400);
      await simulateStep(`✓ Extracted: ${itemCount} products, ${Math.floor(itemCount * 0.8)} prices, ${Math.floor(itemCount * 0.9)} images`, 300);
      await simulateStep(`💾 Data saved to: scrape_${Date.now()}.json`, 200);
    }
    
    // Email Bot Demo
    else if (lowerTitle.includes('email') || lowerDesc.includes('email')) {
      await simulateStep('📧 Connecting to email server...', 400);
      await simulateStep('✓ SMTP connection established', 300);
      await simulateStep(`✓ Validating recipient: ${userInput}`, 300);
      await simulateStep('✓ Composing email...', 400);
      await simulateStep('✓ Attaching content...', 300);
      await simulateStep(`📤 Sending email to ${userInput}...`, 500);
      await simulateStep('✓ Email sent successfully', 300);
      await simulateStep(`📊 Message ID: ${Math.random().toString(36).substr(2, 12)}@demo.bin`, 200);
    }
    
    // AI/GPT Bot Demo
    else if (lowerTitle.includes('ai') || lowerTitle.includes('gpt') || lowerTitle.includes('chatbot')) {
      await simulateStep('🤖 Initializing AI model...', 400);
      await simulateStep('✓ Model loaded: GPT-4', 300);
      await simulateStep(`✓ Processing query: "${userInput}"`, 400);
      await simulateStep('✓ Generating response...', 800);
      const aiResponse = `Based on "${userInput}", here's an AI-generated insight: This demonstrates the bot's natural language processing capabilities. The full version provides unlimited queries with advanced context understanding.`;
      await simulateStep(`🤖 AI Response: ${aiResponse}`, 300);
      await simulateStep(`📊 Tokens used: ${Math.floor(Math.random() * 100 + 50)}`, 200);
    }
    
    // Data Export Bot Demo
    else if (lowerTitle.includes('export') || lowerTitle.includes('data') || lowerDesc.includes('export')) {
      await simulateStep('📊 Connecting to data source...', 400);
      await simulateStep(`✓ Querying: ${userInput}`, 300);
      await simulateStep('✓ Fetching records...', 500);
      const recordCount = Math.floor(Math.random() * 500 + 100);
      await simulateStep(`✓ Retrieved ${recordCount} records`, 300);
      await simulateStep('✓ Formatting data...', 400);
      await simulateStep('✓ Generating CSV file...', 300);
      await simulateStep(`💾 Exported: ${userInput}_export_${Date.now()}.csv (${recordCount} rows)`, 200);
      await simulateStep(`📦 File size: ${(recordCount * 0.5).toFixed(2)} KB`, 200);
    }
    
    // Twitter/X Bot Demo
    else if (lowerTitle.includes('twitter') || lowerTitle.includes('tweet') || lowerDesc.includes('twitter')) {
      await simulateStep('🐦 Connecting to Twitter API...', 400);
      await simulateStep('✓ OAuth authentication successful', 300);
      await simulateStep(`✓ Composing tweet: "${userInput}"`, 400);
      await simulateStep('✓ Posting to timeline...', 500);
      await simulateStep('✓ Tweet published successfully', 300);
      await simulateStep(`📊 Tweet ID: ${Math.random().toString(36).substr(2, 10)}`, 200);
      await simulateStep(`👁️ Impressions (estimated): ${Math.floor(Math.random() * 1000 + 200)}`, 200);
    }
    
    // Generic Automation Bot
    else {
      await simulateStep(`✓ Processing input: ${userInput}`, 400);
      await simulateStep('✓ Executing automation workflow...', 500);
      await simulateStep('✓ Step 1: Data validation completed', 300);
      await simulateStep('✓ Step 2: Processing logic executed', 400);
      await simulateStep('✓ Step 3: Output generated', 300);
      await simulateStep(`📤 Result: Successfully processed "${userInput}"`, 300);
      await simulateStep(`📊 Execution time: ${(Math.random() * 2 + 1).toFixed(2)}s`, 200);
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
