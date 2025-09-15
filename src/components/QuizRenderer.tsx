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
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground">Here are your results</p>
        </div>

        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Final Score</span>
              <Badge variant={score!.percentage >= 70 ? "default" : "destructive"} className="text-lg px-4 py-2">
                {score!.correct}/{score!.total} ({score!.percentage}%)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={score!.percentage} className="mb-4" />
            <div className="flex justify-center space-x-4">
              <Button onClick={handleResetQuiz} variant="outline" className="glass-card">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-4 pr-4">
            {quiz.quiz.map((question, index) => (
              <Card key={index} className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <span className="text-sm bg-muted px-2 py-1 rounded">Q{index + 1}</span>
                    <div className="flex-1">
                      <ReactMarkdown
                        components={markdownComponents}
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                      >
                        {question.question}
                      </ReactMarkdown>
                    </div>
                    {isAnswerCorrect(index) ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {question.choices.map((choice, choiceIndex) => {
                      const isSelected = quizState.selectedAnswers[index] === choice
                      const isCorrect = choice === question.correct_answer
                      
                      return (
                        <div
                          key={choiceIndex}
                          className={`p-3 rounded-lg border ${
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
                  
                  <Separator />
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Explanation
                    </h4>
                    <ReactMarkdown
                      components={markdownComponents}
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeRaw]}
                    >
                      {question.explanation}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">{quiz.title}</h2>
        <p className="text-muted-foreground">Answer all questions to test your understanding</p>
      </div>

      <Card className="glass-card border-glass-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Question {quizState.currentQuestion + 1} of {quiz.quiz.length}</span>
            </CardTitle>
            <Badge variant="outline">
              {Object.keys(quizState.selectedAnswers).length}/{quiz.quiz.length} answered
            </Badge>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
            >
              {currentQuestion.question}
            </ReactMarkdown>
          </div>

          <div className="space-y-3">
            {currentQuestion.choices.map((choice, index) => (
              <Button
                key={index}
                variant={quizState.selectedAnswers[quizState.currentQuestion] === choice ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto p-4 glass-card ${
                  quizState.selectedAnswers[quizState.currentQuestion] === choice 
                    ? 'btn-gradient' 
                    : 'hover:border-primary/40'
                }`}
                onClick={() => handleAnswerSelect(quizState.currentQuestion, choice)}
              >
                <ReactMarkdown
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                >
                  {choice}
                </ReactMarkdown>
              </Button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={quizState.currentQuestion === 0}
              className="glass-card"
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
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!quizState.selectedAnswers[quizState.currentQuestion]}
                  className="btn-gradient"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}