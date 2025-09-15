import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Trash2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { ChatMessage, ProcessedPDF } from '@/types';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import 'katex/dist/katex.min.css';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  pdf: ProcessedPDF | null;
}

export const ChatPanel = ({ messages, onSendMessage, onClearChat, isLoading, pdf }: ChatPanelProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isIndexed, setIsIndexed] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isCheckingIndex, setIsCheckingIndex] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Markdown components for chat messages
  const markdownComponents = {
    // Custom table styling
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border-collapse border border-border rounded-lg text-xs">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-muted/50">{children}</thead>
    ),
    th: ({ children }: any) => (
      <th className="border border-border px-2 py-1 text-left font-semibold text-foreground text-xs">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-border px-2 py-1 text-foreground text-xs">
        {children}
      </td>
    ),
    // Custom code block styling
    code: ({ inline, children }: any) => {
      if (inline) {
        return (
          <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary">
            {children}
          </code>
        )
      }
      return (
        <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2">
          <code className="text-xs font-mono text-foreground">{children}</code>
        </pre>
      )
    },
    // Custom list styling
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-1 my-2 text-foreground text-sm">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-1 my-2 text-foreground text-sm">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-foreground leading-relaxed text-sm">{children}</li>
    ),
    // Custom paragraph styling
    p: ({ children }: any) => (
      <p className="text-foreground leading-relaxed mb-2 text-sm">{children}</p>
    ),
    // Custom heading styling
    h1: ({ children }: any) => (
      <h1 className="text-lg font-bold text-foreground mb-2 mt-3">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-base font-semibold text-foreground mb-2 mt-3">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-sm font-medium text-foreground mb-1 mt-2">{children}</h3>
    ),
    // Custom blockquote styling
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-3 italic text-muted-foreground my-2 text-sm">
        {children}
      </blockquote>
    ),
  };

  // Check indexing status when PDF changes
  useEffect(() => {
    const checkIndexStatus = async () => {
      if (!pdf) {
        setIsIndexed(false);
        return;
      }

      setIsCheckingIndex(true);
      try {
        const result = await aiService.checkPDFIndexStatus(pdf.pdf_name);
        setIsIndexed(result.is_indexed);
        
        if (result.is_indexed) {
          console.log(`PDF "${pdf.pdf_name}" is already indexed`);
        }
      } catch (error) {
        console.error('Failed to check index status:', error);
        // Don't show error toast for this, just assume not indexed
        setIsIndexed(false);
      } finally {
        setIsCheckingIndex(false);
      }
    };

    checkIndexStatus();
  }, [pdf]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && isIndexed && pdf) {
      try {
        // Add user message immediately
        const userMessage: ChatMessage = { role: 'user', content: inputValue.trim() };
        onSendMessage(inputValue.trim()); // This will add the user message
        setInputValue('');

        // Call real chat API
        const response = await aiService.chatWithPDF(inputValue.trim(), pdf.pdf_name);
        
        // Add AI response
        const aiMessage: ChatMessage = { role: 'ai', content: response.answer };
        // We need to pass this back to the parent component
        // For now, we'll handle this in the parent component
      } catch (error) {
        console.error('Chat error:', error);
        toast({
          title: "Chat Error",
          description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleIndexPDF = async () => {
    if (!pdf) return;
    
    setIsIndexing(true);
    try {
      const result = await aiService.indexPDF(pdf);
      setIsIndexed(true);
      
      if (result.chunks_created > 0) {
        toast({
          title: "PDF Indexed Successfully",
          description: `Created ${result.chunks_created} chunks. You can now start chatting!`,
        });
      } else {
        toast({
          title: "PDF Already Indexed",
          description: "This PDF was already indexed. You can start chatting!",
        });
      }
    } catch (error) {
      console.error('Indexing error:', error);
      toast({
        title: "Indexing Failed",
        description: error instanceof Error ? error.message : "Failed to index PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsIndexing(false);
    }
  };

  const suggestedQuestions = [
    "Summarize the key findings",
    "What are the main arguments?",
    "Extract important data points",
    "What conclusions are drawn?"
  ];

  return (
    <div className="glass-card-strong h-full flex flex-col shadow-xl">
      <div className="p-4 border-b border-glass-border-strong">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></div>
            <h2 className="text-lg font-bold gradient-text">AI Chat</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearChat}
            className="text-xs glass-card border-destructive/30 hover:border-destructive/60 hover:bg-destructive/10 transition-all duration-200 p-2"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Index Status and Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isCheckingIndex ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <Badge variant="outline" className="border-blue-500/30 text-blue-600">
                  Checking...
                </Badge>
              </>
            ) : isIndexed ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Indexed
                </Badge>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-600">
                  Not Indexed
                </Badge>
              </>
            )}
          </div>
          
          {!isIndexed && !isCheckingIndex && (
            <Button
              onClick={handleIndexPDF}
              disabled={isIndexing || !pdf}
              size="sm"
              className="btn-gradient text-xs"
            >
              {isIndexing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Indexing...
                </>
              ) : (
                <>
                  <Database className="w-3 h-3 mr-1" />
                  Index PDF
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 p-6">
        <ScrollArea className="flex-1 pr-4 mb-6 max-h-[calc(100vh-400px)]">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isCheckingIndex 
                    ? 'Checking index status...' 
                    : isIndexed 
                      ? 'Start a conversation' 
                      : 'Index PDF first'
                  }
                </h3>
                <p className="text-sm text-foreground-secondary">
                  {isCheckingIndex
                    ? 'Please wait while we check if this PDF is indexed'
                    : isIndexed 
                      ? 'Ask questions about your documents and get AI-powered insights' 
                      : 'Click "Index PDF" to enable AI chat functionality'
                  }
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-xl shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-primary text-white'
                        : 'glass-card-strong border-glass-border-strong'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="leading-relaxed text-sm text-white">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={markdownComponents}
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex, rehypeRaw]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <div className="mt-2 text-xs opacity-70">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="glass-card-strong border-glass-border-strong p-4 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm text-foreground-secondary">AI is analyzing your question...</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="space-y-2">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isCheckingIndex 
                  ? "Checking index status..." 
                  : isIndexed 
                    ? "Ask about the PDF..." 
                    : "Index PDF first to enable chat"
              }
              disabled={isLoading || !isIndexed || isCheckingIndex}
              className="flex-1 glass-card border-glass-border focus:border-primary text-sm"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim() || !isIndexed || isCheckingIndex}
              className="btn-gradient p-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {isIndexed && !isCheckingIndex && (
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(question)}
                  className="text-xs glass-card border-primary/20 hover:border-primary/40 hover:bg-primary/10 h-8 justify-start"
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};