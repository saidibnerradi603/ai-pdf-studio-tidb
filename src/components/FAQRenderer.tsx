import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FAQOutput } from '@/services/aiService'
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  MessageSquare
} from 'lucide-react'
import { useState } from 'react'
import 'katex/dist/katex.min.css'

interface FAQRendererProps {
  faq: FAQOutput
}

export const FAQRenderer = ({ faq }: FAQRendererProps) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0])) // First item open by default

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
      <h1 className="text-xl font-bold text-foreground mb-4 mt-6">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-semibold text-foreground mb-3 mt-5">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base font-medium text-foreground mb-2 mt-4">{children}</h3>
    ),
    // Custom blockquote styling
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
        {children}
      </blockquote>
    ),
  }

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  const toggleAll = () => {
    if (openItems.size === faq.faqs.length) {
      setOpenItems(new Set())
    } else {
      setOpenItems(new Set(faq.faqs.map((_, index) => index)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text mb-2">AI-Generated FAQ</h2>
        <p className="text-muted-foreground">Frequently asked questions about your research paper</p>
        <div className="flex items-center justify-center space-x-4 mt-4">
          <Badge variant="outline" className="border-primary/30">
            {faq.faqs.length} Questions
          </Badge>
          <button
            onClick={toggleAll}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {openItems.size === faq.faqs.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4 pr-4">
          {faq.faqs.map((item, index) => (
            <Card key={index} className="glass-card border-glass-border">
              <Collapsible
                open={openItems.has(index)}
                onOpenChange={() => toggleItem(index)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                    <CardTitle className="flex items-center justify-between text-left">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <HelpCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <ReactMarkdown
                            components={markdownComponents}
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex, rehypeRaw]}
                          >
                            {item.question}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {openItems.has(index) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <Separator className="mb-4" />
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={markdownComponents}
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                      >
                        {item.answer}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}