from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Body, Header
from fastapi.responses import JSONResponse, HTMLResponse,HTMLResponse

from fastapi.middleware.cors import CORSMiddleware
from mistralai import Mistral
from mistralai import DocumentURLChunk, OCRResponse
from pathlib import Path
import json
import os
from typing import Optional, Dict, Any, List
import asyncio
import tempfile
import shutil
import uvicorn
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import uuid
from datetime import datetime
import hashlib
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate


from langchain_text_splitters import MarkdownTextSplitter
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import TiDBVectorStore
from langchain_google_genai import GoogleGenerativeAI
from langchain.schema import Document
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda


load_dotenv()



# TiDB Connection Parameters
TIDB_CONNECTION_PARAMS = {
    "host": os.getenv("TIDB_HOST", "gateway01.eu-central-1.prod.aws.tidbcloud.com"),
    "port": int(os.getenv("TIDB_PORT", 4000)),
    "user": os.getenv("TIDB_USER"),  # Replace with environment variable
    "password": os.getenv("TIDB_PASSWORD"),  # Replace with environment variable
    "database": os.getenv("TIDB_DATABASE", "test"),
    "ssl_verify_cert": True,
    "ssl_verify_identity": True
}

# Default table name for vector store
DEFAULT_TABLE_NAME = "pdf_embeddings"

# connection string for TiDB
def create_connection_string(params):
    """Create a connection string for TiDBVectorStore"""
    base_url = f"mysql+pymysql://{params['user']}:{params['password']}@{params['host']}:{params['port']}/{params['database']}"
    
    # Add SSL parameters
    ssl_params = []
    if params.get('ssl_verify_cert'):
        ssl_params.append("ssl_verify_cert=true")
    if params.get('ssl_verify_identity'):
        ssl_params.append("ssl_verify_identity=true")
    
    if ssl_params:
        base_url += "?" + "&".join(ssl_params)
    
    return base_url

# Create the embeddings model
def get_embeddings_model():
    """Initialize and return the Cohere embeddings model"""
    return CohereEmbeddings(model="embed-english-v3.0")

# Create the LLM
def get_llm():
    """Initialize and return the Google Generative AI model"""
    return GoogleGenerativeAI(model="gemini-2.5-flash")

# Prompt template for Q&A
QA_PROMPT_TEMPLATE = """
You are an expert Q&A assistant specialized in answering questions about PDF documents.

Your responses must be based **entirely** on the context provided below, as well as your general knowledge.

### Guidelines:
1. Provide a **clear**, **detailed**, and **well-structured** answer formatted in Markdown.
2. If the context lacks sufficient details, reply with:
   > The provided context does not contain enough information to answer this question.
3. Keep your tone professional and concise.

---

### Context:
{context}

---

### User Question:
{question}

---

### Answer:
"""

# Request models
class IndexPDFRequest(BaseModel):
    content: str = Field(..., description="The raw Markdown content of the PDF")
    pdf_name: str = Field(..., description="Name of the PDF document")

class ChatRequest(BaseModel):
    question: str = Field(..., description="User question about the PDF content")
    pdf_name: str = Field(..., description="Name of the PDF to query against")
   
# Response models
class IndexPDFResponse(BaseModel):
    success: bool
    message: str
    chunks_created: int
    pdf_name: str
    table_name: str

class ChatResponse(BaseModel):
    question: str
    answer: str

class CheckIndexRequest(BaseModel):
    pdf_name: str = Field(..., description="Name of the PDF to check")

class CheckIndexResponse(BaseModel):
    is_indexed: bool
    pdf_name: str
    message: str
  
  
  
  
  
  




class PaperInput(BaseModel):
    paper_markdown: str = Field(..., description="Full paper content in Markdown format")

class MarkdownSummary(BaseModel):
    summary: str = Field(..., description="Comprehensive narrative summary, in Markdown, may include tables, math, lists, etc.")
    background: str = Field(..., description="Background section in Markdown format.")
    problem: str = Field(..., description="Problem statement in Markdown.")
    methods: str = Field(..., description="Methods described in Markdown; may include tables and formulas.")
    experiments: str = Field(..., description="Experiments details in Markdown.")
    results: str = Field(..., description="Results in Markdown; can include bullet lists and math.")
    limitations: str = Field(..., description="Limitations in Markdown.")
    implications: str = Field(..., description="Implications in Markdown.")
    future_work: str = Field(..., description="Future work suggestions in Markdown.")


