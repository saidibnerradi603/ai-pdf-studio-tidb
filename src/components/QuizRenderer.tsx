import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { QuizOutput, QuizQuestion } from '@/services/aiService'
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Trophy,
  Brain,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import 'katex/dist/katex.min.css'

interface QuizRendererProps {
  quiz: QuizOutput
}

interface QuizState {
  currentQuestion: number
  selectedAnswers: { [key: number]: string }
  showResults: boolean
  showExplanations: boolean
}

export const QuizRenderer = ({ quiz }: QuizRendererProps) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswers: {},
    showResults: false,
    showExplanations: false
  })

  const markdownComponents = {
    // Custom styling for quiz content
    p: ({ children }: any) => (
      <span className="text-foreground leading-relaxed">{children}</span>
    ),
    code: ({ inline, children }: any) => {
      if (inline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            {children}
          </code>
        )
      }
      return (
        <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2">
          <code className="text-sm font-mono text-foreground">{children}</code>
        </pre>
      )
    },
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-1 my-2 text-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-1 my-2 text-foreground">
        {children}
      </ol>
    ),
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [questionIndex]: answer
      }
    }))
  }

  const handleNextQuestion = () => {
    if (quizState.currentQuestion < quiz.quiz.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }))
    }
  }

  const handlePrevQuestion = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }))
    }
  }

  const handleSubmitQuiz = () => {
    setQuizState(prev => ({
      ...prev,
      showResults: true,
      showExplanations: true
    }))
  }

  const handleResetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      selectedAnswers: {},
      showResults: false,
      showExplanations: false
    })
  }

  const calculateScore = () => {
    let correct = 0
    quiz.quiz.forEach((question, index) => {
      if (quizState.selectedAnswers[index] === question.correct_answer) {
        correct++
      }
    })
    return { correct, total: quiz.quiz.length, percentage: Math.round((correct / quiz.quiz.length) * 100) }
  }

  const isAnswerCorrect = (questionIndex: number) => {
    const selectedAnswer = quizState.selectedAnswers[questionIndex]
    const correctAnswer = quiz.quiz[questionIndex].correct_answer
    return selectedAnswer === correctAnswer
  }

  const currentQuestion = quiz.quiz[quizState.currentQuestion]
  const progress = ((quizState.currentQuestion + 1) / quiz.quiz.length) * 100
  const score = quizState.showResults ? calculateScore() : null

  if (quizState.showResults) {
    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Results Header - Fixed */}
        <div className="text-center flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold gradient-text mb-1">Quiz Complete!</h2>
          <p className="text-sm text-muted-foreground">Here are your results</p>
        </div>

        {/* Score Card - Fixed */}
        <div className="flex-shrink-0">
          <Card className="glass-card border-glass-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Final Score</span>
                <Badge variant={score!.percentage >= 70 ? "default" : "destructive"} className="text-sm px-3 py-1">
                  {score!.correct}/{score!.total} ({score!.percentage}%)
                </Badge>
              </div>
              <Progress value={score!.percentage} className="mb-3" />
              <div className="flex justify-center">
                <Button onClick={handleResetQuiz} variant="outline" className="glass-card" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results List - Scrollable */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-4">
              {quiz.quiz.map((question, index) => (
                <Card key={index} className="glass-card border-glass-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <span className="text-xs bg-muted px-2 py-1 rounded flex-shrink-0">Q{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-relaxed">
                          <ReactMarkdown
                            components={markdownComponents}
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex, rehypeRaw]}
                          >
                            {question.question}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {isAnswerCorrect(index) ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      {question.choices.map((choice, choiceIndex) => {
                        const isSelected = quizState.selectedAnswers[index] === choice
                        const isCorrect = choice === question.correct_answer
                        
                        return (
                          <div
                            key={choiceIndex}
                            className={`p-2 rounded text-sm border ${
                              isCorrect 
                                ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                                : isSelected 
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                                  : 'border-border bg-muted/20'
                            }`}
                          >
                            <ReactMarkdown
                              components={markdownComponents}
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex, rehypeRaw]}
                            >
                              {choice}
                            </ReactMarkdown>
                          </div>
                        )
                      })}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Explanation
                      </h4>
                      <div className="text-sm">
                        <ReactMarkdown
                          components={markdownComponents}
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex, rehypeRaw]}
                        >
                          {question.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header - Fixed */}
      <div className="text-center flex-shrink-0">
        <h2 className="text-xl font-bold gradient-text mb-1">{quiz.title}</h2>
        <p className="text-sm text-muted-foreground">Answer all questions to test your understanding</p>
      </div>

      {/* Progress Bar - Fixed */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Question {quizState.currentQuestion + 1} of {quiz.quiz.length}</span>
          </span>
          <Badge variant="outline" className="text-xs">
            {Object.keys(quizState.selectedAnswers).length}/{quiz.quiz.length} answered
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Content - Scrollable */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="pr-4 space-y-4">
            <Card className="glass-card border-glass-border">
              <CardContent className="p-6 space-y-4">
                {/* Question */}
                <div className="text-base font-medium leading-relaxed">
                  <ReactMarkdown
                    components={markdownComponents}
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                  >
                    {currentQuestion.question}
                  </ReactMarkdown>
                </div>

                {/* Answer Choices */}
                <div className="space-y-3">
                  {currentQuestion.choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant={quizState.selectedAnswers[quizState.currentQuestion] === choice ? "default" : "outline"}
                      className={`w-full justify-start text-left h-auto p-4 glass-card whitespace-normal ${
                        quizState.selectedAnswers[quizState.currentQuestion] === choice 
                          ? 'btn-gradient' 
                          : 'hover:border-primary/40'
                      }`}
                      onClick={() => handleAnswerSelect(quizState.currentQuestion, choice)}
                    >
                      <div className="w-full text-left">
                        <ReactMarkdown
                          components={markdownComponents}
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex, rehypeRaw]}
                        >
                          {choice}
                        </ReactMarkdown>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="flex-shrink-0 pt-4 border-t border-glass-border">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={quizState.currentQuestion === 0}
            className="glass-card"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {quizState.currentQuestion === quiz.quiz.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizState.selectedAnswers).length !== quiz.quiz.length}
                className="btn-gradient"
                size="sm"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!quizState.selectedAnswers[quizState.currentQuestion]}
                className="btn-gradient"
                size="sm"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}