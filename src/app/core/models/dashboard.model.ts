export interface DashboardMetrics {
  total_conversations: number;
  unique_users: number;
  total_cost: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
}

export interface AnalyticsResponse {
  total_conversations: number;
  total_cost: number;
  avg_latency: number;
  unique_users: number;
  convo_trend: ConvoTrendItem[];
  top_queries: TopQuery[];
  top_intents: TopIntent[];
}

export interface ConvoTrendItem {
  day: string;
  count: number;
  cost?: number;
}

export interface TopQuery {
  query: string;
  count: number;
  bot_id: string;
  chatbot_name: string;
}

export interface TopIntent {
  name: string;
  count: number;
  percentage: number;
}
