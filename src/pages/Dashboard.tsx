import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PDFUpload } from '@/components/PDFUpload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Grid3X3, List, Loader2, FileText, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { pdfService } from '@/services/pdfService';
import { useAuth } from '@/contexts/AuthContext';
import { ProcessedPDF } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [pdfs, setPdfs] = useState<ProcessedPDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPDFs();
    }
  }, [user]);

  const loadPDFs = async () => {
    try {
      const data = await pdfService.getUserPDFs();
      setPdfs(data);
    } catch (error) {
      console.error('Failed to load PDFs:', error);
      toast({
        title: "Error",
        description: "Failed to load your PDFs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNotebook = () => {
    setShowUploadModal(true);
  };

  const handleUploadComplete = (pdfId: string) => {
    setShowUploadModal(false);
    loadPDFs(); // Refresh the list
    navigate(`/studio/${pdfId}`);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const handleNotebookClick = (pdf: ProcessedPDF) => {
    navigate(`/studio/${pdf.id}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-primary rounded-full animate-pulse"></div>
              <h1 className="text-5xl md:text-6xl font-black gradient-text animate-gradient-shift">Recent PDFs</h1>
            </div>
            <p className="text-xl text-foreground-secondary font-medium max-w-2xl">
              Transform your documents into interactive knowledge with AI-powered tools
            </p>
            <div className="flex items-center space-x-6 text-sm text-foreground-tertiary">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>{pdfs.length} documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>AI-powered analysis</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="glass-card-strong p-1 rounded-xl">
              <Button
                variant={isGridView ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsGridView(true)}
                className={`${isGridView ? 'btn-gradient' : 'hover:bg-primary/10'} transition-all duration-200`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={!isGridView ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsGridView(false)}
                className={`${!isGridView ? 'btn-gradient' : 'hover:bg-primary/10'} transition-all duration-200`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className={`grid gap-8 ${isGridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {/* Create new notebook card */}
            <div 
              className="glass-card-strong p-10 card-hover cursor-pointer group border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all duration-300 relative overflow-hidden"
              onClick={handleCreateNotebook}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[240px]">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-glow">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-3 group-hover:animate-gradient-shift">Create New Notebook</h3>
                <p className="text-foreground-secondary leading-relaxed max-w-xs">Upload a PDF to get started with AI-powered analysis and interactive tools</p>
                <div className="mt-6 flex items-center space-x-2 text-xs text-foreground-tertiary">
                  <Sparkles className="w-3 h-3" />
                  <span>Drag & drop supported</span>
                </div>
              </div>
            </div>

            {/* Existing PDFs */}
            {pdfs.map((pdf, index) => (
              <div 
                key={pdf.id}
                className="glass-card-strong p-8 card-hover cursor-pointer group relative overflow-hidden"
                onClick={() => handleNotebookClick(pdf)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Enhanced gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-8 transition-opacity duration-500"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 min-h-[240px] flex flex-col">
                  <div className="flex-1">
                    <div className="w-14 h-14 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors truncate">
                      {pdf.pdf_name}
                    </h3>
                    <p className="text-foreground-secondary leading-relaxed mb-4">
                      Click to open in AI Studio workspace and start analyzing
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-foreground-tertiary">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span>Processed</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Brain className="w-3 h-3" />
                        <span>{(pdf.size / 1024 / 1024).toFixed(1)}MB</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-glass-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-foreground-tertiary">
                        <span>Uploaded: {new Date(pdf.uploaded_at).toLocaleDateString()}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state for no PDFs */}
        {!isLoading && pdfs.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold gradient-text mb-4">No PDFs yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Upload your first PDF to start building your AI-powered knowledge base
            </p>
            <Button onClick={handleCreateNotebook} className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First PDF
            </Button>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="glass-card border-glass-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text text-center text-2xl">Upload PDF Document</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <PDFUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
