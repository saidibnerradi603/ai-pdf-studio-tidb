import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  ExternalLink, 
  Map, 
  FileText,
  CheckCircle,
  Info
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MindMapRendererProps {
  htmlContent: string
  pdfName: string
}

export const MindMapRenderer = ({ htmlContent, pdfName }: MindMapRendererProps) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' })
      
      // Create a download URL
      const url = URL.createObjectURL(blob)
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `${pdfName.replace('.pdf', '')}_mindmap.html`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Mind Map Downloaded",
        description: "The HTML file has been saved to your downloads folder. Click on it to view the interactive mind map.",
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download the mind map. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePreview = () => {
    try {
      // Create a blob URL and open in new tab for preview
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      const newWindow = window.open(url, '_blank')
      if (!newWindow) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site to preview the mind map.",
          variant: "destructive",
        })
      } else {
        // Clean up the URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
      }
    } catch (error) {
      console.error('Preview failed:', error)
      toast({
        title: "Preview Failed",
        description: "Failed to preview the mind map. Please try downloading instead.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Map className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text mb-2">Interactive Mind Map Generated</h2>
        <p className="text-muted-foreground">AI has created a visual mind map of your research paper</p>
      </div>

      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span>Mind Map Ready</span>
            </div>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Generated
            </Badge>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">About Your Mind Map</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Interactive hierarchical visualization of your research paper</li>
                    <li>• Built with Markmap technology for smooth navigation</li>
                    <li>• Click nodes to expand/collapse sections</li>
                    <li>• Zoom and pan to explore different areas</li>
                    <li>• Works offline once downloaded</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handlePreview}
                variant="outline"
                className="flex-1 glass-card border-primary/30 hover:border-primary/60 hover:bg-primary/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Mind Map
              </Button>
              
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 btn-gradient"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download HTML File'}
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">How to Use Your Mind Map:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>Click "Download HTML File" to save the mind map to your computer</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>Open the downloaded HTML file in any web browser</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span>Interact with the mind map: click nodes to expand/collapse, zoom, and pan</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-primary">4.</span>
                  <span>Share the HTML file with colleagues or use it for presentations</span>
                </div>
              </div>
            </div>

            {/* File Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>File will be saved as: <code className="bg-muted px-2 py-1 rounded text-primary">{pdfName.replace('.pdf', '')}_mindmap.html</code></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}