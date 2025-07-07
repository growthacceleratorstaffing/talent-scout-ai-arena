
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
  Search, Replace, Zap, Database, Globe, Monitor, Cpu
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
  const [activeTab, setActiveTab] = useState('main.py');
  const [activeProject, setActiveProject] = useState('url-shortener');
  const [terminalOutput, setTerminalOutput] = useState('Welcome to Assessment Terminal v1.0\n$ ');
  const [gitStatus, setGitStatus] = useState('main');

  // Mock project files structure
  const projectFiles = {
    'url-shortener': {
      'main.py': {
        content: `# URL Shortener Service
# Implement a scalable URL shortener like bit.ly

def shorten_url(long_url):
    """
    Create a shortened URL from a long URL
    
    Args:
        long_url (str): The original URL to shorten
        
    Returns:
        str: The shortened URL
    """
    # TODO: Implement URL shortening logic
    pass

def expand_url(short_url):
    """
    Expand a shortened URL to its original form
    
    Args:
        short_url (str): The shortened URL
        
    Returns:
        str: The original URL
    """
    # TODO: Implement URL expansion logic
    pass

if __name__ == "__main__":
    # Test your implementation
    test_url = "https://www.example.com/very/long/path/to/resource"
    short = shorten_url(test_url)
    print(f"Shortened: {short}")
    print(f"Expanded: {expand_url(short)}")`,
        type: 'python'
      },
      'database.py': {
        content: `# Database Schema and Operations
# Design and implement the database layer

class URLDatabase:
    """
    Database interface for URL shortener
    """
    
    def __init__(self):
        # TODO: Initialize database connection
        pass
    
    def create_tables(self):
        """
        Create necessary database tables
        """
        # TODO: Implement table creation
        pass
    
    def store_url(self, original_url, short_code):
        """
        Store URL mapping in database
        """
        # TODO: Implement URL storage
        pass
    
    def get_original_url(self, short_code):
        """
        Retrieve original URL from short code
        """
        # TODO: Implement URL retrieval
        pass`,
        type: 'python'
      },
      'api.py': {
        content: `# REST API Implementation
# Create API endpoints for the URL shortener

from flask import Flask, request, jsonify, redirect

app = Flask(__name__)

@app.route('/api/shorten', methods=['POST'])
def api_shorten():
    """
    API endpoint to shorten a URL
    """
    # TODO: Implement API endpoint
    pass

@app.route('/api/expand/<short_code>')
def api_expand(short_code):
    """
    API endpoint to expand a shortened URL
    """
    # TODO: Implement API endpoint
    pass

@app.route('/<short_code>')
def redirect_url(short_code):
    """
    Redirect short URL to original URL
    """
    # TODO: Implement redirect logic
    pass

if __name__ == '__main__':
    app.run(debug=True)`,
        type: 'python'
      },
      'README.md': {
        content: `# URL Shortener Assessment

## Overview
Design and implement a scalable URL shortener service similar to bit.ly.

## Requirements
1. **Core Functionality**
   - Shorten long URLs to short codes
   - Redirect short URLs to original URLs
   - Handle high volume of requests

2. **System Design**
   - Database schema design
   - API design
   - Scalability considerations
   - Performance optimization

3. **Implementation Tasks**
   - [ ] Implement URL shortening algorithm
   - [ ] Design database schema
   - [ ] Create REST API endpoints
   - [ ] Add error handling
   - [ ] Implement analytics (optional)

## Files Structure
- \`main.py\` - Core URL shortening logic
- \`database.py\` - Database operations
- \`api.py\` - REST API implementation
- \`tests.py\` - Unit tests

## Getting Started
1. Implement the core functions in \`main.py\`
2. Design the database schema in \`database.py\`
3. Create API endpoints in \`api.py\`
4. Test your implementation

## Evaluation Criteria
- Code quality and structure
- System design approach
- Scalability considerations
- Error handling
- Documentation`,
        type: 'markdown'
      },
      'tests.py': {
        content: `# Unit Tests for URL Shortener
import unittest
from main import shorten_url, expand_url

class TestURLShortener(unittest.TestCase):
    
    def test_shorten_url(self):
        """Test URL shortening functionality"""
        long_url = "https://www.example.com/very/long/path"
        short_url = shorten_url(long_url)
        # TODO: Add assertions
        pass
    
    def test_expand_url(self):
        """Test URL expansion functionality"""
        # TODO: Implement test
        pass
    
    def test_invalid_url(self):
        """Test handling of invalid URLs"""
        # TODO: Implement test
        pass

if __name__ == '__main__':
    unittest.main()`,
        type: 'python'
      }
    }
  };

  const currentFile = projectFiles[activeProject]?.[activeTab];

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

  const handleFileContentChange = (content: string) => {
    setAnswers(prev => ({
      ...prev,
      [`${activeProject}/${activeTab}`]: content
    }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const runTerminalCommand = (command: string) => {
    setTerminalOutput(prev => prev + command + '\n');
    
    // Mock terminal responses
    setTimeout(() => {
      let response = '';
      switch (command.toLowerCase()) {
        case 'python main.py':
          response = 'Running URL shortener...\nShortened: https://short.ly/abc123\nExpanded: https://www.example.com/very/long/path/to/resource\n';
          break;
        case 'python -m pytest tests.py':
          response = 'Running tests...\n...\n----------------------------------------------------------------------\nRan 3 tests in 0.001s\n\nOK\n';
          break;
        case 'git status':
          response = 'On branch main\nChanges not staged for commit:\n  modified:   main.py\n  modified:   database.py\n';
          break;
        case 'ls':
          response = 'main.py  database.py  api.py  README.md  tests.py\n';
          break;
        default:
          response = `Command not found: ${command}\n`;
      }
      setTerminalOutput(prev => prev + response + '$ ');
    }, 500);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Assessment IDE</h1>
            <p className="text-sm text-gray-400">
              {candidate.candidateName || `Candidate ${candidate.candidateId?.slice(0, 8)}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Git Status */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-md">
            <GitBranch className="h-4 w-4" />
            <span className="text-sm">{gitStatus}</span>
          </div>
          
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-400" />
            <Badge variant="outline" className={timeRemaining < 300 ? "bg-red-900 text-red-300 border-red-600" : "bg-orange-900 text-orange-300 border-orange-600"}>
              {formatTime(timeRemaining)}
            </Badge>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="bg-green-600 hover:bg-green-700 border-green-500">
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
            <Button size="sm" variant="outline" className="bg-blue-600 hover:bg-blue-700 border-blue-500">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <h3 className="font-semibold text-sm">EXPLORER</h3>
          </div>
          
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                <FolderOpen className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">url-shortener</span>
              </div>
              
              <div className="ml-6 space-y-1">
                {Object.entries(projectFiles[activeProject] || {}).map(([fileName, file]) => (
                  <div
                    key={fileName}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-700 ${
                      activeTab === fileName ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => setActiveTab(fileName)}
                  >
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          
          {/* Git Panel */}
          <div className="border-t border-gray-700 p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-400">SOURCE CONTROL</h4>
              <Badge variant="outline" className="text-xs">3</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-orange-400">
                <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                main.py
              </div>
              <div className="flex items-center gap-2 text-xs text-orange-400">
                <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                database.py
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                api.py
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
              <GitCommit className="h-3 w-3 mr-1" />
              Commit Changes
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* File Tabs */}
          <div className="flex bg-gray-800 border-b border-gray-700">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-0 h-auto p-0">
                {Object.keys(projectFiles[activeProject] || {}).map((fileName) => (
                  <TabsTrigger
                    key={fileName}
                    value={fileName}
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-none border-0 px-4 py-2"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {fileName}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 flex">
            <div className="flex-1 p-4">
              <Textarea
                value={answers[`${activeProject}/${activeTab}`] || currentFile?.content || ''}
                onChange={(e) => handleFileContentChange(e.target.value)}
                className="w-full h-full font-mono text-sm bg-gray-900 border-gray-700 text-white resize-none"
                placeholder={`// Start coding in ${activeTab}...`}
                disabled={loading}
              />
            </div>
            
            {/* Side Panel */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <Tabs defaultValue="preview" className="flex-1 flex flex-col">
                <TabsList className="bg-gray-700 border-0 rounded-none">
                  <TabsTrigger value="preview" className="data-[state=active]:bg-gray-600">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="docs" className="data-[state=active]:bg-gray-600">
                    <FileText className="h-4 w-4 mr-1" />
                    Docs
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="data-[state=active]:bg-gray-600">
                    <Settings className="h-4 w-4 mr-1" />
                    Tools
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="flex-1 p-4 mt-0">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Preview Output</h4>
                    <div className="bg-gray-900 p-3 rounded text-xs font-mono">
                      <div className="text-green-400">✓ Syntax Check: OK</div>
                      <div className="text-yellow-400">⚠ Performance: Consider optimization</div>
                      <div className="text-blue-400">ℹ Coverage: 45% of requirements met</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="docs" className="flex-1 p-4 mt-0">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Documentation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-gray-900 rounded">
                        <strong>URL Shortening Algorithm:</strong>
                        <p className="text-gray-400 text-xs mt-1">Use base62 encoding for optimal short URLs</p>
                      </div>
                      <div className="p-2 bg-gray-900 rounded">
                        <strong>Database Design:</strong>
                        <p className="text-gray-400 text-xs mt-1">Consider indexing strategies for high performance</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tools" className="flex-1 p-4 mt-0">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Development Tools</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="justify-start">
                        <Database className="h-4 w-4 mr-1" />
                        Schema
                      </Button>
                      <Button size="sm" variant="outline" className="justify-start">
                        <Globe className="h-4 w-4 mr-1" />
                        API Test
                      </Button>
                      <Button size="sm" variant="outline" className="justify-start">
                        <Monitor className="h-4 w-4 mr-1" />
                        Monitor
                      </Button>
                      <Button size="sm" variant="outline" className="justify-start">
                        <Cpu className="h-4 w-4 mr-1" />
                        Profile
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="h-48 bg-black border-t border-gray-700 flex flex-col">
        <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span className="text-sm font-medium">Terminal</span>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => runTerminalCommand('python main.py')}
              className="text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Run
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => runTerminalCommand('python -m pytest tests.py')}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Test
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {terminalOutput}
          </pre>
        </ScrollArea>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-green-900 text-green-300 border-green-600">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Ready
          </Badge>
          <span className="text-sm text-gray-400">
            {Object.keys(answers).length} files modified
          </span>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel Assessment
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
    </div>
  );
};

export default AssessmentForm;