class QuizQuestion(BaseModel):
    question: str = Field(..., description="The quiz question")
    choices: list[str] = Field(..., description="List of 4 possible answers")
    correct_answer: str = Field(..., description="The correct answer (must match one of the choices)")
    explanation: str = Field(..., description="Explanation of why the answer is correct")

class QuizOutput(BaseModel):
    quiz: list[QuizQuestion] = Field(..., description="List of quiz questions generated from the paper")
    title: str = Field(..., description="Title of the quiz based on the paper content")








# Define model for FAQ generation endpoint
class FAQInput(BaseModel):
    paper_markdown: str = Field(..., description="Full paper content in Markdown format")
    num_questions: int = Field(5, description="Number of FAQs to generate", ge=1, le=10)

class FAQItem(BaseModel):
    question: str = Field(..., description="Frequently asked question")
    answer: str = Field(..., description="Detailed answer to the question")

class FAQOutput(BaseModel):
    faqs: list[FAQItem] = Field(..., description="List of frequently asked questions and answers")




# Create FastAPI application
app = FastAPI(docs_url="/docs", redoc_url=None,title="Research Paper Processing API", description="API to process PDF files and research papers")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-pdf-studio-tidb.vercel.app"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"], 
)

# Configuration
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB maximum file size
ALLOWED_EXTENSIONS = {"pdf"}

# Dependency to get Mistral API client
async def get_mistral_client():
    api_key = os.environ.get("MISTRAL_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Mistral API key not configured")
    return Mistral(api_key=api_key)

def validate_pdf_file(file: UploadFile) -> None:
    """Validate the uploaded file is a PDF within size limits"""
    # Check file extension
    file_extension = file.filename.split(".")[-1].lower() if file.filename else ""
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

def get_combined_markdown(ocr_response: OCRResponse) -> str:
    """
    Combine OCR text from all pages into a single markdown document.
    """
    markdowns: list[str] = []
    # Extract markdown from each page
    for page in ocr_response.pages:
        markdowns.append(page.markdown)

    return "\n\n".join(markdowns)

@app.post("/process-pdf", response_class=JSONResponse)
async def process_pdf(
    file: UploadFile = File(...),
    client: Mistral = Depends(get_mistral_client)
):
    """
    Process a PDF file using Mistral API for OCR and text extraction.
    
    - Accepts PDF files up to 5MB
    - Returns only the extracted text as a single combined markdown string
    """
    # Validate PDF file
    validate_pdf_file(file)
    
    # Create temporary file to store the uploaded PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        # Check file size during copy
        file_size = 0
        shutil.copyfileobj(file.file, temp_file)
        file_size = temp_file.tell()
        
        if file_size > MAX_FILE_SIZE:
            os.unlink(temp_file.name)
            raise HTTPException(status_code=400, detail=f"File size exceeds the maximum limit of 10MB")
        
        temp_file_path = Path(temp_file.name)
    
    try:
        # Upload PDF file to Mistral's OCR service
        uploaded_file = client.files.upload(
            file={
                "file_name": file.filename or "uploaded_pdf",
                "content": temp_file_path.read_bytes(),
            },
            purpose="ocr",
        )

        # Get URL for the uploaded file
        signed_url = client.files.get_signed_url(file_id=uploaded_file.id, expiry=1)

        # Process PDF with OCR, without including embedded images
        pdf_response = client.ocr.process(
            document=DocumentURLChunk(document_url=signed_url.url),
            model="mistral-ocr-latest",
            include_image_base64=False
        )

        # Create simplified response with only the markdown content
        simplified_response = {
            "extracted_text": get_combined_markdown(pdf_response)
        }
        
        return simplified_response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")
    
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)








