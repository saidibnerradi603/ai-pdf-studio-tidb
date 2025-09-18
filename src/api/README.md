
# AI PDF Studio Backend API

  

## 🏆 TiDB AgentX Hackathon 2025 Submission

  

This FastAPI backend demonstrates the power of **TiDB Serverless Vector Database** for building intelligent document processing agents. Our implementation showcases the complete TiDB AgentX workflow from data ingestion to multi-step AI processing.

  

## 🎯 TiDB AgentX Workflow Implementation

  

### 1. **Ingest & Index Data** 📥

-  **PDF Upload**: Accept research papers, articles, and documents via `/process-pdf`

-  **OCR Processing**: Extract text using Mistral AI's advanced OCR capabilities

-  **Vector Indexing**: Store document chunks in **TiDB Serverless** with Cohere embeddings

-  **Metadata Storage**: Track document information and processing status

  

### 2. **Search Your Data** 🔍

-  **Vector Search**: Query TiDB's vector indexes for semantic similarity

-  **RAG Implementation**: Retrieve relevant document chunks for context

-  **Multi-PDF Support**: Search across multiple indexed documents simultaneously

-  **Real-time Status**: Check indexing status with `/check-index`

  

### 3. **Chain LLM Calls** 🤖

-  **Google Gemini Integration**: Advanced text analysis and generation

-  **Structured Outputs**: Generate summaries, quizzes, FAQs, and mind maps

-  **Context-Aware Responses**: Use TiDB-retrieved context for accurate answers

-  **Multi-step Processing**: Chain multiple AI operations for complex workflows

  

### 4. **Invoke External Tools** 🔧

-  **Mistral OCR**: Professional document text extraction

-  **Cohere Embeddings**: High-quality vector representations

-  **Supabase Integration**: User authentication and file storage

-  **Real-time Chat**: Interactive Q&A with document content

  

### 5. **Build Multi-Step Flow** 🔄

Complete automated process: **PDF Upload** → **OCR** → **TiDB Indexing** → **AI Analysis** → **Interactive Chat**

  

## 🚀 Quick Start

  

### Prerequisites

- Python 3.8+

- TiDB Serverless account

- API keys for Mistral, Google Gemini, and Cohere

  

### Installation

  

1.  **Install Dependencies**

```bash

pip  install  -r  requirements.txt

```

  

2.  **Environment Setup**

```bash

# Copy and configure environment variables

cp  .env.example  .env

  

# Required API Keys

MISTRAL_API_KEY=your_mistral_api_key

GOOGLE_API_KEY=your_google_gemini_api_key

COHERE_API_KEY=your_cohere_api_key

  

# TiDB Serverless Configuration

TIDB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com

TIDB_PORT=4000

TIDB_USER=your_tidb_user

TIDB_PASSWORD=your_tidb_password

TIDB_DATABASE=test

```

  

3.  **Start the Server**

```bash

python  main.py

```

  

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`

  

## 📊 TiDB Vector Database Architecture

  

### Connection Configuration

```python

TIDB_CONNECTION_PARAMS = {

"host": "gateway01.eu-central-1.prod.aws.tidbcloud.com",

"port": 4000,

"user": os.getenv("TIDB_USER"),

"password": os.getenv("TIDB_PASSWORD"),

"database": "test",

"ssl_verify_cert": True,

"ssl_verify_identity": True

}

```

  

### Vector Storage Implementation

-  **Table**: `pdf_embeddings` (auto-created)

-  **Embeddings**: Cohere `embed-english-v3.0` model

-  **Distance**: Cosine similarity for optimal semantic search

-  **Chunking**: 1500 characters with 200 character overlap

-  **Metadata**: Source PDF name for filtered retrieval

  

### RAG Pipeline

```python

# 1. Create embeddings and store in TiDB

embeddings = CohereEmbeddings(model="embed-english-v3.0")

db = TiDBVectorStore.from_documents(

documents=chunks,

embedding=embeddings,

table_name="pdf_embeddings",

connection_string=tidb_connection,

distance_strategy="cosine"

)

  

# 2. Retrieve relevant context

retriever = db.as_retriever(

search_type="similarity",

search_kwargs={"k": 5, "filter": {"source": pdf_name}}

)

  

# 3. Generate contextual responses

rag_chain = (

{"context": retriever | format_docs, "question": RunnablePassthrough()}

| prompt_template

| llm

)

