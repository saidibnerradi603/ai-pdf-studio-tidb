export interface User {
  name: string;
  email: string;
  profilePicUrl?: string;
}



export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp?: Date;
}



// PDF Processing Types
export interface ProcessedPDF {
  id: string;
  user_id: string;
  pdf_name: string;
  extracted_text: string;
  size: number;
  uploaded_at: string;
  storage_path?: string; // Optional - not stored in DB but can be constructed
}

export interface PDFUploadProgress {
  stage: 'validating' | 'processing' | 'uploading' | 'saving' | 'complete';
  progress: number;
  message: string;
}