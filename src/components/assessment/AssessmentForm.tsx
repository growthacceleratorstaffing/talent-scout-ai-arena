
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Code, Brain } from 'lucide-react';

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

  // Sample assessment questions - in real implementation, these would come from the AI agent
  const assessmentQuestions = [
    {
      id: 'q1',
      type: 'coding',
      title: 'Algorithm Problem',
      question: 'Write a function that finds the two numbers in an array that add up to a target sum. Return their indices.',
      placeholder: 'def two_sum(nums, target):\n    # Your solution here\n    pass'
    },
    {
      id: 'q2',
      type: 'system_design',
      title: 'System Design',
      question: 'Design a simple URL shortener service like bit.ly. Describe the architecture, database schema, and key components.',
      placeholder: 'Describe your system design approach...'
    },
    {
      id: 'q3',
      type: 'problem_solving',
      title: 'Problem Solving',
      question: 'Explain how you would debug a production issue where users are experiencing slow response times on a web application.',
      placeholder: 'Describe your debugging approach step by step...'
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
      default: return <Brain className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      <div className="space-y-6">
        {assessmentQuestions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {getQuestionIcon(question.type)}
              <h2 className="text-xl font-semibold">
                Question {index + 1}: {question.title}
              </h2>
              <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{question.question}</p>
            </div>

            <Textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="min-h-[200px] font-mono text-sm"
              disabled={loading}
            />
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || Object.keys(answers).length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Submitting...' : 'Submit Assessment'}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentForm;