@app.post("/structured-summary", response_model=MarkdownSummary)
async def generate_structured_summary(paper: PaperInput = Body(...)):
    """
    Generate a structured summary of a research paper in Markdown format.
    
    - Accepts a research paper in Markdown format
    - Returns a structured JSON summary with sections for summary, background, problem, methods,
      experiments, results, limitations, implications, and future_work
    """
    try:
        # Get API key from environment variable
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500, 
                detail="Google API key not configured. Please set the GOOGLE_API_KEY environment variable."
            )
        
        # Initialize the LLM model
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, api_key=api_key)
        
        # Create the prompt template
        prompt = ChatPromptTemplate.from_template(
            "You are an expert academic summarizer. Analyze this research paper in Markdown:\n\n"
            "{paper_markdown}\n\n"
            "Provide your response as strict JSON, following this schema with each field using Markdown formatting:\n"
            "- summary\n- background\n- problem\n- methods\n- experiments\n- results\n- limitations\n- implications\n- future_work\n\n"
            "Each section may include Markdown tables, inline or block LaTeX math ($...$, $$...$$), bullet points, code blocks, etc.\n\n"
        )
        
        # Create structured output model
        structured_llm = llm.with_structured_output(MarkdownSummary)
        
        # Create and invoke the chain
        chain = prompt | structured_llm
        result = chain.invoke({"paper_markdown": paper.paper_markdown})
        
        # Return the structured summary
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")









# Pydantic models for quiz generator

@app.post("/generate-quiz", response_model=QuizOutput)
async def generate_quiz(paper: PaperInput = Body(...)):
    """
    Generate a quiz based on a research paper.
    
    - Accepts a research paper in Markdown format
    - Returns a structured quiz with 15 multiple-choice questions, answers, and explanations
    """
    try:
        # Get API key from environment variable
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500, 
                detail="Google API key not configured. Please set the GOOGLE_API_KEY environment variable."
            )
        
        # Initialize the LLM model
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, api_key=api_key)
        
        # Create the prompt template for quiz generation
        prompt = ChatPromptTemplate.from_template(
            "You are an expert education content creator. Analyze this pdf in Markdown format:\n\n"
            "{paper_markdown}\n\n"
            "Create a comprehensive quiz to test understanding of the key concepts, methodologies, and findings "
            "in this paper. Follow these guidelines:\n\n"
            "1. Generate exactly 15 multiple-choice questions covering the most important aspects of the paper\n"
            "2. Each question should have exactly 4 answer choices (A, B, C, D)\n"
            "3. Provide one correct answer per question\n"
            "4. Include a brief explanation for why the correct answer is right\n"
            "5. Ensure questions assess both factual knowledge and conceptual understanding\n"
            "6. Create a title for the quiz that reflects the paper's content\n\n"
            "Structure your response as a JSON object with a 'title' field and a 'quiz' array containing question objects. "
            "Each question object should have 'question', 'choices', 'correct_answer', and 'explanation' fields.\n\n"
            "Make sure the correct_answer exactly matches one of the provided choices."
        )
        
        # Create structured output model
        structured_llm = llm.with_structured_output(QuizOutput)
        
        # Create and invoke the chain
        chain = prompt | structured_llm
        result = chain.invoke({"paper_markdown": paper.paper_markdown})
        
        # Return the quiz
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")
    




    
    
    
    



