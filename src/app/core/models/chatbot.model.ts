export interface ChatbotConfig {
  chatbot_name: string;
  description: string;
  industry: string;
  color: string;
  logo_file?: File;
  logo_preview: string;
  welcome_message: string;
  tone: string;
  system_prompt: string;
  temperature: number;
  urls: string[];
  kb_doc_ids: string[];
  kb_files?: File[];
  status?: string;
  updated_at?: string;
}

export interface KnowledgeSourceItem {
  id?: string;
  type: 'file' | 'url';
  name: string;
  file?: File;
  url?: string;
}

export interface ChatbotSummary {
  bot_id: string;
  chatbot_name: string;
  industry: string;
  active_users: number;
  conversations_count: number;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface FeedbackRequest {
  type: 'up' | 'down';
}

export interface TrackConversationRequest {
  visitor_id: string;
}
