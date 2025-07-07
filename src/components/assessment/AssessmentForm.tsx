
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, User, Code, Brain, FileText, Folder, FolderOpen, Terminal, 
  Play, Save, GitBranch, GitCommit, Eye, Settings, Download, Upload,
  Search, Replace, Zap, Database, Globe, Monitor, Cpu, Copy, Check,
  Maximize2, Minimize2, RotateCcw, RotateCw
} from 'lucide-react';

interface AssessmentFormProps {
  candidate: any;
  onSubmit: (answers: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  candidate,
  onSubmit,
  onCancel,
  loading
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Clear 4-question assessment format
  const assessmentQuestions = [
    {
      id: 'q1',
      type: 'coding',
      title: 'Algorithm Problem',
      question: 'Write a function that finds the two numbers in an array that add up to a target sum. Return their indices.',
      placeholder: 'def two_sum(nums, target):\n    # Your solution here\n    pass',
      points: 25
    },
    {
      id: 'q2',
      type: 'system_design',
      title: 'System Design',
      question: 'Design a simple URL shortener service like bit.ly. Describe the architecture, database schema, and key components.',
      placeholder: 'Describe your system design approach...',
      points: 25
    },
    {
      id: 'q3',
      type: 'problem_solving',
      title: 'Problem Solving',
      question: 'Explain how you would debug a production issue where users are experiencing slow response times on a web application.',
      placeholder: 'Describe your debugging approach step by step...',
      points: 25
    },
    {
      id: 'q4',
      type: 'technical_knowledge',
      title: 'Technical Knowledge',
      question: 'Explain the differences between SQL and NoSQL databases. When would you use each one?',
      placeholder: 'Compare SQL vs NoSQL databases...',
      points: 25
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code className="h-5 w-5" />;
      case 'system_design': return <Brain className="h-5 w-5" />;
      case 'problem_solving': return <Search className="h-4 w-4" />;
      case 'technical_knowledge': return <Database className="h-4 w-4" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const toggleExpanded = (questionId: string) => {
    setExpandedQuestions(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const copyToClipboard = async (questionId: string) => {
    const text = answers[questionId] || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [questionId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [questionId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text');
    }
  };

  const getFileExtension = (type: string) => {
    switch (type) {
      case 'coding': return '.py';
      case 'system_design': return '.md';
      case 'problem_solving': return '.md';
      case 'technical_knowledge': return '.md';
      default: return '.txt';
    }
  };

  const renderCodeEditor = (question: any) => {
    const isExpanded = expandedQuestions[question.id];
    const isCopied = copiedStates[question.id];
    const value = answers[question.id] || '';
    const lines = value.split('\n').length;
    
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* GitHub-style header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {question.title.toLowerCase().replace(/ /g, '_')}{getFileExtension(question.type)}
            </span>
            <Badge variant="outline" className="text-xs">
              {lines} lines
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(question.id)}
              className="h-6 px-2"
            >
              {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(question.id)}
              className="h-6 px-2"
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <GitBranch className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <GitCommit className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Code editor area */}
        <div className="relative">
          <div className="flex">
            {/* Line numbers */}
            <div className="bg-gray-50 px-2 py-2 border-r border-gray-200 text-right">
              {Array.from({ length: Math.max(lines, 10) }, (_, i) => (
                <div key={i + 1} className="text-xs text-gray-400 leading-6 min-h-[24px]">
                  {i + 1}
                </div>
              ))}
            </div>
            
            {/* Code area */}
            <div className="flex-1 relative">
              <Textarea
                value={value}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                className={`border-0 focus:ring-0 font-mono text-sm resize-none rounded-none ${
                  isExpanded ? 'min-h-[500px]' : 'min-h-[300px]'
                }`}
                disabled={loading}
                style={{
                  lineHeight: '24px',
                  padding: '8px 12px'
                }}
              />
            </div>
          </div>
          
          {/* Bottom toolbar */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>LF</span>
              <span>{question.type === 'coding' ? 'Python' : 'Markdown'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Ln {value.split('\n').length}, Col {(value.split('\n').pop() || '').length + 1}</span>
              <Button variant="ghost" size="sm" className="h-5 px-2">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Technical Assessment</h1>
              <p className="text-gray-600">
                Candidate: {candidate.candidateName || `ID: ${candidate.candidateId.slice(0, 8)}`}
              </p>
              <p className="text-sm text-gray-500">
                Complete all 4 questions • Total: 100 points • Time limit: 60 minutes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <Badge variant="outline" className={timeRemaining < 300 ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"}>
                {formatTime(timeRemaining)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assessmentQuestions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {getQuestionIcon(question.type)}
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  Question {index + 1}: {question.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
                  <Badge variant="secondary">{question.points} points</Badge>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{question.question}</p>
            </div>

            {renderCodeEditor(question)}
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel Assessment
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {Object.keys(answers).length}/{assessmentQuestions.length} questions answered
          </span>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || Object.keys(answers).length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Submitting...' : 'Submit Assessment'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;
