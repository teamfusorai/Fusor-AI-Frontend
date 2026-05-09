export interface QueryRequest {
  user_id: string;
  bot_id: string;
  query: string;
  session_id?: string;
}

export interface QueryResponse {
  answer: string;
  sources?: any[];
  session_id: string;
}