```

  

## 🛠 API Endpoints

  

### Core TiDB Operations

  

####  **POST /index-pdf**

Index PDF content in TiDB vector database

```json

{

"content":  "PDF markdown content",

"pdf_name":  "research_paper.pdf"

}

```

  

####  **POST /chat**

Query indexed documents using RAG

```json

{

"question":  "What are the main findings?",

"pdf_name":  "research_paper.pdf"

}

```

  

####  **POST /check-index**

Check if PDF is indexed in TiDB

```json

{

"pdf_name":  "research_paper.pdf"

}

```

  

### AI Content Generation

  

####  **POST /process-pdf**

Extract text from PDF using Mistral OCR

- Upload PDF file (max 5MB)

- Returns markdown-formatted text

  

####  **POST /structured-summary**

Generate comprehensive summaries using Gemini

- 9 structured sections (background, methods, results, etc.)

- Markdown formatting with LaTeX support

  

####  **POST /generate-quiz**

Create interactive quizzes

- 15 multiple-choice questions

- Explanations for each answer

  

####  **POST /generate-faqs**

Generate frequently asked questions

- Customizable number of questions (1-10)

- Detailed answers with context

  

####  **POST /mind-map**

Create visual mind maps

- Interactive HTML output

- Hierarchical knowledge structure

  

## 🏗 Architecture Highlights

  

### TiDB Integration Benefits

-  **Serverless Scaling**: Automatic scaling based on workload

-  **Vector Search**: Native support for similarity search

-  **ACID Compliance**: Reliable data consistency

-  **MySQL Compatibility**: Easy integration with existing tools

-  **Cost Effective**: Pay-per-use pricing model

  

### Performance Optimizations

-  **Connection Pooling**: Efficient database connections

-  **Async Processing**: Non-blocking API operations

-  **Chunking Strategy**: Optimal text segmentation for retrieval

-  **Caching**: Reduced API calls and improved response times

  

### Security Features

-  **SSL/TLS**: Encrypted connections to TiDB

-  **API Key Management**: Secure credential handling

-  **Input Validation**: Comprehensive request validation

-  **Error Handling**: Graceful failure management

  

## 📈 Monitoring & Debugging

  

### Health Checks

```bash

# Check API status

curl  http://localhost:8000/docs

  

# Test TiDB connection

curl  -X  POST  http://localhost:8000/check-index \

-H "Content-Type: application/json" \

-d  '{"pdf_name": "test.pdf"}'

```

  

### Logging

- Comprehensive error logging

- TiDB query performance tracking

- API request/response monitoring

  

## 🎯 Hackathon Demonstration

  

This backend showcases:

1.  **Real-world Application**: Professional document processing system

2.  **TiDB Excellence**: Advanced vector search and RAG implementation

3.  **Multi-AI Integration**: Mistral, Gemini, and Cohere working together

4.  **Production Ready**: Comprehensive error handling and security

5.  **Scalable Architecture**: Designed for enterprise deployment

  

## 🔧 Development

  

### Running Tests

```bash

# Test PDF processing

curl  -X  POST  http://localhost:8000/process-pdf \

-F "file=@sample.pdf"

  

# Test vector indexing

curl  -X  POST  http://localhost:8000/index-pdf \

-H "Content-Type: application/json" \

-d  '{"content": "Sample content", "pdf_name": "test.pdf"}'

  

# Test RAG chat

curl  -X  POST  http://localhost:8000/chat \

-H "Content-Type: application/json" \

-d  '{"question": "What is this about?", "pdf_name": "test.pdf"}'

```

  

### Database Schema

The TiDB vector table named **pdf_embeddings** is automatically created with:

| Column      | Type        | Description                       |
|-------------|------------|-----------------------------------|
| id          | VARCHAR / INT (PK) | Unique identifier for each record |
| embedding   | VECTOR / BLOB      | Stores the embedding values        |
| document    | TEXT               | Original document text or reference|
| meta        | JSON               | Metadata related to the document   |
| create_time | TIMESTAMP          | Record creation time               |
| update_time | TIMESTAMP          | Last update time                   |

  

## 🏆 TiDB AgentX Excellence

  


-  **Seamless Vector Operations**: Native vector search without complex setup

-  **Hybrid Workloads**: Combining transactional and analytical operations

-  **Developer Experience**: Simple integration with popular AI frameworks

-  **Enterprise Scale**: Production-ready performance and reliability

  

Built for **TiDB AgentX Hackathon 2025** - showcasing the future of AI-powered document intelligence! 🚀