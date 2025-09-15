import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StructuredSummary } from '@/services/aiService'
import { 
  FileText, 
  Target, 
  Lightbulb, 
  Microscope, 
  FlaskConical, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  ArrowRight 
} from 'lucide-react'
import 'katex/dist/katex.min.css'

interface StructuredSummaryRendererProps {
  summary: StructuredSummary
}

const sectionConfig = [
  { key: 'summary', title: 'Executive Summary', icon: FileText, color: 'bg-blue-500' },
  { key: 'background', title: 'Background & Context', icon: Lightbulb, color: 'bg-purple-500' },
  { key: 'problem', title: 'Problem Statement', icon: Target, color: 'bg-red-500' },
  { key: 'methods', title: 'Methodology', icon: Microscope, color: 'bg-green-500' },
  { key: 'experiments', title: 'Experiments', icon: FlaskConical, color: 'bg-orange-500' },
  { key: 'results', title: 'Key Results', icon: TrendingUp, color: 'bg-cyan-500' },
  { key: 'limitations', title: 'Limitations', icon: AlertTriangle, color: 'bg-yellow-500' },
  { key: 'implications', title: 'Implications', icon: Zap, color: 'bg-pink-500' },
  { key: 'future_work', title: 'Future Work', icon: ArrowRight, color: 'bg-indigo-500' },
]

export const StructuredSummaryRenderer = ({ summary }: StructuredSummaryRendererProps) => {
  const markdownComponents = {
    // Custom table styling
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-muted/50">{children}</thead>
    ),
    th: ({ children }: any) => (
      <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-border px-4 py-2 text-foreground">
        {children}
      </td>
    ),
    // Custom code block styling
    code: ({ inline, children }: any) => {
      if (inline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            {children}
          </code>
        )
      }
      return (
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
          <code className="text-sm font-mono text-foreground">{children}</code>
        </pre>
      )
    },
    // Custom list styling
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-1 my-3 text-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-1 my-3 text-foreground">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-foreground leading-relaxed">{children}</li>
    ),
    // Custom paragraph styling
    p: ({ children }: any) => (
      <p className="text-foreground leading-relaxed mb-3">{children}</p>
    ),
    // Custom heading styling
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold text-foreground mb-4 mt-6">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold text-foreground mb-3 mt-5">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-medium text-foreground mb-2 mt-4">{children}</h3>
    ),
    // Custom blockquote styling
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
        {children}
      </blockquote>
    ),
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">AI-Generated Structured Summary</h2>
        <p className="text-muted-foreground">Comprehensive analysis of your research paper</p>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6 pr-4">
          {sectionConfig.map((section) => {
            const Icon = section.icon
            const content = summary[section.key as keyof StructuredSummary]
            
            if (!content || content.trim() === '') return null

            return (
              <Card key={section.key} className="glass-card border-glass-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${section.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-foreground">{section.title}</span>
                    <Badge variant="secondary" className="ml-auto">
                      AI Generated
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <Separator className="mb-4" />
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={markdownComponents}
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeRaw]}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}