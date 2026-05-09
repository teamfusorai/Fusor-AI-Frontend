export interface KnowledgeBaseItem {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'Completed' | 'Processing' | 'Failed';
  uploaded_at: string;
  bot_id?: string;
  user_id?: string;
}

export interface KnowledgeBaseStats {
  total_docs: number;
  total_size: number;
  processing_count: number;
  success_rate: number;
}

export interface KnowledgeBaseResponse {
  stats: KnowledgeBaseStats;
  documents: KnowledgeBaseItem[];
}
