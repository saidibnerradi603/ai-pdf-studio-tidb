import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ChatPanel } from '@/components/ChatPanel';
import { StudioPanel } from '@/components/StudioPanel';
import { pdfService } from '@/services/pdfService';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/contexts/AuthContext';
import { ProcessedPDF, ChatMessage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Studio() {
  const { notebookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pdf, setPdf] = useState<ProcessedPDF | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStudioLoading, setIsStudioLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    if (notebookId) {
      loadPDF();
    }
  }, [navigate, notebookId, user]);

  const loadPDF = async () => {
    if (!notebookId) return;
    
    try {
      setIsLoading(true);
      const data = await pdfService.getPDFById(notebookId);
      
      if (!data) {
        toast({
          title: "PDF Not Found",
          description: "The requested PDF could not be found.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setPdf(data);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      toast({
        title: "Error",
        description: "Failed to load PDF. Please try again.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };



  const handleSendMessage = async (message: string) => {
    if (!pdf) return;
    
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      // Use real AI chat service
      const response = await aiService.chatWithPDF(message, pdf.pdf_name);
      const aiMessage: ChatMessage = { role: 'ai', content: response.answer };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  const handleGenerateContent = async (type: string) => {
    // This function is no longer needed since all features now use real AI
    // All content generation is handled directly in StudioPanel
    console.log(`Legacy content generation called for: ${type}`);
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">PDF not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} title={pdf.pdf_name} />
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Studio Panel - Left Side */}
          <div className="lg:col-span-1">
            <StudioPanel
              onGenerateContent={handleGenerateContent}
              isLoading={isStudioLoading}
              pdf={pdf}
            />
          </div>

          {/* Chat Panel - Right Side (Equal Width) */}
          <div className="lg:col-span-1">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isLoading={isChatLoading}
              pdf={pdf}
            />
          </div>
        </div>
      </main>
    </div>
  );
}