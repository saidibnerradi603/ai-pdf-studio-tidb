import { ProcessedPDF } from '@/types'

// Configuration
const PROCESSING_API_URL = import.meta.env.VITE_PROCESSING_API_URL

// Types for structured summary
export interface StructuredSummary {
  summary: string
  background: string
  problem: string
  methods: string
  experiments: string
  results: string
  limitations: string
  implications: string
  future_work: string
}

// Types for quiz generation
export interface QuizQuestion {
  question: string
  choices: string[]
  correct_answer: string
  explanation: string
}

export interface QuizOutput {
  title: string
  quiz: QuizQuestion[]
}

export interface PaperInput {
  paper_markdown: string
}

// Types for chat functionality
export interface IndexPDFRequest {
  content: string
  pdf_name: string
}

export interface IndexPDFResponse {
  success: boolean
  message: string
  chunks_created: number
  pdf_name: string
  table_name: string
}

export interface ChatRequest {
  question: string
  pdf_name: string
}

export interface ChatResponse {
  question: string
  answer: string
}

export interface CheckIndexRequest {
  pdf_name: string
}

export interface CheckIndexResponse {
  is_indexed: boolean
  pdf_name: string
  message: string
}

// Types for FAQ generation
export interface FAQInput {
  paper_markdown: string
  num_questions: number
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQOutput {
  faqs: FAQItem[]
}

class AIService {
  /**
   * Generate structured summary from PDF extracted text
   */
  async generateStructuredSummary(pdf: ProcessedPDF): Promise<StructuredSummary> {
    if (!pdf.extracted_text) {
      throw new Error('No extracted text available for this PDF')
    }

    const requestBody: PaperInput = {
      paper_markdown: pdf.extracted_text
    }

    const response = await fetch(`${PROCESSING_API_URL}/structured-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result: StructuredSummary = await response.json()
    return result
  }

  /**
   * Generate quiz from PDF extracted text
   */
  async generateQuiz(pdf: ProcessedPDF): Promise<QuizOutput> {
    if (!pdf.extracted_text) {
      throw new Error('No extracted text available for this PDF')
    }

    const requestBody: PaperInput = {
      paper_markdown: pdf.extracted_text
    }

    const response = await fetch(`${PROCESSING_API_URL}/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result: QuizOutput = await response.json()
    return result
  }

  /**
   * Generate mind map HTML from PDF extracted text
   */
  async generateMindMap(pdf: ProcessedPDF): Promise<string> {
    if (!pdf.extracted_text) {
      throw new Error('No extracted text available for this PDF')
    }

    const requestBody: PaperInput = {
      paper_markdown: pdf.extracted_text
    }

    const response = await fetch(`${PROCESSING_API_URL}/mind-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    // Return the HTML content as string
    const htmlContent = await response.text()
    return htmlContent
  }

  /**
   * Generate FAQ from PDF extracted text
   */
  async generateFAQ(pdf: ProcessedPDF, numQuestions: number = 5): Promise<FAQOutput> {
    if (!pdf.extracted_text) {
      throw new Error('No extracted text available for this PDF')
    }

    const requestBody: FAQInput = {
      paper_markdown: pdf.extracted_text,
      num_questions: numQuestions
    }

    const response = await fetch(`${PROCESSING_API_URL}/generate-faqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result: FAQOutput = await response.json()
    return result
  }

  /**
   * Index PDF content for chat functionality
   */
  async indexPDF(pdf: ProcessedPDF): Promise<IndexPDFResponse> {
    if (!pdf.extracted_text) {
      throw new Error('No extracted text available for this PDF')
    }

    const requestBody: IndexPDFRequest = {
      content: pdf.extracted_text,
      pdf_name: pdf.pdf_name
    }

    const response = await fetch(`${PROCESSING_API_URL}/index-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result: IndexPDFResponse = await response.json()
    return result
  }

  /**
   * Chat with indexed PDF content
   */
  async chatWithPDF(question: string, pdfName: string): Promise<ChatResponse> {
    const requestBody: ChatRequest = {
      question: question,
      pdf_name: pdfName
    }

    const response = await fetch(`${PROCESSING_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result: ChatResponse = await response.json()
    return result
  }

  /**
   * Check if PDF is already indexed in vector store
   */
  async checkPDFIndexStatus(pdfName: string): Promise<CheckIndexResponse> {
    const requestBody: CheckIndexRequest = {
      pdf_name: pdfName
    }

    const response = await fetch(`${PROCESSING_API_URL}/check-index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result: CheckIndexResponse = await response.json()
    return result
  }
}

export const aiService = new AIService()