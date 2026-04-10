export interface ChatbotBasicInfo {
  name: string;
  industry: string;
  customIndustry?: string;
  description?: string;
}

export interface ChatbotCustomization {
  primaryColor: string;
  logoUrl: string | null;
  welcomeMessage: string;
}

// Global Chatbot Creation State
export interface ChatbotCreationState {
  basicInfo: ChatbotBasicInfo;
  customization: ChatbotCustomization;
  isDirty: boolean; // Tracking if user modified things without saving/moving forward properly
}
