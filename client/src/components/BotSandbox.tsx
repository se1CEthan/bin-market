import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Play,
  Square,
  RotateCcw,
  Settings,
  Terminal,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  MemoryStick,
  Network,
} from 'lucide-react';

interface BotSandboxProps {
  botId: string;
  botTitle: string;
  botFile?: string;
}

interface TestResult {
  id: string;
  timestamp: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  duration: number;
  output: string;
  errors: string[];
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    networkRequests: number;
  };
}

export function BotSandbox({ botId, botTitle, botFile }: BotSandboxProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [testInput, setTestInput] = useState('');
  const [testConfig, setTestConfig] = useState({
    timeout: 30,
    maxMemory: 512,
    networkAccess: true,
    fileAccess: false,
    logLevel: 'info',
  });
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);

  const startTest = async () => {
    if (!botFile) {
      addLog('Error: No bot file available for testing');
      return;
    }

    setIsRunning(true);
    addLog(`Starting test for ${botTitle}...`);

    const testId = `test_${Date.now()}`;
    const startTime = Date.now();

    const newTest: TestResult = {
      id: testId,
      timestamp: new Date().toISOString(),
      status: 'running',
      duration: 0,
      output: '',
      errors: [],
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        networkRequests: 0,
      },
    };

    setCurrentTest(newTest);

    try {
      // Simulate bot execution in sandbox
      await simulateBotExecution(testId, testInput, testConfig);
      
      const endTime = Date.now();
      const completedTest: TestResult = {
        ...newTest,
        status: 'completed',
        duration: endTime - startTime,
        output: generateMockOutput(),
        performance: generateMockPerformance(),
      };

      setCurrentTest(completedTest);
      setTestHistory(prev => [completedTest, ...prev.slice(0, 9)]);
      addLog(`Test completed successfully in ${completedTest.duration}ms`);

    } catch (error) {
      const failedTest: TestResult = {
        ...newTest,
        status: 'failed',
        duration: Date.now() - startTime,
        errors: [(error as Error).message],
        performance: generateMockPerformance(),
      };

      setCurrentTest(failedTest);
      setTestHistory(prev => [failedTest, ...prev.slice(0, 9)]);
      addLog(`Test failed: ${(error as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const stopTest = () => {
    if (currentTest && currentTest.status === 'running') {
      const stoppedTest: TestResult = {
        ...currentTest,
        status: 'timeout',
        duration: Date.now() - new Date(currentTest.timestamp).getTime(),
        errors: ['Test stopped by user'],
        performance: generateMockPerformance(),
      };

      setCurrentTest(stoppedTest);
      setTestHistory(prev => [stoppedTest, ...prev.slice(0, 9)]);
    }
    setIsRunning(false);
    addLog('Test stopped by user');
  };

  const resetSandbox = () => {
    setCurrentTest(null);
    setSandboxLogs([]);
    setTestInput('');
    addLog('Sandbox reset');
  };

  const addLog = (message: string) => {
    setSandboxLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const simulateBotExecution = async (testId: string, input: string, config: any) => {
    // Simulate various stages of bot execution
    addLog('Initializing sandbox environment...');
    await new Promise(resolve => setTimeout(resolve, 500));

    addLog('Loading bot configuration...');
    await new Promise(resolve => setTimeout(resolve, 300));

    addLog('Starting bot execution...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (Math.random() > 0.8) {
      throw new Error('Simulated execution error');
    }

    addLog('Bot execution completed');
  };

  const generateMockOutput = () => {
    return `Bot execution started at ${new Date().toISOString()}
Processing input: "${testInput}"
Initializing modules...
✓ Authentication module loaded
✓ Data processing module loaded
✓ Output formatter loaded

Executing main logic...
Processing 15 items...
Generated 3 reports
Sent 2 notifications

Execution completed successfully
Total processing time: 2.3 seconds
Items processed: 15
Success rate: 100%`;
  };

  const generateMockPerformance = () => ({
    cpuUsage: Math.floor(Math.random() * 80) + 10,
    memoryUsage: Math.floor(Math.random() * 400) + 50,
    networkRequests: Math.floor(Math.random() * 20) + 1,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'timeout':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'timeout':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Bot Sandbox - {botTitle}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? "Running" : "Ready"}
              </Badge>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sandbox Configuration</DialogTitle>
                    <DialogDescription>
                      Configure the sandbox environment for testing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timeout">Timeout (seconds)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={testConfig.timeout}
                        onChange={(e) => setTestConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="memory">Max Memory (MB)</Label>
                      <Input
                        id="memory"
                        type="number"
                        value={testConfig.maxMemory}
                        onChange={(e) => setTestConfig(prev => ({ ...prev, maxMemory: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="network">Network Access</Label>
                      <Switch
                        id="network"
                        checked={testConfig.networkAccess}
                        onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, networkAccess: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="files">File System Access</Label>
                      <Switch
                        id="files"
                        checked={testConfig.fileAccess}
                        onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, fileAccess: checked }))}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-input">Test Input</Label>
            <Textarea
              id="test-input"
              placeholder="Enter test data or parameters for the bot..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={startTest}
              disabled={isRunning || !botFile}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Start Test'}
            </Button>
            <Button
              onClick={stopTest}
              disabled={!isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
            <Button
              onClick={resetSandbox}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Test</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
          <TabsTrigger value="logs">Sandbox Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {currentTest ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(currentTest.status)}
                    Test Results
                  </CardTitle>
                  <Badge className={getStatusColor(currentTest.status)}>
                    {currentTest.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Duration: {currentTest.duration}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">CPU: {currentTest.performance.cpuUsage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Memory: {currentTest.performance.memoryUsage}MB</span>
                  </div>
                </div>

                {currentTest.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm">{Math.floor((Date.now() - new Date(currentTest.timestamp).getTime()) / 1000)}s</span>
                    </div>
                    <Progress value={Math.min((Date.now() - new Date(currentTest.timestamp).getTime()) / (testConfig.timeout * 1000) * 100, 100)} />
                  </div>
                )}

                {currentTest.output && (
                  <div>
                    <Label>Output</Label>
                    <ScrollArea className="h-48 w-full border rounded-md p-3">
                      <pre className="text-sm font-mono whitespace-pre-wrap">{currentTest.output}</pre>
                    </ScrollArea>
                  </div>
                )}

                {currentTest.errors.length > 0 && (
                  <div>
                    <Label className="text-red-500">Errors</Label>
                    <div className="space-y-1">
                      {currentTest.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-500 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Terminal className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No test running. Click "Start Test" to begin.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
            </CardHeader>
            <CardContent>
              {testHistory.length > 0 ? (
                <div className="space-y-3">
                  {testHistory.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(test.timestamp).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Duration: {test.duration}ms
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No test history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Sandbox Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full border rounded-md p-3">
                {sandboxLogs.length > 0 ? (
                  <div className="space-y-1">
                    {sandboxLogs.map((log, index) => (
                      <div key={index} className="text-sm font-mono text-muted-foreground">
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No logs available
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}