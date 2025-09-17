import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, HelpCircle, FileText, MessageSquare, Map, Loader2 } from 'lucide-react';
import { ProcessedPDF } from '@/types';
import { StructuredSummaryRenderer } from '@/components/StructuredSummaryRenderer';
import { QuizRenderer } from '@/components/QuizRenderer';
import { MindMapRenderer } from '@/components/MindMapRenderer';
import { FAQRenderer } from '@/components/FAQRenderer';
import { FAQOptionsDialog } from '@/components/FAQOptionsDialog';
import { aiService, StructuredSummary, QuizOutput, FAQOutput } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface StudioPanelProps {
  onGenerateContent: (type: string) => void;
  isLoading: boolean;
  pdf: ProcessedPDF | null;
}

const studioFeatures = [
  { id: 'mindmap', label: 'MindMap', icon: Map },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'faq', label: 'FAQ', icon: MessageSquare },
];

export const StudioPanel = ({ onGenerateContent, isLoading, pdf }: StudioPanelProps) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [structuredSummary, setStructuredSummary] = useState<StructuredSummary | null>(null);
  const [quizOutput, setQuizOutput] = useState<QuizOutput | null>(null);
  const [mindMapHtml, setMindMapHtml] = useState<string | null>(null);
  const [faqOutput, setFaqOutput] = useState<FAQOutput | null>(null);
  const [showFAQDialog, setShowFAQDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleFeatureClick = async (featureId: string) => {
    setActiveFeature(featureId);
    
    if (featureId === 'faq' && pdf) {
      // Show FAQ options dialog
      setShowFAQDialog(true);
      return;
    }
    
    if ((featureId === 'summary' || featureId === 'quiz' || featureId === 'mindmap') && pdf) {
      // Handle real AI generation
      setIsGenerating(true);
      try {
        if (featureId === 'summary') {
          const summary = await aiService.generateStructuredSummary(pdf);
          setStructuredSummary(summary);
          setQuizOutput(null); // Clear other content
          setMindMapHtml(null);
          setFaqOutput(null);
          toast({
            title: "Summary Generated",
            description: "AI has successfully analyzed your PDF and generated a structured summary.",
          });
        } else if (featureId === 'quiz') {
          const quiz = await aiService.generateQuiz(pdf);
          setQuizOutput(quiz);
          setStructuredSummary(null); // Clear other content
          setMindMapHtml(null);
          setFaqOutput(null);
          toast({
            title: "Quiz Generated",
            description: `AI has created a ${quiz.quiz.length}-question quiz based on your PDF.`,
          });
        } else if (featureId === 'mindmap') {
          const htmlContent = await aiService.generateMindMap(pdf);
          setMindMapHtml(htmlContent);
          setStructuredSummary(null); // Clear other content
          setQuizOutput(null);
          setFaqOutput(null);
          toast({
            title: "Mind Map Generated",
            description: "AI has created an interactive mind map of your research paper.",
          });
        }
      } catch (error) {
        console.error(`Failed to generate ${featureId}:`, error);
        toast({
          title: "Generation Failed",
          description: error instanceof Error ? error.message : `Failed to generate ${featureId}. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Handle other features with mock API for now
      onGenerateContent(featureId);
    }
  };

  const handleFAQGenerate = async (numQuestions: number) => {
    if (!pdf) return;
    
    setShowFAQDialog(false);
    setIsGenerating(true);
    
    try {
      const faq = await aiService.generateFAQ(pdf, numQuestions);
      setFaqOutput(faq);
      setStructuredSummary(null); // Clear other content
      setQuizOutput(null);
      setMindMapHtml(null);
      toast({
        title: "FAQ Generated",
        description: `AI has created ${faq.faqs.length} frequently asked questions based on your PDF.`,
      });
    } catch (error) {
      console.error('Failed to generate FAQ:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate FAQ. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    if (isLoading || isGenerating) {
      return (
        <div className="space-y-4 py-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isGenerating ? 'AI is analyzing your PDF...' : 'Generating content...'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isGenerating ? 'This may take a few moments' : 'Please wait'}
            </p>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full bg-muted/50" />
            <Skeleton className="h-4 w-3/4 bg-muted/50" />
            <Skeleton className="h-4 w-1/2 bg-muted/50" />
          </div>
        </div>
      );
    }

    // Show structured summary if available
    if (activeFeature === 'summary' && structuredSummary) {
      return <StructuredSummaryRenderer summary={structuredSummary} />;
    }

    // Show quiz if available
    if (activeFeature === 'quiz' && quizOutput) {
      return <QuizRenderer quiz={quizOutput} />;
    }

    // Show mind map if available
    if (activeFeature === 'mindmap' && mindMapHtml && pdf) {
      return <MindMapRenderer htmlContent={mindMapHtml} pdfName={pdf.pdf_name} />;
    }

    // Show FAQ if available
    if (activeFeature === 'faq' && faqOutput) {
      return <FAQRenderer faq={faqOutput} />;
    }

    if (!structuredSummary && !quizOutput && !mindMapHtml && !faqOutput) {
      return (
        <div className="text-center text-muted-foreground py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-primary/50" />
          <h3 className="text-lg font-semibold mb-2">AI Studio Tools</h3>
          <p className="text-sm">Select a tool to generate content from your PDFs</p>
        </div>
      );
    }

    // All content is now handled by specific renderers above
    return <p className="text-muted-foreground">Content not available</p>;
  };

  return (
    <div className="glass-card h-full flex flex-col">
      <div className="p-6 border-b border-glass-border">
        <h2 className="text-lg font-semibold gradient-text">Studio</h2>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {studioFeatures.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;
            
            return (
              <Button
                key={feature.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeatureClick(feature.id)}
                disabled={isLoading || isGenerating}
                className={`flex flex-col items-center justify-center h-24 text-sm glass-card border-glass-border hover:border-primary/40 transition-all duration-200 ${
                  isActive ? 'btn-gradient shadow-lg scale-105' : ''
                }`}
              >
                {(isLoading || isGenerating) && activeFeature === feature.id ? (
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                ) : (
                  <Icon className="w-6 h-6 mb-2" />
                )}
                {feature.label}
              </Button>
            );
          })}
        </div>

        <div className="flex-1 min-h-0">
          {renderContent()}
        </div>
      </div>

      {/* FAQ Options Dialog */}
      <FAQOptionsDialog
        open={showFAQDialog}
        onOpenChange={setShowFAQDialog}
        onGenerate={handleFAQGenerate}
        isLoading={isGenerating}
      />
    </div>
  );
};