import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Loader2 } from 'lucide-react'

interface FAQOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (numQuestions: number) => void
  isLoading: boolean
}

export const FAQOptionsDialog = ({ open, onOpenChange, onGenerate, isLoading }: FAQOptionsDialogProps) => {
  const [numQuestions, setNumQuestions] = useState([5])

  const handleGenerate = () => {
    onGenerate(numQuestions[0])
  }

  const getRecommendation = (num: number) => {
    if (num <= 3) return { text: 'Quick Overview', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' }
    if (num <= 5) return { text: 'Balanced', color: 'bg-green-500/10 text-green-600 border-green-500/20' }
    if (num <= 7) return { text: 'Comprehensive', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' }
    return { text: 'In-Depth', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' }
  }

  const recommendation = getRecommendation(numQuestions[0])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-glass-border max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text text-center text-xl flex items-center justify-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Generate FAQ</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose how many frequently asked questions to generate from your PDF
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="num-questions" className="text-sm font-medium">
                Number of Questions
              </Label>
              <Badge variant="outline" className={recommendation.color}>
                {recommendation.text}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <Slider
                id="num-questions"
                min={1}
                max={10}
                step={1}
                value={numQuestions}
                onValueChange={setNumQuestions}
                className="w-full"
                disabled={isLoading}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 question</span>
                <span className="font-medium text-primary text-lg">
                  {numQuestions[0]} question{numQuestions[0] !== 1 ? 's' : ''}
                </span>
                <span>10 questions</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">What to expect:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Questions cover key concepts and findings</li>
              <li>• Detailed answers with explanations</li>
              <li>• Markdown formatting with LaTeX support</li>
              <li>• Collapsible interface for easy navigation</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 glass-card"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex-1 btn-gradient"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Generate FAQ
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}