@app.post("/mind-map", response_class=HTMLResponse)
async def generate_mind_map(paper: PaperInput = Body(...)):
    """
    Generate a mind map of a research paper in markmap format and return a full HTML page.
    
    - Accepts a research paper in Markdown format
    - Returns an HTML page rendering the mind map
    """
    try:
        # Get API key from environment variable
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500, 
                detail="Google API key not configured. Please set the GOOGLE_API_KEY environment variable."
            )
        
        # Initialize the LLM model
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, api_key=api_key)
        
        # Create the prompt template for mind map generation
        prompt = ChatPromptTemplate.from_template(
            "You are an expert at creating detailed mind maps from academic research papers. "
            "Analyze this research paper in Markdown format:\n\n"
            "{paper_markdown}\n\n"
            "Create a comprehensive hierarchical mind map in markmap markdown format "
            "capturing the key concepts, relationships, and findings from the paper. "
            "The mind map should be detailed but only include markmap-compatible content."
        )
        
        # Structured output model
        class MarkMapResponse(BaseModel):
            markmap: str
        
        structured_llm = llm.with_structured_output(MarkMapResponse)
        
        # Invoke the chain
        chain = prompt | structured_llm
        result = chain.invoke({"paper_markdown": paper.paper_markdown})
        
        # Build the HTML page
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mindmap for PDF </title>
    <style>
        .markmap-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }}
        
        .markmap-card {{
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        
        .markmap-card h3 {{
            margin-top: 0;
            color: #333;
            border-bottom: 2px solid #007acc;
            padding-bottom: 10px;
       }}
        
        .markmap {{
            height: 800px;
            border: 1px solid #eee;
            border-radius: 4px;
            margin-top: 10px;
        }}
        
        .markmap > svg {{
            width: 100%;
            height: 100%;
        }}
        
        body {{
            font-family: Arial, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }}
        
        h1 {{
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }}
    </style>
</head>
<body>
    <h1>Mindmap</h1>
      
    <div class="markmap-grid">

        
        <!-- Mindmap 2: Software Architecture -->
        <div class="markmap-card">
            <div class="markmap">
              {result.markmap}
            </div>
        </div>
   </div>
    <script src="https://cdn.jsdelivr.net/npm/markmap-autoloader@0.18.12/dist/index.js"></script>
</body>
</html>
"""
        # Return HTML response
        return HTMLResponse(content=html_content)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mind map generation failed: {str(e)}")    
  
  
# Helper function to check if PDF exists in vector store
def check_pdf_exists(pdf_name: str) -> bool:
    """
    Check if a PDF is already indexed in the vector store by performing a test query.
    Returns True if the PDF exists (has indexed chunks), False otherwise.
    """
    try:
        # Get embeddings model
        embeddings = get_embeddings_model()
        
        # Create connection string
        connection_string = create_connection_string(TIDB_CONNECTION_PARAMS)
        
        # Initialize the vector store
        db = TiDBVectorStore(
            embedding_function=embeddings,
            connection_string=connection_string,
            table_name=DEFAULT_TABLE_NAME,
            distance_strategy="cosine"
        )
        
        # Create retriever with filter for the specific PDF
        retriever = db.as_retriever(
            search_type="similarity", 
            search_kwargs={
                "k": 5, 
                "filter": {"source": pdf_name}
            }
        )
        
        # Test question to check if PDF exists
        test_question = "What are neural networks, and how do they work?"
        
        # Try to retrieve documents
        retrieved_docs = retriever.invoke(test_question)
        
        # Return True if we found any documents, False otherwise
        return len(retrieved_docs) > 0
        
    except Exception as e:
        print(f"Error querying TiDB: {e}")
        return False

# Endpoints


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Answer questions about PDF content by:
    1. Retrieving relevant chunks from the vector database
    2. Using RAG to generate an answer based on the retrieved context
    """
    try:
        # Get embeddings model
        embeddings = get_embeddings_model()
        
        # Determine table name
        table_name = DEFAULT_TABLE_NAME
        
        # Create connection string
        connection_string = create_connection_string(TIDB_CONNECTION_PARAMS)
        
        # Initialize the vector store
        db = TiDBVectorStore(
            embedding_function=embeddings,
            connection_string=connection_string,
            table_name=table_name,
            distance_strategy="cosine"
        )
        
        # Create retriever with filter for the specific PDF
        retriever = db.as_retriever(
            search_type="similarity", 
            search_kwargs={
                "k": 5, 
                "filter": {"source": request.pdf_name}
            }
        )
        
        # Format documents function
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)
        
        # Create prompt template
        prompt = PromptTemplate.from_template(QA_PROMPT_TEMPLATE)
        
        # Get LLM
        llm = get_llm()
        
        # Create RAG chain
        rag_chain = (
            {
                "context": retriever | RunnableLambda(format_docs), 
                "question": RunnablePassthrough()
            }
            | prompt
            | llm
        )
        
        # Execute the chain
        retrieved_docs = retriever.invoke(request.question)
        answer = rag_chain.invoke(request.question)
        
        return ChatResponse(
            question=request.question,
            answer=answer
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")

@app.post("/check-index", response_model=CheckIndexResponse)
async def check_index(request: CheckIndexRequest):
    """
    Check if a PDF is already indexed in the vector store.
    Returns the indexing status without performing any indexing operations.
    """
    try:
        is_indexed = check_pdf_exists(request.pdf_name)
        
        if is_indexed:
            message = f"PDF '{request.pdf_name}' is already indexed and ready for chat"
        else:
            message = f"PDF '{request.pdf_name}' is not indexed yet. Click 'Index PDF' to enable chat"
        
        return CheckIndexResponse(
            is_indexed=is_indexed,
            pdf_name=request.pdf_name,
            message=message
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking index status: {str(e)}")

@app.post("/index-pdf", response_model=IndexPDFResponse)
async def index_pdf(request: IndexPDFRequest):
    """
    Index PDF content by:
    1. First checking if the PDF is already indexed
    2. If not indexed, splitting the markdown content into chunks
    3. Creating embeddings for each chunk
    4. Storing the embeddings in a vector database
    """
    try:
        # First check if PDF is already indexed
        if check_pdf_exists(request.pdf_name):
            return IndexPDFResponse(
                success=True,
                message=f"PDF '{request.pdf_name}' is already indexed",
                chunks_created=0,
                pdf_name=request.pdf_name,
                table_name=DEFAULT_TABLE_NAME
            )
        
        # Initialize the text splitter with default values
        splitter = MarkdownTextSplitter(
            chunk_size=1500,  # Default chunk size
            chunk_overlap=200,  # Default chunk overlap
            keep_separator=True,
            is_separator_regex=False
        )
        
        # Split the text into chunks
        chunks = splitter.split_text(request.content)
        
        # Create document objects with metadata
        documents = [
            Document(
                page_content=chunk, 
                metadata={"source": request.pdf_name}
            ) 
            for chunk in chunks
        ]
        
        # Get embeddings model
        embeddings = get_embeddings_model()
        
        # Use default table name
        table_name = DEFAULT_TABLE_NAME
        
        # Create connection string
        connection_string = create_connection_string(TIDB_CONNECTION_PARAMS)
        
        # Store documents in the vector database
        db = TiDBVectorStore.from_documents(
            documents=documents,
            embedding=embeddings,
            table_name=table_name,
            connection_string=connection_string,
            distance_strategy="cosine",
        )
        
        return IndexPDFResponse(
            success=True,
            message=f"Successfully indexed {len(chunks)} chunks from PDF",
            chunks_created=len(chunks),
            pdf_name=request.pdf_name,
            table_name=table_name
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error indexing PDF: {str(e)}")







@app.post("/generate-faqs", response_model=FAQOutput)
async def generate_faqs(faq_input: FAQInput = Body(...)):
    """
    Generate frequently asked questions and answers based on a research paper.
    
    - Accepts a research paper in Markdown format
    - Returns a list of FAQ items with questions and detailed answers
    - The number of questions can be customized (default: 5, max: 10)
    """
    try:
        # Get API key from environment variable
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500, 
                detail="Google API key not configured. Please set the GOOGLE_API_KEY environment variable."
            )
        
        # Initialize the LLM model
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, api_key=api_key)
        
        # Create the prompt template for FAQ generation
        prompt = ChatPromptTemplate.from_template(
            "You are an expert at creating comprehensive FAQs for academic research papers. "
            "Analyze this research paper in Markdown format:\n\n"
            "{paper_markdown}\n\n"
            "Generate {num_questions} frequently asked questions with detailed answers that would be most helpful "
            "for someone trying to understand this paper. Focus on key concepts, methodologies, findings, and implications. "
            "The questions should be clear and specific, and the answers should be thorough, accurate, and educational.\n\n"
            "Format your response as a JSON array of objects, each with 'question' and 'answer' fields."
        )
        
        # Create structured output model
        structured_llm = llm.with_structured_output(FAQOutput)
        
        # Create and invoke the chain
        chain = prompt | structured_llm
        result = chain.invoke({
            "paper_markdown": faq_input.paper_markdown,
            "num_questions": faq_input.num_questions
        })
        
        # Return the generated FAQs
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FAQ generation failed: {str(e)}")
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 
